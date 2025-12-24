const fs = require("node:fs");
const playwright = require("playwright");
const { DateTime } = require("luxon");
const jsdom = require("jsdom");
const slugify = require("slugify");
const Fetch = require("@11ty/eleventy-fetch");

async function fetchFromStoryGraph(url) {
  const response = await Fetch(
    async function () {
      const { JSDOM } = jsdom;

      try {
        console.log("Starting fetchStoryGraph");
        const browser = await playwright.chromium.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForLoadState("networkidle");
        const data = await page.content();
        await browser.close();

        const books = new Map();
        const content = new JSDOM(data).window.document;
        const bookElements = content.querySelectorAll(".book-pane-content");
        for (const bookElement of bookElements) {
          const title = bookElement
            .querySelector('.book-title-author-and-series a[href^="/books"]')
            .textContent.trim();
          const image = bookElement.querySelector(".book-cover img");
          let thumbnail = "";
          if (image) {
            thumbnail = image.src;
          }
          const slug = slugify(title).toLowerCase();
          const author = bookElement
            .querySelector('.book-title-author-and-series a[href^="/authors"]')
            .textContent.trim();

          books.set(slug, {
            title,
            author,
            slug,
            thumbnail,
            permalink: "currently-reading",
            date: DateTime.now().toFormat("y-MM-dd"),
            type: "book",
            tags: [],
          });
        }

        return books;
      } catch (err) {
        console.error(err);
        return new Map();
      }
    },
    {
      duration: "1d",
      request_key: url,
    },
  );

  return Array.from(response.values());
}

async function fetchCurrentlyReading() {
  return await fetchFromStoryGraph(
    "https://app.thestorygraph.com/currently-reading/thewatermethod",
  );
}

async function refreshBookshelf() {
  const booksRead = await fetchFromStoryGraph(
    "https://app.thestorygraph.com/books-read/thewatermethod",
  );
  return booksRead;
}

module.exports = {
  fetchFromStoryGraph,
  fetchCurrentlyReading,
  refreshBookshelf,
};
