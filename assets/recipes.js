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
