const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { decode } = require("html-entities");

const dir = path.join(__dirname, "..", "delicious");

// Tags that every bookmark carries and say nothing about it
const ignoredTags = ["link"];

const months = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ");

function domain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (e) {
    return url;
  }
}

// Load the del.icio.us export in `delicious/`, newest first, grouped by day,
// with a tag list sorted by how often each tag was used.
module.exports = () => {
  const bookmarks = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const date = new Date(data.date);
      const tags = [
        ...new Set(
          String(data.tags || "")
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag && !ignoredTags.includes(tag)),
        ),
      ];
      return {
        // The export stores titles and notes HTML-encoded (&#39;, &amp;)
        title: decode(String(data.title || data.url)),
        url: data.url,
        domain: domain(data.url),
        notes: data.excerpt ? decode(String(data.excerpt)).trim() : "",
        tags,
        date,
        day: date.toISOString().slice(0, 10),
      };
    })
    .sort((a, b) => b.date - a.date || a.title.localeCompare(b.title));

  const days = [];
  for (const bookmark of bookmarks) {
    const last = days[days.length - 1];
    if (last && last.day === bookmark.day) {
      last.bookmarks.push(bookmark);
    } else {
      const [year, month, day] = bookmark.day.split("-");
      days.push({
        day: bookmark.day,
        stamp: { day, month: months[month - 1], year: year.slice(2) },
        bookmarks: [bookmark],
      });
    }
  }

  const counts = {};
  for (const bookmark of bookmarks) {
    for (const tag of bookmark.tags) counts[tag] = (counts[tag] || 0) + 1;
  }
  const tags = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    bookmarks,
    days,
    tags,
    first: bookmarks[bookmarks.length - 1].date,
    last: bookmarks[0].date,
  };
};
