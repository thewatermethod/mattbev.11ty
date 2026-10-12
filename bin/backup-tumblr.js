#!/usr/bin/env node
const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { JSDOM } = require("jsdom");

const ARCHIVE_DIR = path.join(__dirname, "../archive/tumblr");
const PAGE_SIZE = 20;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const postId = (post) => String(post.id_string || post.id);

function loadConfig() {
  try { process.loadEnvFile(path.join(__dirname, "../.env")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const required = ["TUMBLR_API_KEY", "TUMBLR_BLOG_NAME", "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing ${missing.join(", ")}. See .env.example.`);
  const env = process.env;
  const publicUrl = new URL(env.R2_PUBLIC_URL);
  if (publicUrl.protocol !== "https:") throw new Error("R2_PUBLIC_URL must use HTTPS");
  return {
    apiKey: env.TUMBLR_API_KEY, blog: env.TUMBLR_BLOG_NAME,
    accountId: env.R2_ACCOUNT_ID, accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY, bucket: env.R2_BUCKET,
    publicUrl: publicUrl.href.replace(/\/$/, ""),
  };
}

async function request(url, fetchImpl = fetch) {
  for (let attempt = 0; attempt < 4; attempt++) {
    let response;
    try { response = await fetchImpl(url, { signal: AbortSignal.timeout(120000) }); }
    catch {
      if (attempt === 3) throw new Error(`Download failed from ${new URL(url).hostname}`);
    }
    if (response?.ok) return response;
    if (response && response.status !== 429 && response.status < 500) {
      throw new Error(`Download returned HTTP ${response.status} from ${new URL(url).hostname}`);
    }
    if (attempt === 3) throw new Error(`Download failed after retries from ${new URL(url).hostname}`);
    const retryAfter = Number(response?.headers.get("retry-after"));
    await response?.body?.cancel();
    await new Promise((resolve) => setTimeout(resolve, Math.min(30000, retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt)));
  }
}

function createClockSafeSender(createClient) {
  let client = createClient(0);
  return async (command) => {
    for (let attempt = 0; ; attempt++) {
      const activeClient = client;
      try { return await activeClient.send(command); }
      catch (error) {
        if (attempt >= 3 || !/RequestTimeTooSkewed|RequestExpired|difference between the request time and the server/i.test(`${error.name} ${error.message}`)) throw error;
        if (client === activeClient) {
          // After sleep/wake, SDK skew correction can retain an obsolete offset.
          // Use the current wall clock and server date, then re-sign with a fresh client.
          const serverTime = Date.parse(error.$response?.headers?.date);
          client = createClient(Number.isFinite(serverTime) ? serverTime - Date.now() : 0);
          console.warn("Tumblr: refreshing R2 request timestamps and retrying");
        }
      }
    }
  };
}

function createStore(config) {
  const { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
  const send = createClockSafeSender((systemClockOffset) => new S3Client({
    region: "auto", endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    maxAttempts: 4,
    systemClockOffset,
  }));
  const missing = (error) => error.$metadata?.httpStatusCode === 404;
  return {
    async get(key) {
      try {
        const result = await send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
        return JSON.parse(await result.Body.transformToString());
      } catch (error) { if (missing(error)) return null; throw error; }
    },
    async has(key) {
      try { await send(new HeadObjectCommand({ Bucket: config.bucket, Key: key })); return true; }
      catch (error) { if (missing(error)) return false; throw error; }
    },
    async put(key, body, contentType) {
      await send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: body,
        ContentType: contentType, CacheControl: key.endsWith("latest.json") ? "no-cache" : "public, max-age=31536000, immutable" }));
    },
    async listKeys(prefix) {
      const keys = new Set();
      let token;
      do {
        const page = await send(new ListObjectsV2Command({ Bucket: config.bucket, Prefix: prefix, ContinuationToken: token }));
        for (const item of page.Contents || []) keys.add(item.Key);
        token = page.IsTruncated ? page.NextContinuationToken : undefined;
        if (page.IsTruncated && !token) throw new Error("R2 image inventory pagination was incomplete");
      } while (token);
      return keys;
    },
  };
}

// Keep the API payload untouched. Download images only; AV and embed wrappers
// remain references in the posts, not files to copy to R2.
function mediaUrls(value, result = new Set()) {
  const add = (url) => {
    if (typeof url !== "string") return;
    if (url.startsWith("//")) url = `https:${url}`;
    try { if (["http:", "https:"].includes(new URL(url).protocol)) result.add(url); } catch {}
  };
  if (Array.isArray(value)) value.forEach((item) => mediaUrls(item, result));
  else if (value && typeof value === "object") {
    if (value.url && (/^image\//.test(value.type || "") ||
      (!value.type && (value.width || value.height) && /\.(?:jpe?g|png|pnj|gif|webp|avif|svg)(?:[?#]|$)/i.test(value.url)))) add(value.url);
    for (const [key, item] of Object.entries(value)) {
      if (["thumbnail_url", "video_thumbnail_url", "poster"].includes(key)) add(item);
      mediaUrls(item, result);
    }
  } else if (typeof value === "string") {
    // Legacy HTML can contain external images as well as Tumblr-hosted media.
    if (/<(?:img|video|audio|source)\b/i.test(value)) {
      const fragment = JSDOM.fragment(value);
      fragment.querySelectorAll("img,video,picture source").forEach((element) => {
        if (element.tagName !== "VIDEO") add(element.getAttribute("src"));
        add(element.getAttribute("poster"));
        for (const entry of (element.getAttribute("srcset") || "").split(",")) add(entry.trim().split(/\s+/)[0]);
      });
    }
    if (/^https?:\/\/[^/]*media\.tumblr\.com\/.*\.(?:jpe?g|png|pnj|gif|webp|avif|svg)(?:[?#]|$)/i.test(value)) add(value);
  }
  return result;
}

function rewriteMedia(value, media, publicUrl) {
  if (Array.isArray(value)) return value.map((item) => rewriteMedia(item, media, publicUrl));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteMedia(item, media, publicUrl)]));
  if (typeof value !== "string") return value;
  for (const [url, item] of Object.entries(media).sort((a, b) => b[0].length - a[0].length)) {
    const replacement = `${publicUrl}/${item.key}`;
    value = value.split(url).join(replacement).split(url.replaceAll("&", "&amp;")).join(replacement);
    if (url.startsWith("https:")) value = value.split(url.slice(6)).join(replacement);
  }
  return value;
}

async function saveJson(filename, value) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${process.pid}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await fs.rename(temporary, filename);
}

async function batches(items, work, size = 8) {
  for (let start = 0; start < items.length; start += size) {
    const results = await Promise.allSettled(items.slice(start, start + size).map(work));
    const failure = results.find((result) => result.status === "rejected");
    if (failure) throw failure.reason;
  }
}

async function workers(items, work, size = 24) {
  let cursor = 0;
  let failure;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (!failure && cursor < items.length) {
      const item = items[cursor++];
      try { await work(item); } catch (error) { failure ||= error; }
    }
  }));
  if (failure) throw failure;
}

async function backupTumblr({ config = loadConfig(), store = createStore(config), fetchImpl = fetch, archiveDir = ARCHIVE_DIR, postsDir, resume = false } = {}) {
  const prefix = `tumblr/${encodeURIComponent(config.blog)}`;
  const latestKey = `${prefix}/latest.json`;
  const previous = await store.get(latestKey);
  if (previous && (previous.version !== 1 || previous.blogName !== config.blog)) throw new Error("Unexpected Tumblr archive format or blog");
  const archive = previous || { version: 1, blogName: config.blog, posts: {}, media: {} };
  // Clone so a failed run cannot mutate an in-memory last successful snapshot.
  const next = structuredClone(archive);
  async function api(params) {
    const url = new URL(`https://api.tumblr.com/v2/blog/${encodeURIComponent(config.blog)}/posts`);
    url.search = new URLSearchParams({ api_key: config.apiKey, limit: String(PAGE_SIZE), reblog_info: "true", ...params });
    const data = await (await request(url, fetchImpl)).json();
    if (data.meta?.status !== 200 || !Array.isArray(data.response?.posts)) throw new Error("Invalid Tumblr API response");
    return data.response;
  }
  delete next.visibleIds; // Retire the old first-page-only site selection.
  const seen = new Set();
  let offset = 0;
  let total;
  const checkpointPath = path.join(archiveDir, "pending.json");
  if (resume) {
    const checkpoint = JSON.parse(await fs.readFile(checkpointPath, "utf8"));
    if (checkpoint.blogName !== config.blog || checkpoint.postIds.length !== checkpoint.publishedCount) throw new Error("Invalid Tumblr resume checkpoint");
    for (const id of checkpoint.postIds) {
      if (!/^\d+$/.test(id) || seen.has(id)) throw new Error("Invalid checkpoint post ID");
      next.posts[id] = JSON.parse(await fs.readFile(path.join(archiveDir, "posts", `${id}.json`), "utf8"));
      seen.add(id);
    }
    next.blog = checkpoint.blog;
    console.log(`Tumblr: resumed ${seen.size} saved post records`);
  }
  while (!resume) {
    const page = await api({ offset: String(offset) });
    if (!Number.isInteger(page.total_posts) || page.total_posts < 0) throw new Error("Missing Tumblr post count");
    total ??= page.total_posts;
    if (page.total_posts !== total) throw new Error("Blog changed during backup; rerun to obtain a consistent snapshot");
    next.blog = page.blog;
    if (!page.posts.length) {
      if (seen.size !== total) throw new Error("Tumblr pagination ended before all posts were saved");
      break;
    }
    const npf = await api({ offset: String(offset), npf: "true" });
    const npfPosts = new Map(npf.posts.map((post) => [postId(post), post]));
    await batches(page.posts, async (post) => {
      const id = postId(post);
      if (!/^\d+$/.test(id) || seen.has(id) || !npfPosts.has(id)) throw new Error("Tumblr pagination changed or repeated posts; rerun backup");
      seen.add(id);
      const record = { legacy: post, npf: npfPosts.get(id) };
      // Immutable raw revisions survive partial runs and later post edits/deletions.
      const raw = JSON.stringify(record);
      const revisionKey = `${prefix}/posts/${id}/${hash(raw)}.json`;
      if (!await store.has(revisionKey)) await store.put(revisionKey, raw, "application/json");
      await saveJson(path.join(archiveDir, "posts", `${id}.json`), record);
      next.posts[id] = record;
    });
    offset += page.posts.length;
    if (seen.size === total) break;
    if (seen.size > total) throw new Error("Tumblr returned more posts than expected");
    console.log(`Tumblr: saved ${seen.size}/${total} posts`);
  }
  await saveJson(checkpointPath, { blogName: config.blog, blog: next.blog, publishedCount: seen.size, postIds: [...seen] });
  // Retained/deleted posts are included, so all archived media remains recoverable.
  const media = [...mediaUrls(next.posts)];
  let savedMedia = 0;
  let checkedMedia = 0;
  next.missingImages = [];
  console.log("Tumblr: listing images already saved in R2");
  const existingKeys = store.listKeys ? await store.listKeys(`${prefix}/media/`) : null;
  if (existingKeys) console.log(`Tumblr: found ${existingKeys.size} existing R2 images`);
  let progressWrites = Promise.resolve();
  const checkpointProgress = (status) => {
    const progress = { updatedAt: new Date().toISOString(), status, totalImages: media.length,
      checkedImages: checkedMedia, savedImages: savedMedia, missingImages: next.missingImages.length };
    const failures = [...next.missingImages];
    progressWrites = progressWrites.then(async () => {
      await saveJson(path.join(archiveDir, "progress.json"), progress);
      await saveJson(path.join(archiveDir, "missing-images.json"), failures);
    });
    return progressWrites;
  };
  await checkpointProgress("copying-images");
  console.log(`Tumblr: backing up ${media.length} media files`);
  try { await workers(media, async (url) => {
    const extension = path.extname(new URL(url).pathname).match(/^\.[a-zA-Z0-9]{1,8}$/)?.[0] || "";
    const key = `${prefix}/media/${hash(url)}${extension}`;
    if (!(existingKeys ? existingKeys.has(key) : await store.has(key))) {
      let body;
      let contentType;
      try {
        const response = await request(url, fetchImpl);
        contentType = response.headers.get("content-type") || "application/octet-stream";
        if (!/^(image\/|application\/octet-stream)/i.test(contentType)) {
          await response.body?.cancel();
          throw new Error(`Image returned ${contentType}`);
        }
        body = Buffer.from(await response.arrayBuffer());
      } catch (error) {
        delete next.media[url];
        next.missingImages.push({ url, reason: error.message });
        checkedMedia++;
        console.warn(`Tumblr: missing image from ${new URL(url).hostname}: ${error.message}`);
        await checkpointProgress("copying-images");
        return;
      }
      // Storage errors are fatal; only unavailable source images may be skipped.
      await store.put(key, body, contentType);
    }
    next.media[url] = { key };
    savedMedia++;
    checkedMedia++;
    if (checkedMedia % 100 === 0 || checkedMedia === media.length) console.log(`Tumblr: checked ${checkedMedia}/${media.length} images (${savedMedia} saved, ${next.missingImages.length} missing)`);
    if (checkedMedia % 1000 === 0) await checkpointProgress("copying-images");
  }); } catch (error) {
    await checkpointProgress("interrupted");
    throw error;
  }
  await checkpointProgress("generating-markdown");
  next.completedAt = new Date().toISOString();
  next.publishedCount = seen.size;
  const body = JSON.stringify(next);
  await store.put(`${prefix}/snapshots/${hash(body)}.json`, body, "application/json");
  // Publish the manifest only after every post and media upload has succeeded.
  await store.put(latestKey, body, "application/json");
  await saveJson(path.join(archiveDir, "index.json"), {
    version: next.version,
    blogName: next.blogName,
    completedAt: next.completedAt,
    publishedCount: next.publishedCount,
    missingImageCount: next.missingImages.length,
    postIds: Object.keys(next.posts).sort(),
  });
  await saveJson(path.join(archiveDir, "missing-images.json"), next.missingImages);
  const created = await require("../lib/tumblr").writeTumblrPosts(next, { publicUrl: config.publicUrl, postsDir });
  await checkpointProgress("complete");
  console.log(`Tumblr: archived ${Object.keys(next.posts).length} posts; created ${created} Eleventy posts`);
  return next;
}

if (require.main === module) backupTumblr({ resume: process.argv.includes("--resume") }).catch((error) => {
  console.error(`Tumblr backup failed: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { backupTumblr, loadConfig, mediaUrls, rewriteMedia, createClockSafeSender, ARCHIVE_DIR };
