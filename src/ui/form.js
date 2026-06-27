/**
 * Contact Form Handler
 * AJAX submission with smooth success state
 */

export function initForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;

    // Loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    const formData = new FormData(form);
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
      const container = form.closest('.cta-card');
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
