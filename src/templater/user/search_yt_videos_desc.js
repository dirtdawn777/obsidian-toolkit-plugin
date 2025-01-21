async function SearchYoutubeVideosDesc(tp, queryTitle, maxResultsTitle, queryDesc, maxResultsDesc, language, orderBy) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.searchYoutubeVideosDescription(queryTitle, maxResultsTitle, queryDesc, maxResultsDesc, language, orderBy);

  return vd;

}
//https://www.youtube.com/watch?v=5Z69nvwd-dE
module.exports = SearchYoutubeVideosDesc

