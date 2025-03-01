import type ToolkitPlugin from "../main";
import { Notice, requestUrl } from "obsidian";
import { youtube_v3 } from '@googleapis/youtube';
import * as cheerio from 'cheerio';
import { fetchUrl } from "../web/web-client";

export interface VideoDetails {
  videoId: string;
  link: string;
  title: string;
  description: string;
  publishedAt: string;
  duration?: string | null | undefined;
  channelTitle: string;
  defaultLanguage: string;
  defaultAudioLanguage: string;
  thumbnailUrl: string;
  transcript: TranscriptChunk[] | null | undefined;
}

export interface PlaylistDetails {
  title: string;
  description: string;
  itemCount: number;
  videoIds: string[];
}

export interface ChannelDetails {
  title: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  uploadsPlaylistId: string;
  videoIds: string[];
}

export interface VideoData {
  videoId: string;
  title: string;
  description: string | null | undefined;
  likeCount?: number;
  duration?: string | null | undefined;
  publishedAt?: string | null | undefined;
}

interface CaptionTrack {
  languageCode: string;
  baseUrl: string;
}

export interface TranscriptChunk {
  start: string;
  script: string | undefined;
}

class YoutubeApi {
  private plugin: ToolkitPlugin;
  private youtube: youtube_v3.Youtube;

  constructor(plugin: ToolkitPlugin) {
    this.plugin = plugin;
    this.youtube = new youtube_v3.Youtube({ auth: this.plugin.settings.googleCloudApiKey });
  }

  fetchVideoDetails = async (videoUrl: string, fetchTranscript: boolean = false): Promise<VideoDetails | null> => {
    const videoId = await this.getVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube video URL');
    }

    const response = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) {
      return null;
    }

    const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

    return {
      videoId: videoId || '',
      link: videoLink || '',
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      publishedAt: video.snippet?.publishedAt || '',
      duration: this.formatDuration(video.contentDetails?.duration ?? "PT0S") || '',
      channelTitle: video.snippet?.channelTitle || '',
      defaultLanguage: video.snippet?.defaultLanguage || '',
      defaultAudioLanguage: video.snippet?.defaultAudioLanguage || '',
      thumbnailUrl: video.snippet?.thumbnails?.maxres?.url || '',
      transcript: fetchTranscript ?
        await this.fetchVideoTranscript(videoLink, video.snippet?.defaultAudioLanguage ?? "en") :
        undefined
    };
  }

  fetchPlaylistVideosDetails = async (url: string, startDate?: Date, endDate?: Date,
    fetchTranscript: boolean = false, notifyProgress: boolean = true): Promise<VideoDetails[]> => {
    return this.getPlaylistId(url)
      .then(playlistId => {
        if (!playlistId) {
            throw new Error('Invalid YouTube playlist URL');
        }
        return this.fetchPlaylistVideoIds(playlistId);
      })
      .then(videoIds => {
        return this.fetchVideosDetails(videoIds, startDate, endDate, fetchTranscript, notifyProgress);
      })
      .catch(error => {
        console.error("Error during playlist details retrieval:", error);
        throw error;
      });
  }

  fetchChannelVideosDetails = async (url: string, startDate?: Date, endDate?: Date,
    fetchTranscript: boolean = false, notifyProgress: boolean = true): Promise<VideoDetails[]> => {
    return this.getChannelId(url)
      .then(channelId => {
        if (!channelId) {
            throw new Error('Invalid YouTube channel URL');
        }
        return this.fetchChannelVideoIds(channelId);
      })
      .then(videoIds => {
        return this.fetchVideosDetails(videoIds, startDate, endDate, fetchTranscript, notifyProgress);
      })
      .catch(error => {
        console.error("Error during channel details retrieval:", error);
        throw error;
      });
  }

  fetchVideosDetails = async (videoIds: string[], startDate?: Date, endDate?: Date,
    fetchTranscript: boolean = false, notifyProgress: boolean = true): Promise<VideoDetails[]> => {
    
    if (videoIds.length === 0) {
      return [];
    }

    const response = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: videoIds,
    });

    const videos = response.data.items?.filter(item => {
      return this.isVideoPublishedInDateRange(item, startDate, endDate);
    }) || [];
    const videoDetails: VideoDetails[] = [];

    for (const video of videos) {
      const videoId = video.id || '';
      const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

      const videoDetail: VideoDetails = {
        videoId: videoId,
        link: videoLink,
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        publishedAt: video.snippet?.publishedAt || '',
        duration: this.formatDuration(video.contentDetails?.duration ?? "PT0S") || '',
        channelTitle: video.snippet?.channelTitle || '',
        defaultLanguage: video.snippet?.defaultLanguage || '',
        defaultAudioLanguage: video.snippet?.defaultAudioLanguage || '',
        thumbnailUrl: video.snippet?.thumbnails?.maxres?.url || '',
        transcript: fetchTranscript ?
          await this.fetchVideoTranscript(videoLink, video.snippet?.defaultAudioLanguage ?? "en") :
          undefined,
      };

      videoDetails.push(videoDetail);
      if (notifyProgress)
        new Notice(`${videoDetail.title} fetched`);
    }
    return videoDetails;
  };

  searchYoutubeVideos = async (query: string,
    maxResults: number,
    language?: string,
    orderBy?: "likeCount" | "duration" | "publishedAt" | "none"): Promise<VideoData[]> => {
    try {
      // Execute the search
      const res = await this.youtube.search.list({
        part: ['id'], // Specify which parts of the resource you want to include in the response
        q: query, // The search query string
        maxResults: maxResults, // The maximum number of results to return
        type: ['video'], // The type of resource to search for
        relevanceLanguage: language,
      });

      const videoIds: string[] = [];
      if (res.data.items) {
        res.data.items.forEach((item) => {
          if (item.id?.videoId) {
            videoIds.push(item.id.videoId);
          }
        });
      }

      // Fetch full video details using videos.list
      const videoRes = await this.youtube.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: videoIds,
      });

      // Extract video IDs and titles
      const videos: VideoData[] = [];
      if (videoRes.data.items) {
        videoRes.data.items.forEach((item) => {
          if (item.id && item.snippet?.title) {
            videos.push({
              videoId: item.id,
              title: item.snippet.title,
              description: item.snippet?.description,
              likeCount: parseInt(item.statistics?.likeCount || "0"),
              duration: item.contentDetails?.duration,
              publishedAt: item.snippet?.publishedAt,
            });
          }
        });
      }
      // Sort videos only if orderBy is specified and not "none"
      if (orderBy && orderBy !== "none") {
        videos.sort((a, b) => {
          if (orderBy === "likeCount") {
            return (b.likeCount || 0) - (a.likeCount || 0);
          } else if (orderBy === "duration") {
            // Convert duration to seconds for comparison
            const durationA = this.parseDuration(a.duration || "PT0S");
            const durationB = this.parseDuration(b.duration || "PT0S");
            return durationB - durationA;
          } else {
            // Compare publishedAt dates
            return (
              new Date(b.publishedAt || "").getTime() -
              new Date(a.publishedAt || "").getTime()
            );
          }
        });
      }
      videos.forEach((video) => {
        if (video.duration) {
          video.duration = this.formatDuration(video.duration);
        }
      });
      return videos;
    } catch (err) {
      // Handle errors
      console.error('Error searching for videos:', err);
      return [];
    }
  }

  searchYoutubeVideosDescription = async (queryTitle: string,
    maxResultsTitle: number,
    queryDescr: string,
    maxResultsDescr: number,
    language?: string,
    orderBy?: "likeCount" | "duration" | "publishedAt" | "none"): Promise<VideoData[]> => {
    try {
      // First search: broader search by title
      const resTitle = await this.youtube.search.list({
        part: ["id"],
        q: queryTitle,
        maxResults: maxResultsTitle,
        type: ["video"],
        relevanceLanguage: language,
      });

      const videoIds: string[] = [];
      if (resTitle.data.items) {
        resTitle.data.items.forEach((item) => {
          if (item.id?.videoId) {
            videoIds.push(item.id.videoId);
          }
        });
      }
      // Second search: more specific search by description (single API call)
      const videoRes = await this.youtube.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: videoIds,
      });

      const videos: VideoData[] = [];
      if (videoRes.data.items) {
        videoRes.data.items.forEach((item) => {
          if (
            (item.snippet?.title &&
              item.snippet.title.includes(queryDescr)) ||
            (item.snippet?.description &&
              item.snippet.description.includes(queryDescr))
          ) {
            videos.push({
              videoId: item.id || "",
              title: item.snippet?.title || "",
              description: item.snippet?.description || "",
              likeCount: parseInt(item.statistics?.likeCount || "0"),
              duration: item.contentDetails?.duration,
              publishedAt: item.snippet?.publishedAt,
            });
          }
        });
      }

      // Sort videos only if orderBy is specified and not "none"
      if (orderBy && orderBy !== "none") {
        videos.sort((a, b) => {
          if (orderBy === "likeCount") {
            return (b.likeCount || 0) - (a.likeCount || 0);
          } else if (orderBy === "duration") {
            // Convert duration to seconds for comparison
            const durationA = this.parseDuration(a.duration || "PT0S");
            const durationB = this.parseDuration(b.duration || "PT0S");
            return durationB - durationA;
          } else {
            // Compare publishedAt dates
            return (
              new Date(b.publishedAt || "").getTime() -
              new Date(a.publishedAt || "").getTime()
            );
          }
        });
      }
      videos.forEach((video) => {
        if (video.duration) {
          video.duration = this.formatDuration(video.duration);
        }
      });
      return videos.slice(0, maxResultsDescr); // Return top maxResultsDescr results
    } catch (err) {
      // Handle errors
      console.error('Error searching for videos:', err);
      return [];
    }
  }

  fetchVideoTranscript = async (videoUrl: string, language: string): Promise<TranscriptChunk[] | null> => {
    try {
      const videoId = await this.getVideoId(videoUrl);
      if (!videoId) {
        console.error('Invalid video ID');
        return null;
      }

      const response = await requestUrl({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        method: 'GET',
      });

      const transcriptMatch = response.text.match(/"captions":\{"playerCaptionsTracklistRenderer":\{"captionTracks":\[(.*?)\]/);
      if (!transcriptMatch) {
        console.log('Transcript not available');
        return null;
      }

      const captionTracks = JSON.parse(`[${transcriptMatch[1]}]`);
      let languageTrack = captionTracks.find((track: CaptionTrack) => track.languageCode === language);

      if (!languageTrack && language !== "en") {
        // Try english transcript
        languageTrack = captionTracks.find((track: CaptionTrack) => track.languageCode === "en");
      }

      if (!languageTrack) {
        if (language === "en") {
          console.error('English transcript not available');
          return null;
        }
        else {
          console.error(`${language}$ transcript not available`);
          return null;
        }
      }

      const transcriptResponse = await requestUrl({
        url: languageTrack.baseUrl,
        method: 'GET',
      });

      return this.parseTranscript(transcriptResponse.text);
    } catch (error) {
      console.error('Errore durante il recupero dei sottotitoli:', error);
      return null;
    }
  }

  fetchPlaylistVideoIds = async (playlistId: string): Promise<string[]> => {
    const videoIds: string[] = [];

    let nextPageToken: string | undefined;

    do {
      const res = await this.youtube.playlistItems.list({
        part: ['snippet'],
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      res.data.items?.forEach((item) => {
        if (item.snippet?.resourceId?.videoId) {
          videoIds.push(item.snippet.resourceId.videoId);
        }
      });

      nextPageToken = res.data.nextPageToken ?? undefined;
    } while (nextPageToken);

    return videoIds;
  }

  fetchPlaylistDetails = async (playlistId: string): Promise<PlaylistDetails> => {
    const videoIds: string[] = [];
    let nextPageToken: string | undefined;
    let playlistTitle = '';
    let playlistDescription = '';
    let totalItemCount = 0;

    do {
      const res = await this.youtube.playlistItems.list({
        part: ['snippet'],
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      if (!nextPageToken) {
        const playlistDetails = await this.youtube.playlists.list({
          part: ['snippet', 'contentDetails'],
          id: [playlistId],
        });

        const playlistData = playlistDetails.data.items?.[0];
        if (playlistData?.snippet) {
          playlistTitle = playlistData.snippet.title || '';
          playlistDescription = playlistData.snippet.description || '';
        }
        if (playlistData?.contentDetails) {
          totalItemCount = playlistData.contentDetails.itemCount || 0;
        }
      }

      res.data.items?.forEach((item) => {
        if (item.snippet?.resourceId?.videoId) {
          videoIds.push(item.snippet.resourceId.videoId);
        }
      });

      nextPageToken = res.data.nextPageToken ?? undefined;
    } while (nextPageToken);

    return {
      title: playlistTitle,
      description: playlistDescription,
      itemCount: totalItemCount,
      videoIds: videoIds,
    };
  };

  fetchChannelVideoIds = async (channelId: string): Promise<string[]> => {
    const videoIds: string[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.youtube.search.list({
        part: ['id'],
        channelId: channelId,
        maxResults: 50,
        pageToken: pageToken,
        type: ['video']
      });

      response.data.items?.forEach(item => {
        if (item.id?.videoId) {
          videoIds.push(item.id.videoId);
        }
      });

      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return videoIds;
  }

  fetchChannelDetails = async (channelId: string): Promise<ChannelDetails> => {
    const videoIds: string[] = [];
    let nextPageToken: string | undefined;
    let uploadsPlaylistId = '';
    let channelTitle = '';
    let channelDescription = '';
    let subscriberCount = 0;
    let videoCount = 0;

    const channelDetails = await this.youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [channelId],
    });

    const channelData = channelDetails.data.items?.[0];
    if (channelData?.snippet) {
      channelTitle = channelData.snippet.title || '';
      channelDescription = channelData.snippet.description || '';
    }
    if (channelData?.statistics) {
      subscriberCount = parseInt(channelData.statistics.subscriberCount || '0', 10);
      videoCount = parseInt(channelData.statistics.videoCount || '0', 10);
    }
    if (channelData?.contentDetails) {
      uploadsPlaylistId = channelData.contentDetails.relatedPlaylists?.uploads || '';
    }

    if (uploadsPlaylistId) {
      do {
        const res = await this.youtube.playlistItems.list({
          part: ['snippet'],
          playlistId: uploadsPlaylistId,
          maxResults: 50,
          pageToken: nextPageToken,
        });

        res.data.items?.forEach((item) => {
          if (item.snippet?.resourceId?.videoId) {
            videoIds.push(item.snippet.resourceId.videoId);
          }
        });

        nextPageToken = res.data.nextPageToken ?? undefined;
      } while (nextPageToken);
    }

    return {
      title: channelTitle,
      description: channelDescription,
      subscriberCount,
      videoCount,
      uploadsPlaylistId,
      videoIds,
    };
  };

  getChannelId = async (url: string) => {
    if (this.checkUrl(url)) {
      const responseText = await fetchUrl(url);
      const $ = cheerio.load(responseText);

      const id = $('meta[itemprop="identifier"]').attr('content');
      if (id) return id;
    } else {
      throw new Error(`"${url}" is not a YouTube url.`);
    }

    throw new Error(`Unable to get "${url}" channel id.`);
  };

  getVideoId = async (url: string) => {
    if (this.checkUrl(url)) {
      const responseText = await fetchUrl(url);
      const $ = cheerio.load(responseText);
      const id = $('meta[itemprop="identifier"]').attr('content');
      if (id) return id;
    } else {
      throw new Error(`"${url}" is not a YouTube url.`);
    }

    throw new Error(`Unable to get "${url}" video id.`);
  };

  getPlaylistId = async (url: string) => {
    if (this.checkUrl(url)) {
      const responseText = await fetchUrl(url);
      const $ = cheerio.load(responseText);

      const id = $('meta[itemprop="playlistId"]').attr('content') || new URL(url).searchParams.get('list');
      if (id) return id;
    } else {
      throw new Error(`"${url}" is not a YouTube url.`);
    }

    throw new Error(`Unable to get "${url}" playlist id.`);
  };
  
  generateMarkdownTimestampLinks = (description: string, videoUrl: string): string => {
    // Regular expression to match timestamps in the format HH:MM:SS or MM:SS
    const timestampRegex = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g;
  
    // Replace each timestamp with a markdown link
    return description.replace(timestampRegex, (match, minutes, seconds, hours) => {
      // Convert the timestamp to seconds
      let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
      if (hours) {
        totalSeconds += parseInt(hours) * 3600;
      }
  
      // Create the markdown link
      return `[${match}](${videoUrl}?t=${totalSeconds})`;
    });
  }

  // Helper function to parse YouTube duration (e.g., PT1H2M3S) to seconds
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (match) {
      const hours = parseInt(match[1] || "0", 10) * 3600;
      const minutes = parseInt(match[2] || "0", 10) * 60;
      const seconds = parseInt(match[3] || "0", 10);
      return hours + minutes + seconds;
    }
    return 0;
  }

  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) {
      return "00:00:00";
    }

    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);

    return [hours, minutes, seconds]
      .map((part) => part.toString().padStart(2, "0"))
      .join(":");
  }

  private parseTranscript(transcriptXml: string) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(transcriptXml, 'text/xml');

      const tempDiv = document.createElement('div'); // Temporary element for decoding
      const entries = Array.from(xmlDoc.getElementsByTagName('text'));

      return entries.map(entry => {
        const start = parseFloat(entry.getAttribute('start') ?? "0").toFixed(2);

        tempDiv.innerHTML = entry.textContent ?? ""; // Decode HTML entities
        const script = tempDiv.textContent?.replace(/\n/g, ' ').trim();

        return { start, script };
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  private checkUrl(url: string) {
    return url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1;
  }

  private isVideoPublishedInDateRange(
    item: youtube_v3.Schema$Video, startDate?: Date, endDate?: Date): boolean {
      if (!item.id || !item.snippet?.publishedAt) return false;
    if (!item.snippet?.publishedAt) return false;

    const videoPublishedAt = new Date(item.snippet?.publishedAt);

    if (startDate && videoPublishedAt < startDate) return false;
    if (endDate && videoPublishedAt > endDate) return false;
    return true;
  }  
}

export default YoutubeApi;
