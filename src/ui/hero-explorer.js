const PRODUCTS = {
  site: {
    title: "Your brand, made unmistakable.",
    description:
      "Portfolios, startup websites and custom web experiences. A considered first impression, built around your goals.",
    service: "Websites & portfolios",
  },
  voice: {
    title: "A smarter first conversation.",
    description:
      "Chatbots, calling assistants and agentic workflows. Connect enquiries, qualification and follow-ups with your business.",
    service: "AI systems & agents",
  },
  ops: {
    title: "Bring your operations together.",
    description:
      "Inventory, orders, customer portals and databases. One clear picture of the systems behind your business.",
    service: "Business software",
  },
};

// Product discovery remains usable even if the optional 3D renderer is unavailable.
export function initHeroExplorer(selectScene) {
  const root = document.querySelector(".hero-explorer");
  const detail = root.querySelector(".hero-product-detail");
  const link = root.querySelector(".hero-detail-link");
  const buttons = [...root.querySelectorAll("[data-hero-screen]")];
  let selected = null;
  function show(kind) {
    selected = kind;
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.heroScreen === kind),
      ),
    );
    detail.hidden = !kind;
    if (!kind) return;
    root.querySelector("#hero-detail-title").textContent = PRODUCTS[kind].title;
    root.querySelector("#hero-detail-text").textContent =
      PRODUCTS[kind].description;
    link.dataset.service = PRODUCTS[kind].service;
  }
  function close() {
    const previous = selected;
    show(null);
    selectScene(null);
    buttons
      .find((button) => button.dataset.heroScreen === previous)
      ?.focus({ preventScroll: true });
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      show(button.dataset.heroScreen);
      selectScene(button.dataset.heroScreen);
    }),
  );
  root.querySelector(".hero-detail-close").addEventListener("click", close);
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selected) {
      event.preventDefault();
      close();
    }
  });
  return {
    show,
    get selected() {
      return selected;
    },
  };
}
