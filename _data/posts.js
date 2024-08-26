const { fetchNewsblurStarredStories } = require("../lib/newsblur");
const { fetchTumblrPosts } = require("../lib/tumblr");

module.exports = async () => {
  const tumblrPosts = (await fetchTumblrPosts()).filter(
    (post) => post !== null
  );

  const newsblurStories = await fetchNewsblurStarredStories();

  return [...tumblrPosts, ...newsblurStories];
};
