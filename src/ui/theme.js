/**
 * Automatic Time-Based Theme Engine (The "Acid-Trip Glitch")
 * Pure automatic shifting based on local system clock:
 * Day Mode (6:00 to 17:59): Acid Yellow Burn-In
 * Night Mode (18:00 to 5:59): Deep-Glitch Matrix Green
 */

export function initTheme() {
  function updateThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'day' ? '#FFF000' : '#1A0033');
    }
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = theme === 'day' ? '🌙' : '☀️';
    }
  }

  function applyTimeTheme() {
    const saved = localStorage.getItem('webarch_theme');
    if (saved) {
      updateThemeUI(saved);
      return;
    }
    const hours = new Date().getHours();
    const isDay = hours >= 6 && hours < 18;
    updateThemeUI(isDay ? 'day' : 'night');
  }

  applyTimeTheme();
  setInterval(applyTimeTheme, 60000);

  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      applyTimeTheme(); // ensure icon is set once DOM is loaded
      const toggleBtn = document.getElementById('theme-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme') || 'day';
          const next = current === 'day' ? 'night' : 'day';
          localStorage.setItem('webarch_theme', next);
          updateThemeUI(next);
        });
      }
    });
  }
}
