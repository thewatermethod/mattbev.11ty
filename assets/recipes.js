// Show only the ingredients and instructions for the chosen recipe version.
// Without JavaScript every version stays visible, labeled.
(function () {
  var picker = document.querySelector(".variants");
  if (!picker) return;

  function show(variant) {
    document.querySelectorAll("[data-variant]").forEach(function (el) {
      el.hidden = el.dataset.variant !== variant;
    });
    document.querySelectorAll("[data-hidden-for]").forEach(function (el) {
      el.hidden = el.dataset.hiddenFor.split(" ").indexOf(variant) !== -1;
    });
  }

  document.documentElement.classList.add("js");
  picker.hidden = false;
  picker.addEventListener("change", function (event) {
    show(event.target.value);
  });
  show("");
})();
// Filter the current recipe list as the search text changes.
(function () {
  var filter = document.querySelector(".recipe-filter");
  if (!filter) return;

  var input = document.getElementById("recipe-search");
  var status = document.getElementById("recipe-filter-status");
  var recipes = Array.from(document.querySelectorAll("#recipe-list li")).map(function (item) {
    return {
      element: item,
      title: item.dataset.recipeTitle.toLowerCase(),
      tags: item.dataset.recipeTags.toLowerCase(),
    };
  });

  function update() {
    var query = input.value.trim().toLowerCase();
    var count = 0;
    recipes.forEach(function (recipe) {
      var matches = recipe.title.includes(query) || recipe.tags.includes(query);
      recipe.element.hidden = !matches;
      if (matches) count++;
    });
    status.textContent = count === 0
      ? "No recipes match your search."
      : count + " recipe" + (count === 1 ? "" : "s") + " shown.";
  }

  filter.hidden = false;
  input.addEventListener("input", update);
  update();
})();
