/**
 * Pricing — Geo-Based Currency Detection
 * India → INR (₹), All other countries → USD ($)
 * Uses timezone, locale, and GeoIP fallback
 */

export function initPricing() {
  detectLocation().then((isIndia) => {
    updateCurrency(isIndia);
  });
}

async function detectLocation() {
  // Method 1: Check browser locale
  const locale = navigator.language || navigator.userLanguage || '';
  if (locale.toLowerCase().includes('in') || locale === 'hi' || locale === 'hi-IN') {
    return true;
  }

  // Method 2: Check timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) {
      return true;
    }
  } catch (e) {
    // Timezone detection failed
  }

  // Method 3: GeoIP fallback
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.country_code === 'IN' || data.country === 'India') {
        return true;
      }
    }
  } catch (e) {
    // GeoIP failed — try alternative
    try {
      const response = await fetch('https://ip-api.com/json/?fields=countryCode', {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.countryCode === 'IN') {
          return true;
        }
      }
    } catch (e2) {
      // All detection failed
    }
  }

  // Default to USD
  return false;
}

function updateCurrency(isIndia) {
  const symbol = isIndia ? '₹' : '$';

  // Update all currency symbols
  document.querySelectorAll('.currency-symbol').forEach((el) => {
    animateTextChange(el, symbol);
  });

  // Update all price values
  document.querySelectorAll('.price-value').forEach((el) => {
    const newValue = isIndia ? el.dataset.inr : el.dataset.usd;
    if (newValue) {
      animateTextChange(el, newValue);
    }
  });

  // Update support price values
  document.querySelectorAll('.support-price-value').forEach((el) => {
    const newValue = isIndia ? el.dataset.inr : el.dataset.usd;
    if (newValue) {
      animateTextChange(el, newValue);
    }
  });

  // Update hero stat if it shows starting price
  const heroStatValues = document.querySelectorAll('.hero-stat-value');
  if (heroStatValues.length > 0 && isIndia) {
    const priceEl = heroStatValues[0]; // First stat is the price
    animateTextChange(priceEl, '₹15,000');
  }
}

function animateTextChange(el, newText) {
  // Smooth fade transition
  el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  el.style.opacity = '0';
  el.style.transform = 'translateY(4px)';

  setTimeout(() => {
    el.textContent = newText;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 300);
}
