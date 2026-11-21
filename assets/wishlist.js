// Wishlist — loaded only by _includes/layouts/wishlist.njk.
// Without this script the page is still a working, anchor-linkable list.
(function () {
  var root = document.documentElement;
  var carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  var items = Array.prototype.slice.call(carousel.querySelectorAll(".item"));
  var prev = document.querySelector("[data-prev]");
  var next = document.querySelector("[data-next]");
  var dialog = document.querySelector("[data-index-dialog]");
  var currents = document.querySelectorAll("[data-current]");
  var indexLinks = document.querySelectorAll("[data-index-link]");
  var current = 0;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  root.classList.add("js");
  document.querySelectorAll("[data-nav], [data-patterns], [data-count], [data-open-index], [data-toggle-color]")
    .forEach(function (el) { el.hidden = false; });

  // ---------- Carousel + #NN-slug routing ----------

  function indexForHash(hash) {
    var id = decodeURIComponent((hash || "").replace(/^#/, ""));
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return i;
    return -1;
  }

  function setCurrent(i) {
    current = i;
    currents.forEach(function (el) { el.textContent = i + 1; });
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= items.length - 1;
    indexLinks.forEach(function (a, n) { a.setAttribute("aria-current", n === i ? "true" : "false"); });
    var hash = "#" + items[i].id;
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }

  function go(i, instant) {
    i = Math.max(0, Math.min(items.length - 1, i));
    carousel.scrollTo({ left: items[i].offsetLeft - carousel.offsetLeft, behavior: instant ? "instant" : undefined });
    setCurrent(i);
  }

  // Track which item is in view after a swipe/scroll.
  var settle;
  carousel.addEventListener("scroll", function () {
    clearTimeout(settle);
    settle = setTimeout(function () {
      var i = Math.round(carousel.scrollLeft / carousel.clientWidth);
      if (i !== current && items[i]) setCurrent(i);
    }, 80);
  }, { passive: true });

  if (prev) prev.addEventListener("click", function () { go(current - 1); });
  if (next) next.addEventListener("click", function () { go(current + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (dialog && dialog.open) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowLeft") { go(current - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { go(current + 1); e.preventDefault(); }
  });

  // Keep the page from jumping vertically when an in-page #anchor is followed.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var i = indexForHash(a.getAttribute("href"));
    if (i < 0) return;
    e.preventDefault();
    if (dialog && dialog.open) dialog.close();
    go(i);
    if (a.hasAttribute("data-permalink") && navigator.clipboard) {
      navigator.clipboard.writeText(location.href).then(function () {
        var label = a.textContent;
        a.textContent = "Copied!";
        setTimeout(function () { a.textContent = label; }, 1200);
      }, function () {});
    }
  });

  window.addEventListener("hashchange", function () {
    var i = indexForHash(location.hash);
    if (i >= 0 && i !== current) go(i);
  });

  window.addEventListener("resize", function () { go(current, true); });

  var start = indexForHash(location.hash);
  go(start < 0 ? 0 : start, true);

  // ---------- All-items dialog ----------

  var openIndex = document.querySelector("[data-open-index]");
  if (dialog && openIndex && dialog.showModal) {
    openIndex.addEventListener("click", function () { dialog.showModal(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  } else if (openIndex) {
    openIndex.hidden = true;
  }

  // ---------- Desktop pattern palette ----------

  var swatches = document.querySelectorAll("[data-pattern]");
  function setPattern(n) {
    document.body.className = document.body.className.replace(/\bpattern-\d+\b/, "").trim() + " pattern-" + n;
    swatches.forEach(function (s) { s.setAttribute("aria-pressed", s.dataset.pattern === String(n) ? "true" : "false"); });
  }
  swatches.forEach(function (s) {
    s.addEventListener("click", function () { setPattern(s.dataset.pattern); store("wishlist-pattern", s.dataset.pattern); });
  });
  setPattern(store("wishlist-pattern") || 1);
})();
