const { DateTime } = require("luxon");
const { decode } = require("html-entities");

const EleventyFetch = require("@11ty/eleventy-fetch");

const { NEWSBLUR_USERNAME, NEWSBLUR_PASSWORD } = process.env;

// const newsblurUrl = `https://newsblur.com/reader/starred_stories?username=${NEWSBLUR_USERNAME}&password=${NEWSBLUR_PASSWORD}`;
// const data = await EleventyFetch(newsblurUrl, {
//   duration: "1d",
//   type: "json",
//   method: "POST",
// });

const login = async () => {
  if (!NEWSBLUR_USERNAME || !NEWSBLUR_PASSWORD) {
    throw new Error(
      "Missing NEWSBLUR_USERNAME or NEWSBLUR_PASSWORD environment variables"
    );
  }
  const loginUrl = `https://newsblur.com/api/login`;

  const attempts = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: NEWSBLUR_USERNAME,
      password: NEWSBLUR_PASSWORD,
    }),
  });

  const { result } = await attempts.json();
  if (result === "ok") {
    const cookie = attempts.headers.getSetCookie();
    return cookie;
  }

  return false;
};

const parseNewsblurStarredStories = (starred) => {
  return starred.stories.map((story) => {
    const {
      story_title: title,
      story_permalink: permalink,
      starred_date: date,
      user_tags: tags,
      guid_hash: uuid,
      starred_timestamp,
    } = story;

    return {
      title: decode(title),
      permalink: `/posts/${uuid}`,
      date: DateTime.fromSeconds(starred_timestamp).toFormat("y-MM-dd"),
      type: "link",
      url: permalink,
      tags,
    };
  });
};

const fetchNewsblurStarredStories = async () => {
  const auth = await login();
  if (!auth) {
    console.error("Failed to authenticate with NewsBlur");
    return [];
  }
  const headers = {
    Cookie: auth,
  };

  const starredUrl = `https://newsblur.com/reader/starred_stories`;
  const response = await fetch(starredUrl, {
    headers,
  });

  const starred = await response.json();

  return parseNewsblurStarredStories(starred);
};

module.exports = {
  fetchNewsblurStarredStories,
};
