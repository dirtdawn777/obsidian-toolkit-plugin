
import { youtube_v3 } from '@googleapis/youtube';

const youtube = new youtube_v3.Youtube({
  auth: 'YOUR_API_KEY'
});

interface VideoDetails {
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
}

async function getVideoDetails(videoUrl: string): Promise<VideoDetails | null> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube video URL');
  }

  const response = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId],
  });

  const video = response.data.items?.[0];
  if (!video) {
    return null;
  }

  return {
    title: video.snippet?.title || '',
    description: video.snippet?.description || '',
    publishedAt: video.snippet?.publishedAt || '',
    channelTitle: video.snippet?.channelTitle || '',
  };
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
  return match ? match[1] : null;
}

export { getVideoDetails };
export type { VideoDetails };
