const fs = require("node:fs");
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
  // const booksRead = await refreshBookshelf();
  const currentShelf = await getCurrentBookshelf();
  console.log({ currentShelf });
}

main();
