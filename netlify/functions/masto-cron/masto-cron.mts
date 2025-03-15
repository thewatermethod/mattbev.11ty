import type { Config } from "@netlify/functions";
import * as Mastodon from "tsl-mastodon-api";
import { createClient } from "@libsql/client";
import { fetchTumblrPosts } from "../../../lib/tumblr";
import { fetchSelfJson } from "../../../lib/jsonSelf";
import { fetchNewsblurStarredStories } from "../../../lib/newsblur";

export default async (req: Request) => {
  const { next_run } = await req.json();

  const {
    MASTODON_ACCESS_TOKEN,
    MASTODON_API_URL,
    MASTODON_ACCOUNT_ID,
    TURSO_URL,
    TURSO_TOKEN,
  } = process.env;

  if (!MASTODON_ACCESS_TOKEN || !MASTODON_API_URL || !MASTODON_ACCOUNT_ID) {
    throw new Error(
      "Missing MASTODON_ACCESS_TOKEN or MASTODON_API_URL or MASTODON_ACCOUNT_ID"
    );
  }

  if (!TURSO_URL || !TURSO_TOKEN) {
    throw new Error("Missing TURSO_URL or TURSO_TOKEN");
  }

  let posts = await Promise.all([
    fetchNewsblurStarredStories(),
    fetchTumblrPosts(),
    fetchSelfJson(),
  ]);

  const allPosts = posts.flat();

  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  const urls = new Set();

  allPosts.forEach((post) => {
    const { url, link } = post;
    urls.add(`"${link || url}"`);
  });

  const { rows } = await turso.execute(
    `SELECT id, url FROM sites WHERE url IN (${Array.from(urls).join(", ")})`
  );

  const existingUrls = new Set(rows.map((row) => row.url));

  const newUrls = new Set() as Set<{ url: string; title: string }>;
  allPosts.forEach((post) => {
    const { url, title, link } = post;
    if (!existingUrls.has(url)) {
      newUrls.add({ url: link || url, title });
    }
  });

  const newPosts = Array.from(newUrls).map((post) => ({
    url: post.url,
    title: post.title,
  }));

  if (newPosts.length === 0) {
    return;
  }

  const mastodon = new Mastodon.API({
    access_token: MASTODON_ACCESS_TOKEN,
    api_url: MASTODON_API_URL,
  });

  // set next post for 1 hour from now
  let next_post = new Date();
  next_post.setHours(next_post.getHours() + 1);

  const promises = newPosts.map((post) => {
    // schedule mastodon post for 1 hour from now
    return Promise.all([
      mastodon.postStatus({
        status: `${post.title}\n\n${post.url}`,
        scheduled_at: next_post,
      }),
      turso.execute(`INSERT INTO sites (url) VALUES ('${post.url}')`),
      next_post.setHours(next_post.getHours() + 1),
    ]);
  });

  await Promise.all(promises);

  console.log("Received event! Next invocation at:", next_run);
};

export const config: Config = {
  schedule: "@daily",
};
