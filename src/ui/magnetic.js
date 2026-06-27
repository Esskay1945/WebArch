/**
 * Magnetic Interactions
 * Buttons, cards, and nav elements respond to cursor proximity
 */

export function initMagnetic() {
  const magneticElements = document.querySelectorAll('[data-magnetic]');
  const magneticCards = document.querySelectorAll('[data-magnetic-card]');

  // ── Magnetic Buttons ──
  magneticElements.forEach((el) => {
    let bounds;

    const onMouseEnter = () => {
      bounds = el.getBoundingClientRect();
    };

    const onMouseMove = (e) => {
      if (!bounds) return;
      const x = e.clientX - bounds.left - bounds.width / 2;
      const y = e.clientY - bounds.top - bounds.height / 2;

      // Gentle magnetic pull
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;

      // Inner text moves slightly more
      const inner = el.querySelector('span');
      if (inner) {
        inner.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
      }
    };

    const onMouseLeave = () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

      const inner = el.querySelector('span');
      if (inner) {
        inner.style.transform = '';
        inner.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      }

      setTimeout(() => {
        el.style.transition = '';
        if (inner) inner.style.transition = '';
      }, 500);
    };

    el.addEventListener('mouseenter', onMouseEnter, { passive: true });
    el.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseleave', onMouseLeave, { passive: true });
  });

  // ── Magnetic Cards (subtle tilt) ──
  magneticCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `
        perspective(800px)
        rotateY(${x * 4}deg)
        rotateX(${-y * 4}deg)
        translateY(-4px)
      `;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        card.style.transition = '';
      }, 600);
    }, { passive: true });
  });
}
