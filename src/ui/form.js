/**
 * Contact Form Handler
 * AJAX submission with location-detected automatic country phone prefix & smooth success state
 */

import { getUserRegion, getCountryDataByPrefix } from './geo.js';

export function initForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const phoneInput = document.getElementById('phone-input');
  const phoneFlag = document.getElementById('phone-flag');
  const phoneCode = document.getElementById('phone-code');
  const phoneHidden = document.getElementById('phone-hidden');

  let currentPrefix = '+1';

  // Initialize region detection for phone field
  getUserRegion().then((region) => {
    if (region) {
      currentPrefix = region.prefix;
      if (phoneFlag) phoneFlag.textContent = region.flag;
      if (phoneCode) phoneCode.textContent = region.prefix;
      if (phoneInput && !phoneInput.value) {
        phoneInput.placeholder = region.placeholder || '(555) 000-0000';
      }
    }
  });

  // Dynamic detection as user types or pastes international code
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.startsWith('+')) {
        // Check longest matching prefixes first (up to 5 chars e.g. +1-xxx, +358, +971)
        for (let len = 5; len >= 2; len--) {
          const sub = val.substring(0, len);
          const matched = getCountryDataByPrefix(sub);
          if (matched) {
            currentPrefix = matched.prefix;
            if (phoneFlag) phoneFlag.textContent = matched.flag;
            if (phoneCode) phoneCode.textContent = matched.prefix;
            
            // Strip the prefix from text box so user just enters their local number
            const remainder = val.substring(len).trim();
            if (remainder.length > 0) {
              phoneInput.value = remainder;
            }
            break;
          }
        }
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;

    // Set combined phone value into hidden field before FormData extraction
    if (phoneInput && phoneHidden) {
      let rawPhone = phoneInput.value.trim();
      if (rawPhone.startsWith(currentPrefix) || rawPhone.startsWith('+')) {
        phoneHidden.value = rawPhone;
      } else {
        phoneHidden.value = `${currentPrefix} ${rawPhone}`;
      }
    }

    // Loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    const formData = new FormData(form);
    // Remove raw phone_raw field so only formatted phone is sent
    formData.delete('phone_raw');
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://formsubmit.co/ajax/esskay400d@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Success state
      const container = form.closest('.cta-box, .cta-card');
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; position: relative; z-index: 2;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(200,255,0,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 32px;">
              <svg fill="none" stroke="#c8ff00" stroke-width="2.5" viewBox="0 0 24 24" style="width: 40px; height: 40px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
              </svg>
            </div>
            <h2 class="cta-title">Request Received!</h2>
            <p class="cta-sub" style="margin-top: 16px;">Thank you for booking a call. We've received your details and will be in touch shortly to confirm your discovery call time.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      submitBtn.textContent = 'Error — Try Again';
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'auto';

      setTimeout(() => {
        submitBtn.textContent = originalText;
      }, 3000);
    }
  });
}
