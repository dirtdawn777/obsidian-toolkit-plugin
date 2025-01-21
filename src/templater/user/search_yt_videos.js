async function SearchYoutubeVideos(tp, query, maxResults, language, orderBy) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.searchYoutubeVideos(query, maxResults, language, orderBy);

  return vd;

}
//https://www.youtube.com/watch?v=5Z69nvwd-dE
module.exports = SearchYoutubeVideos
