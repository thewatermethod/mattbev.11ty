import type { Config } from "@netlify/functions";
import * as Mastodon from "tsl-mastodon-api";
import { createClient } from "@libsql/client";
import { fetchTumblrPosts } from "../../../lib/tumblr";
import { fetchSelfJson } from "../../../lib/jsonSelf";
import { fetchNewsblurStarredStories } from "../../../lib/newsblur";

export default async (req: Request) => {
  const {
    MASTODON_ACCESS_TOKEN,
    MASTODON_API_URL,
    MASTODON_ACCOUNT_ID,
    TURSO_URL,
    TURSO_TOKEN,
  } = process.env;

  if (!MASTODON_ACCESS_TOKEN || !MASTODON_API_URL || !MASTODON_ACCOUNT_ID) {
    console.error(
      "Missing MASTODON_ACCESS_TOKEN or MASTODON_API_URL or MASTODON_ACCOUNT_ID"
    );
    throw new Error(
      "Missing MASTODON_ACCESS_TOKEN or MASTODON_API_URL or MASTODON_ACCOUNT_ID"
    );
  }

  if (!TURSO_URL || !TURSO_TOKEN) {
    console.error("Missing TURSO_URL or TURSO_TOKEN");
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

  const query = `SELECT id, url FROM sites WHERE url IN (${Array.from(
    urls
  ).join(", ")})`;

  console.info(`Executing query: ${query}`);

  const { rows } = await turso.execute(query);

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
    console.info("No new posts!");
    return;
  }

  console.info(`Posting ${newPosts.length} new posts`);

  const mastodon = new Mastodon.API({
    access_token: MASTODON_ACCESS_TOKEN,
    api_url: MASTODON_API_URL,
  });

  // set next post for 1 hour from now
  let nextPost = new Date();
  nextPost.setHours(nextPost.getHours() + 1);

  const promises = newPosts.map((post) => {
    console.info("Posting:", post.title, post.url, nextPost);
    nextPost.setHours(nextPost.getHours() + 1);
    return Promise.all([
      mastodon.postStatus({
        status: `${post.title}\n\n${post.url}`,
        scheduled_at: nextPost,
      }),
      turso.execute(`INSERT INTO sites (url) VALUES ('${post.url}')`),
    ]);
  });

  await Promise.all(promises);
};

export const config: Config = {
  schedule: "@daily",
};
