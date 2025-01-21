async function FetchYoutubeVideoDetails(tp, url) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchVideoDetails(url);

  return vd;
}

module.exports = FetchYoutubeVideoDetails

