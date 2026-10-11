// Collapses the menu bar into a "Menu" dropdown on small screens.
// Without this script the links stay visible and wrap.
document.querySelectorAll(".menubar").forEach((bar) => {
  const toggle = bar.querySelector(".menubar__toggle");
  if (!toggle) return;

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const setOpen = (open) => toggle.setAttribute("aria-expanded", String(open));

  bar.dataset.menu = ""; // CSS only collapses the menu once this script is running
  toggle.addEventListener("click", () => setOpen(!isOpen()));

  bar.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close when focus or a click lands outside the menu bar.
  bar.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !bar.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!bar.contains(event.target)) setOpen(false);
  });
});
