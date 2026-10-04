import "@fontsource/instrument-serif/latin-400-italic.css";
import "./style.css";
import { initNav } from "./ui/nav.js";
import { initPricing } from "./ui/pricing.js";
import { initForm } from "./ui/form.js";
import { initDemos } from "./ui/demos.js";

// Essential interactions are independent of the optional WebGL enhancement.
initNav();
initPricing();
initForm();
initDemos();
document.getElementById("year").textContent = new Date().getFullYear();

let sceneController;
const shell = document.getElementById("scene-shell");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
async function loadScene() {
  try {
    const { initScene } = await import("./three/scene.js");
    sceneController = initScene(shell, reducedMotion);
  } catch (error) {
    // The CSS sculpture stays visible, and the rest of the page keeps working.
    console.info(
      "WebArch: using the lightweight visual fallback.",
      error.message,
    );
  }
}
if ("requestIdleCallback" in window)
  window.requestIdleCallback(loadScene, { timeout: 1500 });
else window.setTimeout(loadScene, 100);
window.addEventListener("pagehide", () => sceneController?.pause());
window.addEventListener("pageshow", () => sceneController?.resume());
