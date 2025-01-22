async function SearchYoutubeVideosDesc(tp, queryTitle, maxResultsTitle, queryDesc, maxResultsDesc, language, orderBy) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.searchYoutubeVideosDescription(queryTitle, maxResultsTitle, queryDesc, maxResultsDesc, language, orderBy);

  return vd;
}

module.exports = SearchYoutubeVideosDesc

