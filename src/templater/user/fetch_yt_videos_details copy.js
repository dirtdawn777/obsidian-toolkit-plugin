async function FetchYoutubeVideosDetails(tp, videoIds, fetchTranscript) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchVideosDetails(videoIds, fetchTranscript);
  
  return vd;
}

module.exports = FetchYoutubeVideosDetails


