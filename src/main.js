/**
 * WebArch — God-Tier Light Theme Website
 * Main Entry Point — Orchestrates everything
 */

import './style.css';
import { initTheme } from './ui/theme.js';
import { initScene, animateScene } from './three/scene.js';
import { initScrollAnimations } from './ui/scroll.js';
import { initCursor } from './ui/cursor.js';
import { initMagnetic } from './ui/magnetic.js';
import { initNav } from './ui/nav.js';
import { initPricing } from './ui/pricing.js';
import { initForm } from './ui/form.js';
import { initConstellation } from './ui/constellation.js';
import { initTiltCards } from './ui/tilt.js';
import { initPreloader } from './ui/preloader.js';
import { initHeroAnimations } from './ui/hero.js';
import { initTitleHovers } from './ui/titles.js';

// Initialize time-based Acid-Trip Glitch theme immediately
initTheme();

// Global mouse state (shared across modules)
window.__mouse = { x: 0, y: 0, nx: 0, ny: 0 };
document.addEventListener('mousemove', (e) => {
  window.__mouse.x = e.clientX;
  window.__mouse.y = e.clientY;
  window.__mouse.nx = (e.clientX / window.innerWidth - 0.5) * 2;
  window.__mouse.ny = (e.clientY / window.innerHeight - 0.5) * -2;
}, { passive: true });

// Global scroll state
window.__scrollY = 0;
window.addEventListener('scroll', () => {
  window.__scrollY = window.scrollY;
}, { passive: true });

// ── Preloader first, then initialize main site ──
initPreloader().then(() => {
  initSite();
});

function initSite() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Three.js scene
  initScene(prefersReducedMotion);
  animateScene();

  // Initialize all UI systems
  initNav();
  initPricing();
  initForm();
  initConstellation();
  initTiltCards();
  initScrollAnimations(prefersReducedMotion);
  initHeroAnimations();
  initTitleHovers();

  if (!prefersReducedMotion && window.innerWidth > 768) {
    initCursor();
    initMagnetic();
  }
}
