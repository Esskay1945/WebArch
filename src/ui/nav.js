/**
 * Navigation Controller
 * Scroll-aware nav with hide/show, mobile menu toggle
 */

export function initNav() {
  const nav = document.getElementById('main-nav');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  // ── Scroll handling ──
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // Add scrolled class for background
        nav.classList.toggle('scrolled', scrollY > 50);

        // Hide/show on scroll direction
        if (scrollY > lastScrollY && scrollY > 200) {
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }

        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── Mobile Menu ──
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Active link highlighting ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = nav.querySelectorAll('.nav-links a');

  const linkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.style.color = isActive ? 'var(--accent)' : '';
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
  );

  sections.forEach((s) => linkObserver.observe(s));
}
