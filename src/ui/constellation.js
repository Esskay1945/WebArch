/**
 * Tech Stack Constellation
 * Interconnected glowing nodes on a 2D canvas
 */

export function initConstellation() {
  const canvas = document.getElementById('constellation-canvas');
  const container = document.getElementById('tech-constellation');
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let nodes = [];
  let animationId;

  // Match canvas to container
  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    generateNodes();
  }

  function generateNodes() {
    nodes = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1.5 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.25,
      });
    }
  }

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw nodes
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      // Boundary bounce
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      // Mouse repulsion
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        node.vx += (dx / dist) * 0.05;
        node.vy += (dy / dist) * 0.05;
      }

      // Damping
      node.vx *= 0.99;
      node.vy *= 0.99;

      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 108, 247, ${node.alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.08;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(74, 108, 247, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  // Use Intersection Observer to only animate when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!animationId) animate();
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  resize();
  observer.observe(container);
  window.addEventListener('resize', resize);
}
