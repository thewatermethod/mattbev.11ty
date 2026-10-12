const { fetchNewsblurStarredStories } = require("../lib/newsblur");

// Tumblr posts are real Markdown files generated before each build.
module.exports = async () => fetchNewsblurStarredStories();
