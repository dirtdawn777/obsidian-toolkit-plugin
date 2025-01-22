async function GetYoutubePlaylistId(tp, videolUrl) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let id = await plugin.youtubeApi.getPlaylistId(videolUrl);
  
  return id;
}

module.exports = GetYoutubePlaylistId
