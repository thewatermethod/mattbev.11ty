const EleventyFetch = require("@11ty/eleventy-fetch");
const Image = require("@11ty/eleventy-img");
const TurndownService = require("turndown");
const turndownService = new TurndownService();
const { imageAttributes } = require("../constants");

const TUMBLR_TAG = "mattbev.com";

const tagsFilter = (tags) => tags.filter((tag) => tag !== TUMBLR_TAG);

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
        tags: ["tumblr", "tumblr-photo", ...tagsFilter(post.tags)],
        date: post.date,
        uuid: post.uuid,
        type: "tumblr",
        url: post.post_url,
      };
    case "text":
      return {
        permalink: `/posts/${post.slug || post.id}`,
        content: turndownService.turndown(post.body),
        title: post.title || post.summary,
        tags: ["tumblr", "tumblr-text", ...tagsFilter(post.tags)],
        date: post.date,
        uuid: post.uuid,
        type: "tumblr",
        url: post.post_url,
      };
    default:
      return null;
  }
};

const fetchTumblrPosts = async () => {
  try {
    const { TUMBLR_API_KEY, TUMBLR_BLOG_NAME } = process.env;
    if (!TUMBLR_API_KEY || !TUMBLR_BLOG_NAME) {
      throw new Error("Missing TUMBLR_API_KEY or TUMBLR_BLOG_NAME");
    }

    const tumblrUrl = `https://api.tumblr.com/v2/blog/${TUMBLR_BLOG_NAME}/posts/?tag=${TUMBLR_TAG}&api_key=${TUMBLR_API_KEY}`;

    const data = await EleventyFetch(tumblrUrl, {
      duration: "1d",
      type: "json",
    });

    return Promise.all(
      data.response.posts
        .filter((post) => post.title || post.summary)
        .map((post) => parseTumblrPost(post))
    );
  } catch (error) {
    console.error("Error fetching Tumblr posts", error);
    return [];
  }
};

module.exports = { fetchTumblrPosts };
