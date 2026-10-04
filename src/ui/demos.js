export function initDemos() {
  const tabs = [...document.querySelectorAll('[role="tab"][data-demo]')];
  function activate(tab, focus = false) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activate(tabs[next], true);
      }
    });
  });

  const runButton = document.getElementById("run-workflow");
  const badge = document.getElementById("workflow-badge");
  const result = document.getElementById("workflow-result");
  const steps = [...document.querySelectorAll("[data-step]")];
  let running = false;
  runButton.addEventListener("click", async () => {
    if (running) return;
    running = true;
    runButton.disabled = true;
    badge.textContent = "Simulation running";
    result.textContent = "Processing a sample enquiry…";
    steps.forEach((step) => {
      step.classList.remove("active");
      step.querySelector(".node-status").textContent = "○";
    });
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 650;
    for (const step of steps) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      step.classList.add("active");
      step.querySelector(".node-status").textContent = "✓";
    }
    badge.textContent = "Demo complete";
    result.textContent =
      "Sample lead qualified, approval simulated, CRM updated. No real data was sent.";
    runButton.innerHTML = 'Run again <span aria-hidden="true">↗</span>';
    runButton.disabled = false;
    running = false;
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const low = button.dataset.filter === "low";
      document
        .querySelectorAll("[data-filter]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      document.querySelectorAll("[data-stock]").forEach((row) => {
        row.hidden = low && row.dataset.stock !== "low";
      });
      document.getElementById("inventory-status").textContent = low
        ? "Showing 2 sample products that need attention"
        : "Showing 4 sample products";
    });
  });
}
