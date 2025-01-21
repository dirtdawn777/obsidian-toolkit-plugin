async function SearchYoutubeVideos(tp, query, maxResults, language, orderBy) {
  let plugin = tp.app.plugins.plugins["toolkit-obsidian"];
  let vd = await plugin.youtubeApi.searchYoutubeVideos(query, maxResults, language, orderBy);

  return vd;
}

module.exports = SearchYoutubeVideos
