/**
 * Scroll Animations
 * Intersection Observer reveal system for .sr and [data-reveal]
 */

export function initScrollAnimations(prefersReducedMotion = false) {
  const elements = document.querySelectorAll('.sr, [data-reveal]');

  if (prefersReducedMotion) {
    elements.forEach(el => {
      el.classList.add('in', 'revealed');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in', 'revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach((el, index) => {
    // Add subtle stagger based on position in grid/list
    const delay = (index % 4) * 100;
    el.style.transitionDelay = `${delay}ms`;
    observer.observe(el);
  });
}
