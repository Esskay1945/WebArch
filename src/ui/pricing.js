/**
 * Pricing — Geo-Based Currency Detection & Toggle
 * India → INR (₹), All other countries → USD ($)
 * Uses timezone, locale, and robust HTTPS GeoIP fallback
 */

import { getUserRegion } from './geo.js';

const PRICES = {
  'stat-price': { usd: '1,500', inr: '15,000' },
  'p-starter':  { usd: '1,500', inr: '15,000' },
  'p-growth':   { usd: '3,000', inr: '25,000' },
  'p-support':  { usd: '100',   inr: '2,000' },
  'p-upgrade':  { usd: '200',   inr: '5,000' }
};

export function initPricing() {
  getUserRegion().then((region) => {
    updateCurrency(region.isIndia, region);
  });
}

function updateCurrency(isIndia, region = null) {
  const symbol = isIndia ? '₹' : '$';

  // Update geo note
  const geoNote = document.getElementById('geo-note');
  if (geoNote) {
    const countryName = region ? region.name : (isIndia ? 'India' : 'Global');
    const flag = region ? region.flag : (isIndia ? '🇮🇳' : '📍');
    geoNote.textContent = isIndia ? `${flag} Regional Pricing (${countryName}): INR (₹)` : `${flag} Global Pricing (${countryName}): USD ($)`;
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

