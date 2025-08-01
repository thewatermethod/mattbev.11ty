const fs = require("fs");
const Image = require("@11ty/eleventy-img");
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // Add plugins
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addCollection("posts", (collection) => {
    // This is typical Collection by Tag call
    const posts = collection.getFilteredByTag("posts");

    // Map over all the posts
    const postsWithUpdatedDates = posts.map((item) => {
      // If the item has a data.post object (from external Data)
      // Then set a new date based on the date property
      // Else return the original date (takes care of the Markdown)
      item.date = item.data.post ? new Date(item.data.post.date) : item.date;
      return item;
    });
    // Now we need to re-sort based on the date (since our posts keep their index in the array otherwise)
    const sortedPosts = postsWithUpdatedDates.sort((a, b) => a.date - b.date);
    // Make sortedPosts the array for the collection
    return sortedPosts;
  });

  eleventyConfig.addCollection("currentlyReading", (collection) => {
    const books = collection
      .getFilteredByTag("books")
      .filter((book) => book.data.currentlyReading);
    return books;
  });

  eleventyConfig.addCollection("currentProjects", (collection) => {
    const projects = collection
      .getFilteredByTag("projects")
      .filter((project) => project.data.currentProject);
    return projects;
  });

  // add filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLLL yyyy"
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(
      (tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
    );
  }

  eleventyConfig.addFilter("filterTagList", filterTagList);

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync("_site/404.html");

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  eleventyConfig.addShortcode(
    "image",
    async function (src, alt, sizes = "100vh") {
      let metadata = await Image(src, {
        widths: [300, 600],
        formats: ["avif", "jpeg", "webp"],
      });

      const attributes = imageAttributes(alt, sizes);

      // You bet we throw an error on a missing alt (alt="" works okay)
      return Image.generateHTML(metadata, attributes);
    }
  );

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ["md", "njk", "html", "liquid"],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
