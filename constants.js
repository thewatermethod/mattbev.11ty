const imageAttributes = (alt = "", sizes = "100vh") => ({
  alt,
  sizes,
  loading: "lazy",
});

module.exports = { imageAttributes };
