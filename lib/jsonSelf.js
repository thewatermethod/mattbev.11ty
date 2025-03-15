const EleventyFetch = require("@11ty/eleventy-fetch");
/**
 *
 * @returns {Promise<Array>}
 */

const fetchSelfJson = async () => {
  try {
    let selfUrl = `https://mattbev.com/feed/feed.json`;

    const data = await EleventyFetch(selfUrl, {
      duration: "1d",
      type: "json",
    });

    return data.items.slice(0, 9);
  } catch (error) {
    console.error("Error fetching data from own site", error);
    return [];
  }
};

module.exports = { fetchSelfJson };
