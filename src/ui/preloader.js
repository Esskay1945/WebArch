/**
 * Cinematic Preloader with Theme-Synchronized Video Splitting
 * Light Mode (Day): Plays the 1st half of the video (Light Version)
 * Dark Mode (Night): Plays the 2nd half of the video (Dark Version)
 * Capped at exactly 7 seconds for peak responsiveness across 320px-1440px
 */

import * as THREE from 'three';

export async function initPreloader() {
  const preloader = document.getElementById('preloader');
  const preloaderCanvas = document.getElementById('preloader-canvas');
  const preloaderVideo = document.getElementById('preloader-video');
  const fillBar = document.getElementById('load-bar');
  const loadText = document.getElementById('load-text');

  if (!preloader) return;

  let hasEnded = false;
  const isNight = document.documentElement.getAttribute('data-theme') === 'night';

  return new Promise((resolve) => {
    const skipHandler = () => {
      completeLoading();
    };

    const completeLoading = () => {
      if (hasEnded) return;
      hasEnded = true;

      preloader.removeEventListener('click', skipHandler);
      preloader.removeEventListener('touchstart', skipHandler);

      if (preloaderVideo) preloaderVideo.pause();
      if (fillBar) fillBar.style.width = '100%';
      if (loadText) loadText.textContent = 'INITIALIZING [ 100% ]';

      setTimeout(() => {
        preloader.classList.add('loaded');

        setTimeout(() => {
          if (renderer) renderer.dispose();
          if (geo) geo.dispose();
          if (mat) mat.dispose();

          animateHeroEntrance();
          resolve();
        }, 800);
      }, 300);
    };

    preloader.addEventListener('click', skipHandler);
    preloader.addEventListener('touchstart', skipHandler, { passive: true });

    if (preloaderVideo) {
      preloaderVideo.style.display = 'block';
      if (preloaderCanvas) preloaderCanvas.style.display = 'none';

      const syncVideoTheme = () => {
        if (preloaderVideo.duration && preloaderVideo.duration > 0) {
          const midPoint = preloaderVideo.duration * 0.5;
          if (isNight) {
            preloaderVideo.currentTime = midPoint;
          } else {
            preloaderVideo.currentTime = 0;
          }
        }
        preloaderVideo.play().catch(() => {});
      };

      preloaderVideo.addEventListener('loadedmetadata', syncVideoTheme);
      if (preloaderVideo.readyState >= 1) syncVideoTheme();
      else preloaderVideo.play().catch(() => {});

      preloaderVideo.addEventListener('ended', completeLoading);
    }

    // Mini Three.js scene for fallback
    let renderer, scene, camera, crystal, geo, mat;
    if (preloaderCanvas) {
      renderer = new THREE.WebGLRenderer({
        canvas: preloaderCanvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(200, 200);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
      camera.position.z = 4;

      geo = new THREE.IcosahedronGeometry(1.2, 1);
      mat = new THREE.MeshBasicMaterial({
        color: 0xFF00FF,
        wireframe: true,
        transparent: true,
        opacity: 0,
      });
      crystal = new THREE.Mesh(geo, mat);
      scene.add(crystal);
    }

    const startTime = performance.now();
    const TARGET_DURATION = 7000; // Exactly 7 seconds as requested!

    function animatePreloader() {
      if (hasEnded) return;

      const elapsed = performance.now() - startTime;
      
      // Strict 7-second cap for GitHub Pages deployment
      if (elapsed >= TARGET_DURATION) {
        completeLoading();
        return;
      }

      let progress = 0;
      if (preloaderVideo && preloaderVideo.duration && preloaderVideo.duration > 0) {
        const dur = preloaderVideo.duration;
        const midPoint = dur * 0.5;

        if (isNight) {
          const segmentLen = Math.min(dur - midPoint, 7);
          const elapsedSeg = Math.max(0, preloaderVideo.currentTime - midPoint);
          progress = Math.min(Math.floor((elapsedSeg / segmentLen) * 100), 99);

          if (preloaderVideo.currentTime >= dur - 0.15 || preloaderVideo.ended) {
            completeLoading();
            return;
          }
        } else {
          const segmentLen = Math.min(midPoint, 7);
          progress = Math.min(Math.floor((preloaderVideo.currentTime / segmentLen) * 100), 99);

          if (preloaderVideo.currentTime >= midPoint) {
            completeLoading();
            return;
          }
        }
      } else {
        const t = Math.min(elapsed / TARGET_DURATION, 1);
        progress = Math.floor(easeOutExpo(t) * 99);
      }

      if (fillBar) fillBar.style.width = `${progress}%`;
      if (loadText) loadText.textContent = `INITIALIZING [ ${progress}% ]`;

      if (crystal && renderer && scene && camera) {
        crystal.rotation.y += 0.03;
        crystal.rotation.x += 0.02;
        mat.opacity = 0.8;
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animatePreloader);
    }

    animatePreloader();
  });
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateHeroEntrance() {
  const badge = document.querySelector('.hero-badge');
  const lines = document.querySelectorAll('.hero-line');
  const sub = document.querySelector('.hero-sub');
  const actions = document.querySelector('.hero-actions');
  const stats = document.querySelector('.hero-stats');

  const elements = [badge, ...lines, sub, actions, stats];
  let delay = 0;

  elements.forEach((el) => {
    if (!el) return;
    setTimeout(() => {
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
    delay += 120;
  });
}
