const { fetchCurrentlyReading } = require("../lib/storyGraph");

module.exports = async () => {
  return await fetchCurrentlyReading();
};
