const fs = require("node:fs");
const slugify = require("slugify");

async function newBook(title, author, date) {
  if (!title || !author || !date) {
    console.error("Usage: book <book title> <author> <date>");
    process.exit(1);
  }

  const slug = slugify(title).toLowerCase();

  console.log(`Creating new book: ${title}`);
  console.log(`Slug: ${slug}`);
  console.log(`Author: ${author}`);
  console.log(`Date: ${date}`);

  fs.writeFile(
    `./books/${slug}.md`,
    `---
title: "${title}"
author: "${author}"
date: ${date}
---
    `,
    (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      process.exit(0);
    },
  );
}

module.exports = newBook;
