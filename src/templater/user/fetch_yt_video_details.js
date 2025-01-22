async function FetchYuotubeVideoDetails(tp, url) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchVideoDetails(url);

  return vd;
}

module.exports = FetchYuotubeVideoDetails

