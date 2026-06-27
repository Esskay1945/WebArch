/**
 * Hero Section Animations
 * Smooth, award-winning staggered entrance using GSAP
 */

import gsap from 'gsap';

export function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Set initial states
  gsap.set(['#hero-badge', '#hero-h1', '#hero-sub', '#hero-ctas', '#hero-stats'], {
    opacity: 0,
    y: 30
  });

  // Staggered entrance timeline
  tl.to('#hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0.1)
    .to('#hero-h1', { opacity: 1, y: 0, duration: 1.0 }, 0.25)
    .to('#hero-sub', { opacity: 1, y: 0, duration: 0.9 }, 0.45)
    .to('#hero-ctas', { opacity: 1, y: 0, duration: 0.8 }, 0.65)
    .to('#hero-stats', { opacity: 1, y: 0, duration: 0.8 }, 0.85);

  // Parallax subtle float on hero stats or mouse movement
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      
      gsap.to('#hero-badge', { x: nx * 10, y: ny * 5, duration: 1, ease: 'power2.out' });
      gsap.to('#hero-h1', { x: nx * 15, y: ny * 8, duration: 1, ease: 'power2.out' });
    });
  }
}
