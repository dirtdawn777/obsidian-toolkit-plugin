async function GetYoutubeChannelId(tp, channelUrl) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let id = await plugin.youtubeApi.getChannelId(channelUrl);
  
  return id;
}

module.exports = GetYoutubeChannelId
