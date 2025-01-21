async function FetchYuotubeChannelVideoIds(tp, playlistId) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchChannelVideoIds(playlistId);

  return vd;

}
module.exports = FetchYuotubeChannelVideoIds

