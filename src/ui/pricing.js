/**
 * Pricing — Geo-Based Currency Detection & Toggle
 * India → INR (₹), All other countries → USD ($)
 * Uses timezone, locale, and robust HTTPS GeoIP fallback
 */

const PRICES = {
  'stat-price': { usd: '1,500', inr: '75,000' },
  'p-starter':  { usd: '1,500', inr: '75,000' },
  'p-growth':   { usd: '3,000', inr: '1,50,000' },
  'p-support':  { usd: '100',   inr: '5,000' },
  'p-upgrade':  { usd: '200',   inr: '10,000' }
};

export function initPricing() {
  const btnUsd = document.getElementById('btn-usd');
  const btnInr = document.getElementById('btn-inr');

  if (btnUsd && btnInr) {
    btnUsd.addEventListener('click', () => {
      localStorage.setItem('webarch_currency', 'USD');
      updateCurrency(false, true);
    });
    btnInr.addEventListener('click', () => {
      localStorage.setItem('webarch_currency', 'INR');
      updateCurrency(true, true);
    });
  }

  // Check saved preference first
  const saved = localStorage.getItem('webarch_currency');
  if (saved === 'INR') {
    updateCurrency(true, true);
    return;
  } else if (saved === 'USD') {
    updateCurrency(false, true);
    return;
  }

  detectLocation().then((isIndia) => {
    updateCurrency(isIndia);
  });
}

async function detectLocation() {
  // Method 1: Check timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) {
      return true;
    }
  } catch (e) {
    // Timezone detection failed
  }

  // Method 2: Check browser languages
  try {
    const languages = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (const lang of languages) {
      const l = lang.toLowerCase();
      if (
        l.endsWith('-in') ||
        l === 'hi' || l === 'bn' || l === 'te' || l === 'mr' ||
        l === 'ta' || l === 'gu' || l === 'kn' || l === 'ml' || l === 'pa'
      ) {
        return true;
      }
    }
  } catch (e) {
    // Locale detection failed
  }

  // Method 3: GeoIP fallback (api.country.is supports free HTTPS & CORS)
  try {
    const response = await fetch('https://api.country.is/', {
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.country === 'IN') {
        return true;
      }
    }
  } catch (e) {
    // api.country.is failed — try ipapi.co
    try {
      const response = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(4000),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.country_code === 'IN' || data.country === 'India') {
          return true;
        }
      }
    } catch (e2) {
      // ipapi.co failed — try ipinfo.io
      try {
        const response = await fetch('https://ipinfo.io/json', {
          signal: AbortSignal.timeout(4000),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.country === 'IN') {
            return true;
          }
        }
      } catch (e3) {
        // All detection failed
      }
    }
  }

  // Default to USD
  return false;
}

function updateCurrency(isIndia, isSaved = false) {
  const symbol = isIndia ? '₹' : '$';

  // Update active state on toggle buttons
  const btnUsd = document.getElementById('btn-usd');
  const btnInr = document.getElementById('btn-inr');
  if (btnUsd && btnInr) {
    if (isIndia) {
      btnInr.classList.add('active');
      btnUsd.classList.remove('active');
    } else {
      btnUsd.classList.add('active');
      btnInr.classList.remove('active');
    }
  }

  // Update geo note
  const geoNote = document.getElementById('geo-note');
  if (geoNote) {
    if (isSaved) {
      geoNote.textContent = isIndia ? '📍 Selected: INR (₹)' : '📍 Selected: USD ($)';
    } else {
      geoNote.textContent = isIndia ? '📍 Detected: India · Showing INR (₹)' : '📍 Detected: International · Showing USD ($)';
    }
  }

  // Update all currency symbols (.curr-sym in index.html)
  document.querySelectorAll('.curr-sym, .currency-symbol').forEach((el) => {
    animateTextChange(el, symbol);
  });

  // Update price values by element ID
  Object.keys(PRICES).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const newValue = isIndia ? PRICES[id].inr : PRICES[id].usd;
      animateTextChange(el, newValue);
    }
  });

  // Support data-inr / data-usd attributes if present
  document.querySelectorAll('[data-inr], [data-usd]').forEach((el) => {
    const newValue = isIndia ? el.dataset.inr : el.dataset.usd;
    if (newValue) {
      animateTextChange(el, newValue);
    }
  });
}

function animateTextChange(el, newText) {
  if (el.textContent === newText) return;
  el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  el.style.opacity = '0';
  el.style.transform = 'translateY(4px)';

  setTimeout(() => {
    el.textContent = newText;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 250);
}

