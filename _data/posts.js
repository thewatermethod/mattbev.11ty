const EleventyFetch = require("@11ty/eleventy-fetch");
const Image = require("@11ty/eleventy-img");
const TurndownService = require("turndown");
const turndownService = new TurndownService();
const { imageAttributes } = require("../constants");

const { TUMBLR_API_KEY, TUMBLR_BLOG_NAME } = process.env;

const tumblrUrl = `https://api.tumblr.com/v2/blog/${TUMBLR_BLOG_NAME}.tumblr.com/posts/?tag=public+publish&api_key=${TUMBLR_API_KEY}`;

const parseTumblrPost = async (post) => {
  switch (post.type) {
    case "photo":
      return {
        permalink: `/posts/${post.slug || post.id}`,
        content: await (async () => {
          const alt = post.photos[0].caption || "";
          const image = await Image(post.photos[0].original_size.url, {
            widths: [null],
            formats: ["webp", "jpeg"],
            outputDir: "_site/img/",
          });

          // You bet we throw an error on a missing alt (alt="" works okay)
          const imageMarkup = Image.generateHTML(image, imageAttributes(alt));

          return turndownService.turndown(`
        ${imageMarkup}
        <div>${post.caption}</div>
        <p>Original post on <a href="${post.post_url}">tumblr</a></p>
      `);
        })(),
        title: post.title || post.summary,
        tags: [
          "tumblr",
          "tumblr-photo",
          ...post.tags.filter((tag) => tag !== "public publish"),
        ],
        date: post.date,
        uuid: post.uuid,
      };
    case "text":
      console.log(post);
      return {
        permalink: `/posts/${post.slug || post.id}`,
        content: turndownService.turndown(post.body),
        title: post.title || post.summary,
        tags: [
          "tumblr",
          "tumblr-text",
          ...post.tags.filter((tag) => tag !== "public publish"),
        ],
        date: post.date,
        uuid: post.uuid,
      };
    default:
      return null;
  }
};

const fetchTumblrPosts = async () => {
  if (!TUMBLR_API_KEY || !TUMBLR_BLOG_NAME) {
    console.error("Missing TUMBLR_API_KEY or TUMBLR_BLOG_NAME");
    return [];
  }
  const data = await EleventyFetch(tumblrUrl, {
    duration: "1d",
    type: "json",
  });

  return Promise.all(
    data.response.posts
      .filter((post) => post.title || post.summary)
      .map((post) => parseTumblrPost(post))
  );
};

module.exports = async () => {
  const posts = (await fetchTumblrPosts()).filter((post) => post !== null);
  return posts;
};
