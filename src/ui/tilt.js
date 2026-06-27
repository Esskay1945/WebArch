/**
 * 3D Card Tilt Effects
 * Gives interactive cards a fluid, authentic 3D hover tilt
 */

export function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-target');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Calculate tilt angles
      const tiltX = ((0.5 - y) * 10).toFixed(2);
      const tiltY = ((x - 0.5) * 10).toFixed(2);
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)`;
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
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
