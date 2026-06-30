/**
 * Pricing — Geo-Based Currency & Worldwide Founder Support
 * India → INR (₹), All other countries worldwide → USD ($)
 * Uses timezone, locale, and robust HTTPS GeoIP fallback
 */

import { getUserRegion } from './geo.js';

const PRICES = {
  'stat-price': { usd: '1,500', inr: '14,999' },
  'p-starter':  { usd: '1,500', inr: '14,999' },
  'p-growth':   { usd: '3,000', inr: '24,999' },
  'p-support':  { usd: '100',   inr: '1,999' },
  'p-upgrade':  { usd: '200',   inr: '4,999' }
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
    const countryName = region ? region.name : (isIndia ? 'India' : 'Worldwide');
    const flag = region ? region.flag : (isIndia ? '🇮🇳' : '🌐');
    geoNote.textContent = isIndia 
      ? `${flag} Regional Pricing (${countryName}): Supporting all Indian founders with localized INR (₹) rates.`
      : `${flag} Global Pricing (${countryName}): Supporting founders across US, UK, Australia & 100+ regions worldwide.`;
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

