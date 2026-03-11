const fs = require("node:fs");
const slugify = require("slugify");

async function newBook(title, author, date) {
  if (!title || !author || !date) {
    throw new Error("Usage: book <book title> <author> <date>");
  }

  const slug = slugify(title).toLowerCase();

  console.log(`Creating new book: ${title}`);
  console.log(`Slug: ${slug}`);
  console.log(`Author: ${author}`);
  console.log(`Date: ${date}`);

  await fs.promises.writeFile(
    `./books/${slug}.md`,
    `---
title: "${title}"
author: "${author}"
date: ${date}
---
    `,
  );

  return slug;
}

module.exports = newBook;
