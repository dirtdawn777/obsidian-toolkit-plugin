async function FetchYuotubePlaylistVideoIds(tp, playlistId) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchPlaylistVideoIds(playlistId);

  return vd;

}
//https://www.youtube.com/watch?v=5Z69nvwd-dE
module.exports = FetchYuotubePlaylistVideoIds


