/**
 * Three.js God-Tier Cyber-Obsidian Atmosphere
 * Infinite wrapping multi-color particle grid & floating ambient neon meshes
 * Never vanishes on scroll — continuous infinite depth
 */

import * as THREE from 'three';

let scene, camera, renderer, particleSystem, glowingOrbs = [];
let targetScrollY = 0;
let currentScrollY = 0;

export function initScene(prefersReducedMotion = false) {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 35;

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Infinite Vibrant Multi-Colored Particles ──
  const pCount = prefersReducedMotion ? 500 : 1800;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(pCount * 3);
  const colors = new Float32Array(pCount * 3);
  const scales = new Float32Array(pCount);
  const phases = new Float32Array(pCount);

  // Acid-Trip Glitch Palette: Hot Magenta, Radioactive Lime, Cyan Glow, Aggressive Orange, Warning Yellow
  const palette = [
    new THREE.Color(0xFF00FF), // Hot Magenta
    new THREE.Color(0x00FF00), // Radioactive Lime
    new THREE.Color(0x00FFFF), // Cyan Glow
    new THREE.Color(0xFF4500), // Aggressive Orange
    new THREE.Color(0xFFFF00)  // Warning Yellow
  ];

  for (let i = 0; i < pCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 160;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 240; // Wide vertical spread
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 15;
    
    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    scales[i] = Math.random() * 3.0 + 0.8;
    phases[i] = Math.random() * Math.PI * 2;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  pGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  pGeo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

  const pMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCamY: { value: 0 }
    },
    vertexShader: `
      attribute float scale;
      attribute float phase;
      attribute vec3 customColor;
      uniform float uTime;
      uniform float uCamY;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = customColor;
        vec3 pos = position;
        
        // Infinite vertical wrapping around camera position so particles NEVER vanish on scroll!
        pos.y = mod(pos.y - uCamY + 120.0, 240.0) - 120.0 + uCamY;

        // Fluid wave drift
        pos.y += sin(uTime * 0.8 + phase) * 3.0;
        pos.x += cos(uTime * 0.5 + phase) * 3.0;
        pos.z += sin(uTime * 0.4 + phase * 0.5) * 2.0;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = scale * (380.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        
        vAlpha = 0.5 + 0.5 * sin(uTime * 1.5 + phase);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(pGeo, pMat);
  scene.add(particleSystem);

  // ── Floating Ambient Acid Orbs that follow camera height ──
  const orbColors = [0xFF00FF, 0x00FF00, 0x00FFFF, 0xFF4500];
  const orbOffsets = [
    [-40, 15, -25],
    [45, -10, -30],
    [-25, -40, -20],
    [35, 35, -35]
  ];

  orbColors.forEach((hex, i) => {
    const geo = new THREE.SphereGeometry(16, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: hex,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...orbOffsets[i]);
    mesh.userData = {
      baseX: orbOffsets[i][0],
      offsetY: orbOffsets[i][1],
      baseZ: orbOffsets[i][2],
      speed: 0.6 + i * 0.25,
      phase: i
    };
    scene.add(mesh);
    glowingOrbs.push(mesh);
  });

  window.addEventListener('resize', onWindowResize, { passive: true });
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function animateScene() {
  requestAnimationFrame(animateScene);

  if (!renderer || !scene || !camera) return;

  const time = performance.now() * 0.001;

  // Smooth scroll interpolation
  targetScrollY = window.__scrollY || 0;
  currentScrollY += (targetScrollY - currentScrollY) * 0.08;

  const camY = -currentScrollY * 0.025;

  if (particleSystem && particleSystem.material.uniforms) {
    particleSystem.material.uniforms.uTime.value = time;
    particleSystem.material.uniforms.uCamY.value = camY;
  }

  const mouseNX = (window.__mouse && window.__mouse.nx) || 0;
  const mouseNY = (window.__mouse && window.__mouse.ny) || 0;

  camera.position.y = camY + mouseNY * 2.5;
  camera.position.x = mouseNX * 3.5;
  camera.lookAt(0, camY, 0);

  // Orbs wrap and follow camera height so they never disappear on long scrolls
  glowingOrbs.forEach(orb => {
    orb.position.x = orb.userData.baseX + Math.sin(time * orb.userData.speed + orb.userData.phase) * 10;
    orb.position.y = camY + orb.userData.offsetY + Math.cos(time * orb.userData.speed + orb.userData.phase) * 10;
    orb.position.z = orb.userData.baseZ + Math.sin(time * 0.4) * 5;
  });

  if (particleSystem) {
    particleSystem.rotation.y = time * 0.04;
  }

  renderer.render(scene, camera);
}
