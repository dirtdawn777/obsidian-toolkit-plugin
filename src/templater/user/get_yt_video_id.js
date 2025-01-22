async function GetYoutubeVideoId(tp, videolUrl) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let id = await plugin.youtubeApi.getVideoId(videolUrl);
  
  return id;
}

module.exports = GetYoutubeVideoId
