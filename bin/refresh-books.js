const fs = require("node:fs");
const { exec } = require("node:child_process");
const { DateTime } = require("luxon");
const { refreshBookshelf } = require("../lib/storyGraph");
const newBook = require("./new-book");

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
  const newBooks = await refreshBookshelf();

  const date = DateTime.now().toFormat("y-MM-dd");

  const currentShelf = await getCurrentBookshelf();

  const created = [];
  for (const book of newBooks) {
    if (!currentShelf.has(book.slug)) {
      // params: title, author, date in YYYY-MM-DD format
      const slug = await newBook(book.title, book.author, date);
      created.push(slug);
    }
  }

  return created;
}

main()
  .then((created) => {
    if (created.length > 0) {
      console.log(`\nCreated ${created.length} new book(s)`);
      // Output file paths for use by callers (e.g. pre-commit hook)
      for (const slug of created) {
        console.log(`books/${slug}.md`);
      }
    } else {
      console.log("No new books to add");
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
