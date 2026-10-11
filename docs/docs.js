/**
 * Builds the color and type tables from the live tokens in css/style.css.
 * Tokens are `light-dark(light, dark)` values, so both schemes are read
 * from computed style (works over file:// too). No dependencies.
 */
(function () {
  "use strict";

  var EGA = [
    "black", "blue", "green", "cyan", "red", "magenta", "brown", "light-gray",
    "dark-gray", "light-blue", "light-green", "light-cyan", "light-red",
    "light-magenta", "yellow", "white",
  ];

  // [label, foreground token, background token]
  var PAIRS = [
    ["Body text", "--text", "--surface"],
    ["Muted text", "--text-muted", "--surface"],
    ["Link", "--link", "--surface"],
    ["Visited link", "--link-visited", "--surface"],
    ["Link hover", "--link-hover-text", "--link-hover-bg"],
    ["Titlebar", "--titlebar-text", "--titlebar-bg"],
    ["Menu bar", "--menubar-text", "--menubar-bg"],
    ["Menu hotkey", "--hotkey", "--menubar-bg"],
    ["Menu item, current", "--menubar-current-text", "--menubar-current-bg"],
    ["Panel / status bar", "--panel-text", "--panel-bg"],
    ["Panel link", "--panel-link", "--panel-bg"],
    ["Status bar alert", "--ega-white", "--ega-red"],
    ["Badge: post", "--badge-text", "--badge-post-bg"],
    ["Badge: link", "--badge-text", "--badge-link-bg"],
    ["Badge: tumblr", "--badge-text", "--badge-tumblr-bg"],
    ["Code text", "--syntax-foreground", "--syntax-background"],
    ["Code comment", "--syntax-comment", "--syntax-background"],
    ["Code keyword", "--syntax-keyword", "--syntax-background"],
    ["Code string", "--syntax-string", "--syntax-background"],
    ["Code constant", "--syntax-constant", "--syntax-background"],
    ["Code function", "--syntax-function", "--syntax-background"],
    ["Code deleted", "--syntax-deleted", "--syntax-background"],
  ];

  var STEPS = ["--step--1", "--step-0", "--step-1", "--step-2", "--step-3", "--step-4", "--step-5"];

  var root = getComputedStyle(document.documentElement);

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "style") node.style.cssText = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    if (text != null) node.textContent = text;
    return node;
  }

  /** Token value for a scheme: unwraps light-dark(a, b) and expands #abc. */
  function token(name, scheme) {
    var value = root.getPropertyValue(name).trim();
    var match = /^light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/.exec(value);
    if (match) value = scheme === "dark" ? match[2] : match[1];
    if (/^#[0-9a-f]{3}$/i.test(value)) value = value.replace(/[0-9a-f]/gi, "$&$&");
    return value.toLowerCase();
  }

  /* --- WCAG contrast --------------------------------------------------- */

  function luminance(hex) {
    return [1, 3, 5]
      .map(function (i) {
        var c = parseInt(hex.substr(i, 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      })
      .reduce(function (sum, c, i) {
        return sum + c * [0.2126, 0.7152, 0.0722][i];
      }, 0);
  }

  function contrast(a, b) {
    var la = luminance(a);
    var lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* --- Render ---------------------------------------------------------- */

  EGA.forEach(function (name) {
    var value = token("--ega-" + name);
    var li = el("li");
    li.appendChild(el("span", { class: "swatch__chip", style: "background:" + value, "aria-hidden": "true" }));
    li.appendChild(el("span", { class: "swatch__label" }, name.replace("-", " ") + " " + value));
    document.getElementById("ega-swatches").appendChild(li);
  });

  PAIRS.forEach(function (pair) {
    var tr = el("tr");
    var th = el("th", { scope: "row" });
    th.appendChild(el("span", null, pair[0]));
    th.appendChild(el("br"));
    th.appendChild(el("code", null, pair[1] + " / " + pair[2]));
    tr.appendChild(th);

    ["light", "dark"].forEach(function (scheme) {
      var fg = token(pair[1], scheme);
      var bg = token(pair[2], scheme);
      var ratio = contrast(fg, bg);
      var grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "fail";
      var td = el("td");
      var sample = el("span", { class: "pair-sample", style: "color:" + fg + ";background:" + bg });
      sample.appendChild(el("span", null, "Aa"));
      sample.appendChild(el("span", { class: "ratio", "data-grade": grade }, ratio.toFixed(2) + ":1 " + grade));
      td.appendChild(sample);
      td.appendChild(el("span", { class: "visually-hidden" }, " " + fg + " on " + bg));
      tr.appendChild(td);
    });
    document.getElementById("pairs-body").appendChild(tr);
  });

  STEPS.forEach(function (step) {
    var li = el("li");
    li.appendChild(el("code", null, step));
    li.appendChild(el("span", { style: "font-size:var(" + step + ")" }, root.getPropertyValue(step).trim()));
    document.getElementById("type-scale").appendChild(li);
  });

  var dark = window.matchMedia("(prefers-color-scheme: dark)");
  var current = document.getElementById("current-scheme");
  function updateScheme() {
    current.textContent = dark.matches ? "dark" : "light";
  }
  updateScheme();
  dark.addEventListener("change", updateScheme);
})();
