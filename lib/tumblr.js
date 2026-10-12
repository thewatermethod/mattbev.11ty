const fs = require("node:fs/promises");
const path = require("node:path");
const TurndownService = require("turndown");
const turndownService = new TurndownService();
turndownService.keep(["iframe", "audio", "video", "source"]);
const POSTS_DIR = path.join(__dirname, "../tumblr");
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function postBody(post) {
  switch (post.type) {
    case "text": return post.body || "";
    case "photo": return `${(post.photos || []).map((photo) =>
      `<img src="${escapeHtml(photo.original_size.url)}" alt="${escapeHtml(photo.caption)}">`).join("\n")}\n${post.caption || ""}`;
    case "quote": return `<blockquote>${post.text || ""}</blockquote>${post.source || ""}`;
    case "link": return `<p><a href="${escapeHtml(post.url)}">${escapeHtml(post.title || post.url)}</a></p>${post.description || ""}`;
    case "chat": return (post.dialogue || []).map((line) => `<p><strong>${escapeHtml(line.label)}</strong> ${escapeHtml(line.phrase)}</p>`).join("\n") || post.body || "";
    case "answer": return `<p>${escapeHtml(post.asking_name)} asked:</p><blockquote>${post.question || ""}</blockquote>${post.answer || ""}`;
    case "audio": return `${post.audio_url ? `<audio controls src="${escapeHtml(post.audio_url)}"></audio>` : post.player || post.embed || ""}\n${post.caption || ""}`;
    case "video": return `${post.video_url ? `<video controls src="${escapeHtml(post.video_url)}"></video>` : post.player?.at(-1)?.embed_code || ""}\n${post.caption || ""}`;
    default: return post.body || `<pre>${escapeHtml(JSON.stringify(post.content || post, null, 2))}</pre>`;
  }
}

const parseTumblrPost = async (post) => {
  const id = String(post.id_string || post.id);
  const attribution = `<p>Originally published on <a href="${escapeHtml(post.post_url)}">Tumblr</a>.</p>`;
  return {
    // IDs remain stable when titles/slugs change and cannot collide with native posts.
    permalink: `/posts/tumblr/${id}/index.html`,
    content: turndownService.turndown(`${postBody(post)}\n${attribution}`),
    title: post.title || post.summary || `Tumblr ${post.type || ""} post ${id}`,
    tags: ["posts", "tumblr", `tumblr-${post.type}`, ...(post.tags || []).filter((tag) => tag !== "mattbev.com")],
    date: new Date(post.date || post.timestamp * 1000).toISOString(),
    uuid: post.uuid,
    tumblrId: id,
    tumblrTags: post.tags || [],
    type: "tumblr",
    source: "Tumblr",
    url: post.post_url,
    eleventyExcludeFromCollections: !(post.tags || []).includes("mattbev.com"),
  };
};

async function writeTumblrPosts(archive, { publicUrl, postsDir = POSTS_DIR } = {}) {
  const { rewriteMedia, mediaUrls } = require("../bin/backup-tumblr");
  if (!publicUrl) throw new Error("Missing R2_PUBLIC_URL. See .env.example.");
  await fs.mkdir(postsDir, { recursive: true });
  let created = 0;
  for (const [id, record] of Object.entries(archive.posts)) {
    if (!/^\d+$/.test(id)) throw new Error(`Invalid Tumblr post ID: ${id}`);
    const filename = path.join(postsDir, `${id}.md`);
    try { await fs.access(filename); continue; }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    // Only inspect this post's URLs rather than scanning the whole blog's media
    // inventory for every string in every post.
    const postMedia = Object.fromEntries([...mediaUrls(record.legacy)]
      .filter((url) => archive.media[url])
      .map((url) => [url, archive.media[url]]));
    const post = await parseTumblrPost(rewriteMedia(record.legacy, postMedia, publicUrl.replace(/\/$/, "")));
    const { content, ...data } = post;
    // JSON values are valid YAML; quoting prevents titles/tags from changing front matter.
    // Markdown-only rendering preserves literal Liquid/Nunjucks from Tumblr posts.
    const frontMatter = Object.entries({ layout: "layouts/post.njk", templateEngineOverride: "md", ...data })
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n");
    try {
      await fs.writeFile(filename, `---\n${frontMatter}\n---\n\n${content}\n`, { flag: "wx" });
      created++;
    } catch (error) { if (error.code !== "EEXIST") throw error; }
  }
  return created;
}

module.exports = { parseTumblrPost, writeTumblrPosts, POSTS_DIR };
