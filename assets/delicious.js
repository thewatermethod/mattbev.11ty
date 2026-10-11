// Filter the del.icio.us bookmarks by tag (from the #tag/... hash) and by search text.
// Without JavaScript every bookmark stays visible.
(function () {
  var search = document.querySelector(".search");
  if (!search) return;

  var input = document.getElementById("delicious-search");
  var status = document.getElementById("delicious-status");
  var allLink = document.querySelector(".all-tags");
  var tagLinks = Array.from(document.querySelectorAll(".taglist a"));
  var days = Array.from(document.querySelectorAll(".day")).map(function (day) {
    return {
      element: day,
      posts: Array.from(day.querySelectorAll(".post")).map(function (post) {
        return {
          element: post,
          tags: post.dataset.tags.split(" "),
          text: post.textContent.toLowerCase(),
        };
      }),
    };
  });

  function currentTag() {
    var match = location.hash.match(/^#tag\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function update() {
    var tag = currentTag();
    var query = input.value.trim().toLowerCase();
    var count = 0;

    days.forEach(function (day) {
      var visible = 0;
      day.posts.forEach(function (post) {
        var show =
          (!tag || post.tags.indexOf(tag) !== -1) &&
          (!query || post.text.indexOf(query) !== -1);
        post.element.hidden = !show;
        if (show) visible++;
      });
      day.element.hidden = visible === 0;
      count += visible;
    });

    tagLinks.forEach(function (link) {
      link.classList.toggle("active", link.dataset.tag === tag);
    });
    allLink.classList.toggle("active", !tag);

    if (tag || query) {
      var label = count + (count === 1 ? " bookmark" : " bookmarks");
      if (tag) label += " tagged “" + tag + "”";
      if (query) label += " matching “" + input.value.trim() + "”";
      status.textContent = label;
      var clear = document.createElement("a");
      clear.href = "#";
      clear.textContent = "show all";
      clear.addEventListener("click", function () {
        input.value = "";
        update();
      });
      status.appendChild(clear);
      status.hidden = false;
    } else {
      status.hidden = true;
    }
  }

  search.hidden = false;
  search.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  input.addEventListener("input", update);
  window.addEventListener("hashchange", function () {
    update();
    if (currentTag()) window.scrollTo(0, 0);
  });
  update();
})();
