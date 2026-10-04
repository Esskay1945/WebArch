const PRICES = {
  USD: { starter: 1500, growth: 3000, support: 100, upgrade: 200 },
  INR: { starter: 14999, growth: 24999, support: 1999, upgrade: 4999 },
};

export function initPricing() {
  let currency = "USD";
  let remembered = false;
  try {
    const saved = localStorage.getItem("webarch_currency");
    if (saved in PRICES) {
      currency = saved;
      remembered = true;
    }
  } catch {
    /* Storage may be unavailable in private or restricted browsers. */
  }
  if (!remembered) {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (["Asia/Kolkata", "Asia/Calcutta"].includes(zone)) currency = "INR";
    } catch {
      /* Use the visible USD default. */
    }
  }
  function update(next) {
    currency = next;
    const formatter = new Intl.NumberFormat(
      next === "INR" ? "en-IN" : "en-US",
      {
        style: "currency",
        currency: next,
        maximumFractionDigits: 0,
      },
    );
    document.querySelectorAll("[data-price]").forEach((el) => {
      el.textContent = formatter.format(PRICES[next][el.dataset.price]);
    });
    document.querySelectorAll("[data-currency]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.currency === next),
      );
    });
    document.getElementById("region-note").textContent =
      next === "INR"
        ? "India pricing in INR. You can switch at any time."
        : "International pricing in USD. You can switch at any time.";
  }
  document.querySelectorAll("[data-currency]").forEach((button) => {
    button.addEventListener("click", () => {
      update(button.dataset.currency);
      try {
        localStorage.setItem("webarch_currency", currency);
      } catch {
        /* Optional preference. */
      }
    });
  });
  update(currency);
}
