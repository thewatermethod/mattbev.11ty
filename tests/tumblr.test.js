const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { backupTumblr: runBackup, mediaUrls, rewriteMedia } = require("../bin/backup-tumblr");
const { parseTumblrPost } = require("../lib/tumblr");
const backupTumblr = (options) => runBackup({ ...options, postsDir: options.postsDir || path.join(options.archiveDir, "generated") });

const config = { blog: "example.tumblr.com", apiKey: "secret", publicUrl: "https://media.example.com" };
const image = "https://64.media.tumblr.com/photo.jpg";
const makePost = (id, type = "text") => ({ id, id_string: String(id), type, title: `Post ${id}`, body: "<p>Hello</p>",
  summary: `Post ${id}`, tags: ["mattbev.com"], post_url: `https://example.tumblr.com/post/${id}`,
  date: "2020-01-01 00:00:00 GMT", slug: `post-${id}` });

function fixture(posts) {
  const objects = new Map();
  const calls = [];
  const downloads = [];
  const store = {
    async get(key) { return objects.has(key) ? JSON.parse(objects.get(key)) : null; },
    async has(key) { return objects.has(key); },
    async put(key, body) { objects.set(key, body); },
  };
  const fetchImpl = async (input) => {
    const url = new URL(input);
    if (url.hostname !== "api.tumblr.com") {
      downloads.push(url.href);
      return new Response("image bytes", { headers: { "content-type": "image/jpeg" } });
    }
    calls.push(url);
    const selected = url.searchParams.has("tag") ? posts.filter((post) => post.tags.includes("mattbev.com")) : posts;
    const offset = Number(url.searchParams.get("offset") || 0);
    return Response.json({ meta: { status: 200 }, response: {
      blog: { name: "example" }, total_posts: selected.length,
      posts: selected.slice(offset, offset + 20),
    } });
  };
  return { store, fetchImpl, calls, objects, downloads };
}

async function directory(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tumblr-test-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

test("creates posts across all pages/types with tag-based collection membership and restores deleted posts from R2", async (t) => {
  const posts = Array.from({ length: 25 }, (_, i) => makePost(100 - i));
  posts[0].type = "video";
  posts[1].body = `<img src="${image}">`;
  posts[2].tags = [];
  const f = fixture(posts);
  const archiveDir = await directory(t);
  const archive = await backupTumblr({ config, ...f, archiveDir });
  assert.equal(Object.keys(archive.posts).length, 25);
  const index = JSON.parse(await fs.readFile(path.join(archiveDir, "index.json"), "utf8"));
  assert.equal(index.postIds.length, 25);
  assert.equal(index.posts, undefined);
  assert.equal(index.media, undefined);
  const generated = path.join(archiveDir, "generated");
  assert.equal((await fs.readdir(generated)).length, 25);
  assert.match(await fs.readFile(path.join(generated, "98.md"), "utf8"), /eleventyExcludeFromCollections: true/);
  for (const id of ["100", "79", "76"]) {
    assert.match(await fs.readFile(path.join(generated, `${id}.md`), "utf8"), /eleventyExcludeFromCollections: false/);
  }
  assert(!f.calls.some((url) => url.searchParams.has("tag")));
  assert(f.calls.some((url) => url.searchParams.get("offset") === "20"));
  assert(f.calls.some((url) => url.searchParams.get("npf") === "true"));
  assert.equal(archive.posts["99"].legacy.body, `<img src="${image}">`);
  assert.equal(f.downloads.length, 1);
  posts.splice(1, 1);
  const next = await backupTumblr({ config, ...f, archiveDir: await directory(t) });
  assert.equal(next.publishedCount, 24);
  assert.equal(Object.keys(next.posts).length, 25);
  assert(next.posts["99"]);
  assert.equal(f.downloads.length, 1);
  assert.equal(JSON.parse(await fs.readFile(path.join(archiveDir, "posts/99.json"), "utf8")).legacy.id, 99);
});

test("unavailable images are logged without losing posts and resume retries without API calls", async (t) => {
  const posts = [makePost(1)];
  const f = fixture(posts);
  const archiveDir = await directory(t);
  await backupTumblr({ config, ...f, archiveDir });
  const key = "tumblr/example.tumblr.com/latest.json";
  const previous = f.objects.get(key);
  posts[0].body = `<img src="${image}">`;
  const failMedia = async (url) => new URL(url).hostname === "api.tumblr.com" ? f.fetchImpl(url) : new Response("missing", { status: 404 });
  const partial = await backupTumblr({ config, ...f, archiveDir, fetchImpl: failMedia });
  assert.equal(partial.missingImages.length, 1);
  assert.equal(partial.missingImages[0].url, image);
  assert.equal(partial.media[image], undefined);
  assert.equal(JSON.parse(await fs.readFile(path.join(archiveDir, "index.json"), "utf8")).missingImageCount, 1);
  assert.equal([...f.objects.keys()].filter((key) => key.includes("/posts/1/")).length, 2);
  const apiCalls = f.calls.length;
  const recovered = await backupTumblr({ config, ...f, archiveDir, resume: true });
  assert.equal(recovered.missingImages.length, 0);
  assert.equal(f.calls.length, apiCalls);
  assert.notEqual(f.objects.get(key), previous);
});

test("detects truncated or repeating pagination without publishing a manifest", async (t) => {
  const posts = Array.from({ length: 21 }, (_, i) => makePost(i + 1));
  const f = fixture(posts);
  const broken = async (url) => {
    const result = await f.fetchImpl(url);
    const data = await result.json();
    if (new URL(url).searchParams.get("offset") === "20") data.response.posts = [];
    return Response.json(data);
  };
  await assert.rejects(backupTumblr({ config, ...f, archiveDir: await directory(t), fetchImpl: broken }), /pagination ended/);
  assert(!f.objects.has("tumblr/example.tumblr.com/latest.json"));
});

test("discovers images while excluding audio, video, and Tumblr embed wrappers", () => {
  const urls = mediaUrls({ photos: [{ original_size: { url: image, width: 100 } }],
    trail: [{ content: '<img src="https://external.example/a.png?a=1&amp;b=2" srcset="https://external.example/b.png 2x">' }],
    content: [{ media: [{ type: "image/gif", url: "https://external.example/c.gif" }] }],
    video: { type: "video", width: 640, url: "https://safe.txmblr.com/svc/embed/inline/example" },
    audio_url: "https://example.com/audio.mp3", video_url: "https://va.media.tumblr.com/video.mp4" });
  assert.equal(urls.size, 4);
  assert(urls.has("https://external.example/a.png?a=1&b=2"));
  const rewritten = rewriteMedia({ body: '<img src="https://external.example/a.png?a=1&amp;b=2">' },
    { "https://external.example/a.png?a=1&b=2": { key: "tumblr/media/a.png" } }, config.publicUrl);
  assert.equal(rewritten.body, '<img src="https://media.example.com/tumblr/media/a.png">');
});

test("text and photos get attribution, stable paths, tags, and every photoset image", async () => {
  const text = await parseTumblrPost(makePost(1));
  assert.match(text.content, /Originally published on \[Tumblr\]/);
  assert.equal(text.permalink, "/posts/tumblr/1/index.html");
  assert.deepEqual(text.tags, ["posts", "tumblr", "tumblr-text"]);
  const photo = await parseTumblrPost({ ...makePost(2, "photo"), caption: "<p>A photoset</p>", photos: [
    { original_size: { url: "https://media.example.com/1.gif" }, caption: "one" },
    { original_size: { url: "https://media.example.com/2.jpg" }, caption: "two" },
  ] });
  assert.match(photo.content, /1.gif/);
  assert.match(photo.content, /2.jpg/);
  assert.match(photo.content, /Originally published on \[Tumblr\]/);
  assert.equal((await parseTumblrPost(makePost(3, "video"))).type, "tumblr");
});

test("empty blog produces a valid completed archive", async (t) => {
  const f = fixture([]);
  const archive = await backupTumblr({ config, ...f, archiveDir: await directory(t) });
  assert.deepEqual(archive.posts, {});
  assert.equal(archive.publishedCount, 0);
});

test("existing Markdown is preserved even when Tumblr content or tags change", async (t) => {
  const posts = [makePost(1)];
  const f = fixture(posts);
  const archiveDir = await directory(t);
  await backupTumblr({ config, ...f, archiveDir });
  const file = path.join(archiveDir, "generated/1.md");
  const original = await fs.readFile(file, "utf8") + "Local edits\n";
  await fs.writeFile(file, original);
  posts[0].body = "Changed upstream";
  posts[0].tags = [];
  await backupTumblr({ config, ...f, archiveDir });
  assert.equal(await fs.readFile(file, "utf8"), original);
});

test("all legacy types get readable bodies and attribution without a title filter", async () => {
  const cases = [
    ["quote", { text: "Quoted words", source: "Author" }, "Quoted words"],
    ["link", { url: "https://example.com", description: "A link" }, "https://example.com"],
    ["chat", { dialogue: [{ label: "Me:", phrase: "Hello there" }] }, "Hello there"],
    ["answer", { asking_name: "Someone", question: "Why?", answer: "Because" }, "Because"],
    ["audio", { audio_url: "https://media.example.com/a.mp3" }, "<audio"],
    ["video", { video_url: "https://media.example.com/v.mp4" }, "<video"],
  ];
  for (const [type, fields, expected] of cases) {
    const post = await parseTumblrPost({ ...makePost(1, type), title: "", summary: "", tags: [], ...fields });
    assert(post.title);
    assert(post.content.includes(expected));
    assert.match(post.content, /Originally published on/);
    assert.equal(post.eleventyExcludeFromCollections, true);
  }
});

test("Eleventy builds every generated post on the first build but collects only tagged posts", async (t) => {
  const { default: Eleventy } = await import("@11ty/eleventy");
  const backup = require("../bin/backup-tumblr");
  const dir = await directory(t);
  const archiveDir = path.join(dir, "archive/tumblr");
  const postsDir = path.join(dir, "tumblr");
  const posts = Array.from({ length: 25 }, (_, i) => makePost(i + 1));
  posts[1].tags = [];
  posts[0].body = '<p>Literal {{ expression }} and {% tag %}</p>';
  const f = fixture(posts);
  let backups = 0;
  t.mock.method(backup, "backupTumblr", async () => {
    backups++;
    return backupTumblr({ config, ...f, archiveDir, postsDir });
  });
  await fs.mkdir(archiveDir, { recursive: true });
  await fs.mkdir(path.join(dir, "_includes/layouts"), { recursive: true });
  await fs.writeFile(path.join(dir, "_includes/layouts/post.njk"), await fs.readFile(path.join(__dirname, "../_includes/layouts/post.njk")));
  await fs.writeFile(path.join(dir, "_includes/layouts/base.njk"), "{{ content | safe }}");
  await fs.writeFile(path.join(archiveDir, "hidden.md"), "Raw archive must never be published");
  await fs.writeFile(path.join(dir, ".eleventyignore"), await fs.readFile(path.join(__dirname, "../.eleventyignore")));
  await fs.writeFile(path.join(dir, "index.njk"), "{% for post in collections.posts %}{{ post.data.tumblrId }},{% endfor %}");
  const eleventy = new Eleventy(dir, path.join(dir, "_site"), {
    configPath: false,
    config: (eleventyConfig) => require("../.eleventy")(eleventyConfig),
  });
  const output = await eleventy.toJSON();
  assert.equal(backups, 1);
  assert.equal(output.length, 26);
  const index = output.find((page) => page.url === "/");
  const collected = index.content.split(",").filter(Boolean);
  assert.equal(collected.length, 24);
  assert(!collected.includes("2"));
  assert(collected.includes("25"));
  assert(output.some((page) => page.url === "/posts/tumblr/2/"));
  assert.match(output.find((page) => page.url === "/posts/tumblr/1/").content, /Literal {{ expression }} and {% tag %}/);

  // Netlify must render the same committed posts without calling the importer.
  const previousSkip = process.env.SKIP_TUMBLR;
  t.after(() => {
    if (previousSkip === undefined) delete process.env.SKIP_TUMBLR;
    else process.env.SKIP_TUMBLR = previousSkip;
  });
  process.env.SKIP_TUMBLR = "true";
  const netlify = new Eleventy(dir, path.join(dir, "_site"), {
    configPath: false,
    config: (eleventyConfig) => require("../.eleventy")(eleventyConfig),
  });
  const deployed = await netlify.toJSON();
  assert.equal(backups, 1);
  assert.deepEqual(deployed.map((page) => page.url).sort(), output.map((page) => page.url).sort());
});

test("R2 upload failures remain fatal and preserve the completed manifest", async (t) => {
  const posts = [makePost(1)];
  const f = fixture(posts);
  const archiveDir = await directory(t);
  await backupTumblr({ config, ...f, archiveDir });
  const previous = f.objects.get("tumblr/example.tumblr.com/latest.json");
  posts[0].body = `<img src="${image}">`;
  const store = { ...f.store, async put(key, ...args) {
    if (key.includes("/media/")) throw new Error("R2 upload denied");
    return f.store.put(key, ...args);
  } };
  await assert.rejects(backupTumblr({ config, ...f, store, archiveDir }), /R2 upload denied/);
  assert.equal(f.objects.get("tumblr/example.tumblr.com/latest.json"), previous);
});

test("R2 clock errors refresh the client and re-sign the request", async () => {
  const { createClockSafeSender } = require("../bin/backup-tumblr");
  const offsets = [];
  const send = createClockSafeSender((offset) => {
    offsets.push(offset);
    const number = offsets.length;
    return { async send(command) {
      if (number === 1) throw Object.assign(new Error("The difference between the request time and the server's time is too large."), {
        name: "RequestTimeTooSkewed", $response: { headers: { date: new Date().toUTCString() } },
      });
      return command;
    } };
  });
  assert.equal(await send("upload"), "upload");
  assert.equal(offsets.length, 2);
  assert(Math.abs(offsets[1]) < 2000);
});

test("R2 inventory skips per-image requests for already uploaded files", async (t) => {
  const posts = [makePost(1)];
  posts[0].body = `<img src="${image}">`;
  const f = fixture(posts);
  const archiveDir = await directory(t);
  await backupTumblr({ config, ...f, archiveDir });
  const store = { ...f.store,
    async listKeys(prefix) { return new Set([...f.objects.keys()].filter((key) => key.startsWith(prefix))); },
    async has(key) {
      if (key.includes("/media/")) throw new Error("Should use the R2 inventory");
      return f.store.has(key);
    },
  };
  await backupTumblr({ config, ...f, store, archiveDir, resume: true });
  assert.equal(f.downloads.length, 1);
  const progress = JSON.parse(await fs.readFile(path.join(archiveDir, "progress.json"), "utf8"));
  assert.equal(progress.status, "complete");
  assert.equal(progress.savedImages, 1);
});
