const fs = require("fs");
const Image = require("@11ty/eleventy-img");
var groupBy = require("object.groupby");
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const embedYouTube = require("eleventy-plugin-youtube-embed");

module.exports = function (eleventyConfig) {
  // Import locally; Netlify sets SKIP_TUMBLR and builds the committed posts.
  eleventyConfig.on("eleventy.before", async () => {
    if (process.env.SKIP_TUMBLR === "true") return;
    await require("./bin/backup-tumblr").backupTumblr();
  });
  eleventyConfig.watchIgnores.add("archive/**");

  // Re-run page scripts after HTML changes (recipe filters and variant pickers).
  eleventyConfig.setServerOptions({ domDiff: false });

  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(embedYouTube);
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

  eleventyConfig.addCollection("booksByYear", (collection) => {
    const books = collection.getFilteredByTag("books").map((book) => ({
      title: book.data.title,
      author: book.data.author,
      reread: book.data.reread,
      year: DateTime.fromJSDate(book.date, { zone: "utc" }).toFormat("yyyy"),
    }));

    const groupedBooks = groupBy(books, ({ year }) => year);
    return Object.entries(groupedBooks).sort((a, b) => b[0] - a[0]);
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
      "dd LLLL yyyy",
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("year", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy");
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
      (tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1,
    );
  }

  eleventyConfig.addFilter("filterTagList", filterTagList);

  eleventyConfig.addFilter("withoutType", (posts, type) =>
    (posts || []).filter((post) => post.data.type !== type),
  );

  eleventyConfig.addFilter("withType", (posts, type) =>
    (posts || []).filter((post) => post.data.type === type),
  );

  // Drop the "Originally published on Tumblr" footer; the list shows its own tag.
  eleventyConfig.addFilter("tumblrBody", (html) =>
    (html || "").replace(/<p>Originally published on <a[^>]*>Tumblr<\/a>\.<\/p>\s*$/, ""),
  );

  eleventyConfig.addFilter("hasTag", (tags, tag) => (tags || []).includes(tag));

  // Recipe filters
  eleventyConfig.addFilter("recipesTagged", (recipes, tag) =>
    recipes.filter((recipe) => (recipe.tags || []).includes(tag)),
  );

  // Render 0.25 as ¼, 1.5 as 1½, etc. Odd decimals (package sizes) pass through.
  const fractions = { 0.25: "¼", 0.333: "⅓", 0.5: "½", 0.667: "⅔", 0.75: "¾" };
  eleventyConfig.addFilter("recipeQuantity", (quantity) => {
    const whole = Math.floor(quantity);
    const part = Math.round((quantity - whole) * 1000) / 1000;
    if (part === 0) return String(whole);
    if (fractions[part]) return (whole || "") + fractions[part];
    return String(quantity);
  });

  // Space-separated ids of the variants that swap out this ingredient
  eleventyConfig.addFilter("recipeReplacedBy", (ingredientId, variants) =>
    (variants || [])
      .filter((variant) => (variant.replaces || []).includes(ingredientId))
      .map((variant) => variant.id)
      .join(" "),
  );

  eleventyConfig.addFilter("recipeVariantIds", (variantInstructions) =>
    Object.keys(variantInstructions || {}).join(" "),
  );

  eleventyConfig.addFilter("recipeVariantLabel", (id, variants) => {
    const variant = (variants || []).find((v) => v.id === id);
    return variant ? variant.label : id;
  });

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
    },
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
