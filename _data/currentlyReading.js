const fs = require("node:fs");
const path = require("node:path");

const BOOKS_DIR = path.join(__dirname, "..", "books");
const SNAPSHOT_PATH = path.join(__dirname, "..", "data", "currently-reading.json");

async function readSnapshot() {
  return JSON.parse(await fs.promises.readFile(SNAPSHOT_PATH, "utf8"));
}

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
  if (process.env.SKIP_STORYGRAPH === "true") {
    return readSnapshot();
  }

  const { fetchCurrentlyReading } = require("../lib/storyGraph");
  const books = await fetchCurrentlyReading();

  // An empty result usually means the scrape failed, so don't touch anything.
  if (books.length > 0) {
    await markFinishedBooksAsRead(books);
    await fs.promises.writeFile(
      SNAPSHOT_PATH,
      `${JSON.stringify(books, null, 2)}\n`,
    );
    return books;
  }

  return readSnapshot();
};
