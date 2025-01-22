async function FetchYuotubePlaylistVideoIds(tp, playlistId) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchPlaylistVideoIds(playlistId);

  return vd;
}

module.exports = FetchYuotubePlaylistVideoIds


