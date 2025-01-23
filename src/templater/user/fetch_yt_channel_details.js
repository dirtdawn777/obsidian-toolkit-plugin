async function FetchYoutubeChannelDetails(tp, playlistId) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchChannelDetails(playlistId);

  return vd;
}

module.exports = FetchYoutubeChannelDetails