async function FetchYoutubePlaylistDetails(tp, playlistId) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchPlaylistDetails(playlistId);

  return vd;
}

module.exports = FetchYoutubePlaylistDetails