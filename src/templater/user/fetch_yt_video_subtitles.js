async function FetchYuotubeVideoSubtitles(tp, url, language) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchVideoSubtitles(url, language);

  return vd;
}

module.exports = FetchYuotubeVideoSubtitles

