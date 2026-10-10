const fs = require("node:fs");
const path = require("node:path");
const { fetchCurrentlyReading } = require("../lib/storyGraph");

const BOOKS_DIR = path.join(__dirname, "..", "books");

// Mark any book flagged as currently reading that StoryGraph no longer
// returns as read.
async function markFinishedBooksAsRead(currentlyReading) {
  const readingSlugs = new Set(currentlyReading.map((book) => book.slug));
  const files = await fs.promises.readdir(BOOKS_DIR);

  for (const file of files.filter((file) => file.endsWith(".md"))) {
    const slug = file.replace(".md", "");
    if (readingSlugs.has(slug)) {
      continue;
    }

    const filePath = path.join(BOOKS_DIR, file);
    const contents = await fs.promises.readFile(filePath, "utf8");
    if (!/^currentlyReading:\s*true\s*$/m.test(contents)) {
      continue;
    }

    await fs.promises.writeFile(
      filePath,
      contents.replace(
        /^currentlyReading:\s*true\s*$/m,
        "currentlyReading: false",
      ),
    );
    console.log(`Marked ${file} as read`);
  }
}

module.exports = async () => {
  const books = await fetchCurrentlyReading();

  // An empty result usually means the scrape failed, so don't touch anything.
  if (books.length > 0) {
    await markFinishedBooksAsRead(books);
  }

  return books;
};
