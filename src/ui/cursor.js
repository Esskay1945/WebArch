/**
 * Custom Magnetic Cursor
 * Fluid motion with expansion on interactive elements
 */

export function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;

  // Track mouse
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Hover detection for interactive elements
  const interactiveSelectors = 'a, button, [data-magnetic], [data-magnetic-card], input, textarea, .tech-node, .glass-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.add('hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.remove('hovering');
    }
  }, { passive: true });

  // Animation loop
  function animateCursor() {
    // Dot follows instantly
    dotX += (mouseX - dotX) * 0.2;
    dotY += (mouseY - dotY) * 0.2;
    dot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;

    // Ring follows with delay
    ringX += (mouseX - ringX) * 0.08;
    ringY += (mouseY - ringY) * 0.08;
    ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}
