const fs = require("node:fs");
const { exec } = require("node:child_process");
const { DateTime } = require("luxon");
const { refreshBookshelf } = require("./lib/storyGraph.js");

async function getCurrentBookshelf() {
  const books = await fs.promises.readdir("./books");
  const shelf = new Set();
  const titles = books
    .filter((book) => book.endsWith(".md"))
    .map((book) => book.replace(".md", ""));
  for (const title of titles) {
    shelf.add(title);
  }
  return shelf;
}

async function main() {
  // check to see if bookshelf.json exists
  const bookshelfExists = await fs.promises
    .access("./bookshelf.json")
    .then(() => true)
    .catch(() => false);
  let newBooks = [];
  newBooks = await refreshBookshelf();

  const date = DateTime.now().toFormat("y-MM-dd");

  const currentShelf = await getCurrentBookshelf();
  for (const book of newBooks) {
    if (!currentShelf.has(book.slug)) {
      console.log(`New book found: ${book.title}`);

      // pass the title to the "book" shell script
      // params: title, author, date in YYYY-MM-DD format
      exec(`sh book "${book.title}" "${book.author}" ${date}`);
    }
  }
}

main();
