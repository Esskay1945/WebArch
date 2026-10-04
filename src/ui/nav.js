export function initNav() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const mobile = window.matchMedia("(max-width: 700px)");
  function setOpen(open, returnFocus = false) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    menu.hidden = !open;
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true"),
  );
  menu
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) setOpen(false, true);
  });
  document.addEventListener("click", (event) => {
    if (!menu.hidden && !event.target.closest(".site-header")) setOpen(false);
  });
  document.addEventListener("focusin", (event) => {
    if (!menu.hidden && !event.target.closest(".site-header")) setOpen(false);
  });
  mobile.addEventListener("change", () => {
    if (!mobile.matches) setOpen(false);
  });
}
