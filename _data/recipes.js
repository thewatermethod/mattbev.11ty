const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "recipes");

// Load every recipe JSON file in `recipes/`, sorted by title
module.exports = () =>
  fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")))
    .sort((a, b) => a.title.localeCompare(b.title));
