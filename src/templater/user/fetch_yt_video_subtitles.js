async function FetchYuotubeVideoSubtitles(tp, url, language) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchVideoSubtitles(url, language);

  return vd;

}
//https://www.youtube.com/watch?v=5Z69nvwd-dE
module.exports = FetchYuotubeVideoSubtitles

