const recipes = require("./recipes");

// Every tag used by at least one recipe, alphabetized
module.exports = () =>
  [...new Set(recipes().flatMap((recipe) => recipe.tags || []))].sort();
