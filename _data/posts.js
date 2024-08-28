const { fetchTumblrPosts } = require("../lib/tumblr");

module.exports = async () => {
  const posts = (await fetchTumblrPosts()).filter((post) => post !== null);
  return posts;
};
