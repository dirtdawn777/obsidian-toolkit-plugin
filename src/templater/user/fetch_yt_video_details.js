async function FetchYuotubeVideoDetails(tp, url) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.fetchVideoDetails(url);

  return vd;

}
//https://www.youtube.com/watch?v=5Z69nvwd-dE
module.exports = FetchYuotubeVideoDetails

