/**
 * Automatic Time-Based Theme Engine (The "Acid-Trip Glitch")
 * Pure automatic shifting based on local system clock:
 * Day Mode (6:00 to 17:59): Acid Yellow Burn-In
 * Night Mode (18:00 to 5:59): Deep-Glitch Matrix Green
 */

export function initTheme() {
  function applyTimeTheme() {
    const hours = new Date().getHours();
    // 6 AM to 6 PM is Day mode, otherwise Night mode
    const isDay = hours >= 6 && hours < 18;
    const theme = isDay ? 'day' : 'night';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme-color meta tag for browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDay ? '#FFF000' : '#0D0D0D');
    }
  }

  applyTimeTheme();

  // Check every minute to handle transitions seamlessly
  setInterval(applyTimeTheme, 60000);
}
