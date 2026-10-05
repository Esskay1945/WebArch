import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// All visuals are procedural. No model download, external texture or image is required.
export function initScene(shell, reducedMotion, onSelect) {
  const canvas = shell.querySelector("canvas");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return { pause() {}, resume() {}, select() {} }; // Keep the lightweight CSS sculpture visible.
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth <= 700 ? 1.25 : 1.75,
    ),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 70);
  camera.position.set(5.2, 2.8, 10.8);
  camera.lookAt(0, -0.15, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.06);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  const sculpture = new THREE.Group();
  sculpture.rotation.y = -0.16;
  scene.add(sculpture);
  const ivory = new THREE.MeshStandardMaterial({
    color: 0xd8c9ad,
    roughness: 0.38,
    metalness: 0.15,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: 0xaf7548,
    roughness: 0.27,
    metalness: 0.88,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x414940,
    roughness: 0.33,
    metalness: 0.83,
  });
  const plinthMaterial = new THREE.MeshStandardMaterial({
    color: 0x454638,
    roughness: 0.5,
    metalness: 0.35,
  });
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x252b24,
    roughness: 0.3,
    metalness: 0.7,
  });

  function archShape(outer, inner, height) {
    const s = new THREE.Shape();
    s.moveTo(-outer, -height);
    s.lineTo(-outer, 0.15);
    s.absarc(0, 0.15, outer, Math.PI, 0, true);
    s.lineTo(outer, -height);
    s.lineTo(inner, -height);
    s.lineTo(inner, 0.15);
    s.absarc(0, 0.15, inner, 0, Math.PI, false);
    s.lineTo(-inner, -height);
    s.closePath();
    return s;
  }
  const archGeometry = new THREE.ExtrudeGeometry(archShape(2, 1.43, 2.15), {
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 48,
  });
  const arch = new THREE.Mesh(archGeometry, ivory);
  arch.position.set(0.15, 0.12, -0.4);
  arch.castShadow = true;
  arch.receiveShadow = true;
  sculpture.add(arch);
  const backArch = new THREE.Mesh(archGeometry, darkMetal);
  backArch.position.set(0.15, 0.12, -0.92);
  backArch.castShadow = true;
  sculpture.add(backArch);
  const trimGeometry = new THREE.ExtrudeGeometry(archShape(1.47, 1.36, 2.15), {
    depth: 0.62,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2,
    curveSegments: 48,
  });
  const trim = new THREE.Mesh(trimGeometry, copper);
  trim.position.set(0.15, 0.12, -0.42);
  trim.castShadow = true;
  sculpture.add(trim);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3.22, 3.28, 0.2, 96),
    plinthMaterial,
  );
  base.position.set(0.05, -2.3, 0.15);
  base.castShadow = true;
  base.receiveShadow = true;
  sculpture.add(base);
  const upperBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2.93, 2.95, 0.13, 96),
    darkMetal,
  );
  upperBase.position.set(0.05, -2.14, 0.12);
  upperBase.receiveShadow = true;
  upperBase.castShadow = true;
  sculpture.add(upperBase);
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(3.22, 0.017, 8, 96),
    copper,
  );
  edge.rotation.x = Math.PI / 2;
  edge.position.set(0.05, -2.205, 0.15);
  sculpture.add(edge);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ opacity: 0.27 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.42;
  floor.receiveShadow = true;
  scene.add(floor);

  // Canvas textures are display-only illustrative UI, not functional controls.
  const textures = [];
  function texture(width, height, draw) {
    const bitmap = document.createElement("canvas");
    bitmap.width = width;
    bitmap.height = height;
    const ctx = bitmap.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");
    draw(ctx, width, height);
    const map = new THREE.CanvasTexture(bitmap);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    textures.push(map);
    return map;
  }
  function text(ctx, value, x, y, size, color = "#e9e5d9", font = "Arial") {
    ctx.fillStyle = color;
    ctx.font = `${size}px ${font}`;
    ctx.fillText(value, x, y);
  }
  function rounded(ctx, x, y, w, h, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  }
  function line(ctx, x, y, width, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, 1);
  }
  const siteTexture = texture(800, 920, (ctx, w, h) => {
    ctx.fillStyle = "#e4ded0";
    ctx.fillRect(0, 0, w, h);
    text(ctx, "FORME®", 45, 65, 29, "#38422f");
    text(ctx, "DESIGN STUDIO", 530, 61, 15, "#7b816e");
    line(ctx, 45, 90, 710, "#b8bcae");
    text(ctx, "Ideas into", 45, 187, 73, "#34402d", "Georgia");
    text(ctx, "experiences.", 45, 265, 73, "#34402d", "Georgia");
    text(ctx, "Considered design. Lasting impact.", 49, 317, 20, "#727b65");
    const gradient = ctx.createLinearGradient(0, 350, 800, 850);
    gradient.addColorStop(0, "#adb697");
    gradient.addColorStop(1, "#59664e");
    ctx.fillStyle = gradient;
    ctx.fillRect(45, 370, 710, 423);
    // An architectural arch illustration inside the website mockup.
    ctx.save();
    ctx.translate(404, 588);
    ctx.shadowColor = "#1d2b2477";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 21;
    ctx.shadowOffsetY = 18;
    ctx.lineWidth = 53;
    ctx.strokeStyle = "#d0c7af";
    ctx.beginPath();
    ctx.moveTo(-120, 205);
    ctx.lineTo(-120, 2);
    ctx.arc(0, 2, 120, Math.PI, 0);
    ctx.lineTo(120, 205);
    ctx.stroke();
    ctx.restore();
    rounded(ctx, 50, 833, 192, 39, 3, "#394730");
    text(ctx, "Explore our world  ↗", 67, 858, 17, "#e8ebde");
    text(ctx, "INDEPENDENT BY DESIGN", 480, 857, 13, "#77816a");
  });
  const voiceTexture = texture(640, 520, (ctx, w, h) => {
    ctx.fillStyle = "#222a21";
    ctx.fillRect(0, 0, w, h);
    text(ctx, "AI Voice Assistant", 34, 58, 27);
    rounded(ctx, 516, 32, 88, 30, 15, "#35492e");
    text(ctx, "● LIVE", 532, 53, 15, "#b5ca9c");
    text(ctx, "Listening. Understanding. Helping.", 34, 108, 17, "#87977b");
    const heights = [
      16, 32, 19, 60, 44, 80, 48, 106, 81, 54, 134, 102, 65, 44, 115, 81, 52,
      96, 69, 37, 21, 57, 27, 43, 22, 14,
    ];
    heights.forEach((v, i) =>
      rounded(
        ctx,
        38 + i * 21.5,
        230 - v / 2,
        6,
        v,
        3,
        i % 3 ? "#b6986c" : "#ddd0a8",
      ),
    );
    line(ctx, 34, 350, 572, "#47503e");
    text(ctx, "Your next conversation, connected.", 34, 399, 20, "#9aac8c");
    rounded(ctx, 35, 437, 137, 35, 4, "#34432c");
    text(ctx, "VOICE + AI", 54, 461, 17, "#bac9aa");
    text(ctx, "WEBARCH", 470, 463, 18, "#cfc3a6");
  });
  const opsTexture = texture(760, 620, (ctx, w, h) => {
    ctx.fillStyle = "#edece3";
    ctx.fillRect(0, 0, w, h);
    text(ctx, "Operations", 32, 59, 29, "#394531");
    text(ctx, "OVERVIEW  ↗", 560, 56, 16, "#7c896d");
    [
      [32, "Inventory", "182"],
      [268, "Orders", "24"],
      [504, "Products", "4"],
    ].forEach(([x, label, value]) => {
      rounded(ctx, x, 95, 221, 120, 6, "#dfe4d5");
      text(ctx, label, x + 18, 128, 17, "#7b886d");
      text(ctx, value, x + 18, 188, 43, "#405033");
    });
    text(ctx, "PRODUCT", 33, 263, 15, "#8a947e");
    text(ctx, "STOCK", 445, 263, 15, "#8a947e");
    text(ctx, "STATUS", 579, 263, 15, "#8a947e");
    const rows = [
      ["Ceramic cup", "84", "In stock"],
      ["Desk light", "92", "In stock"],
      ["Travel bag", "6", "Low stock"],
      ["Notebook", "0", "Sold out"],
    ];
    rows.forEach((row, i) => {
      const y = 307 + i * 67;
      line(ctx, 33, y - 18, 693, "#ccd4c1");
      rounded(
        ctx,
        33,
        y,
        27,
        29,
        4,
        ["#b89d7b", "#999e88", "#6f8260", "#667457"][i],
      );
      text(ctx, row[0], 75, y + 23, 22, "#47553c");
      text(ctx, row[1], 457, y + 23, 21, "#586849");
      rounded(ctx, 574, y - 1, 130, 32, 4, i < 2 ? "#d1e0c3" : "#e5d9bf");
      text(ctx, row[2], 588, y + 21, 17, "#6b725b");
    });
    text(ctx, "EVERYTHING, IN ONE PLACE.", 33, 591, 14, "#8b957e");
  });

  function panel(map, width, height, position, rotation) {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(
      new RoundedBoxGeometry(width + 0.075, height + 0.075, 0.105, 2, 0.055),
      frameMaterial,
    );
    frame.castShadow = true;
    group.add(frame);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map, toneMapped: false }),
    );
    face.position.z = 0.058;
    group.add(face);
    group.position.set(...position);
    group.rotation.set(...rotation);
    sculpture.add(group);
    return group;
  }
  const site = panel(
    siteTexture,
    2.35,
    2.7,
    [-0.28, -0.17, 0.77],
    [0, -0.12, -0.045],
  );
  const voice = panel(
    voiceTexture,
    1.68,
    1.365,
    [-1.72, -1.32, 1.83],
    [0, 0.12, -0.035],
  );
  const ops = panel(
    opsTexture,
    2.03,
    1.655,
    [1.56, -1.18, 1.42],
    [0, -0.24, 0.025],
  );
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 16), copper);
  sphere.position.set(2.49, -1.84, -0.15);
  sphere.castShadow = true;
  sculpture.add(sphere);

  scene.add(new THREE.AmbientLight(0xf5ead4, 0.6));
  const key = new THREE.DirectionalLight(0xffecd3, 2.7);
  key.position.set(-3, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.normalBias = 0.035;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd7dfcd, 2.2);
  rim.position.set(5, 3, -4);
  scene.add(rim);
  const warm = new THREE.PointLight(0xffbf75, 10, 8, 2);
  warm.position.set(0.3, 0.6, 0.3);
  scene.add(warm);

  let visible = true;
  let pageVisible = !document.hidden;
  let userPaused = false;
  let frame = 0;
  let lost = false;
  let pointerX = 0,
    pointerY = 0;
  let elapsed = 0,
    lastTime = 0;
  const motion = document.getElementById("motion-toggle");
  const hint = document.getElementById("scene-hint");
  const basePositions = [site, voice, ops].map((item) => item.position.y);
  const moving = () =>
    !reducedMotion.matches &&
    !userPaused &&
    !selected &&
    !down &&
    !transitioning;
  function render(time) {
    frame = 0;
    if (!visible || !pageVisible || lost) {
      lastTime = 0;
      return;
    }
    if (lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (moving()) {
      sculpture.rotation.y +=
        (dragRotation + pointerX * 0.19 - sculpture.rotation.y) * 0.045;
      sculpture.rotation.x += (pointerY * 0.045 - sculpture.rotation.x) * 0.045;
      [site, voice, ops].forEach((item, index) => {
        item.position.y =
          basePositions[index] + Math.sin(elapsed * 0.65 + index * 1.5) * 0.025;
      });
    }
    renderer.render(scene, camera);
    if (moving()) frame = requestAnimationFrame(render);
  }
  function schedule() {
    if (!frame && visible && pageVisible && !lost)
      frame = requestAnimationFrame(render);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }
  function size() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the complete sculpture framed even on a 320px-wide phone.
    camera.fov = camera.aspect < 0.85 ? 39 : 34;
    camera.updateProjectionMatrix();
    schedule();
  }
  function syncMotion() {
    const paused = reducedMotion.matches || userPaused;
    motion.setAttribute("aria-pressed", String(paused));
    motion.setAttribute(
      "aria-label",
      paused ? "Resume 3D animation" : "Pause 3D animation",
    );
    motion.innerHTML = `<span aria-hidden="true">${paused ? "▷" : "Ⅱ"}</span>`;
    motion.hidden = reducedMotion.matches;
    hint.textContent = reducedMotion.matches
      ? "Drag or choose a screen. Reduced motion respected."
      : "Drag to rotate. Tap a screen to explore.";
    stop();
    schedule();
  }
  const panels = { site, voice, ops };
  const original = Object.fromEntries(
    Object.entries(panels).map(([name, group]) => [
      name,
      { position: group.position.clone(), rotation: group.rotation.clone() },
    ]),
  );
  Object.entries(panels).forEach(([name, group]) => {
    group.userData.kind = name;
  });
  const raycaster = new THREE.Raycaster();
  const cursor = new THREE.Vector2();
  let down = null;
  let selected = null;
  let transition = 0;
  let transitioning = false;
  let dragRotation = -0.16;
  function select(kind) {
    selected = kind;
    shell.dataset.selectedScreen = kind || "";
    stop();
    transitioning = true;
    dragRotation = -0.16;
    cancelAnimationFrame(transition);
    const starts = Object.fromEntries(
      Object.entries(panels).map(([name, group]) => [
        name,
        { position: group.position.clone(), rotation: group.rotation.clone() },
      ]),
    );
    const start = performance.now();
    const duration = reducedMotion.matches ? 0 : 450;
    const initialRotation = sculpture.rotation.y;
    function update(now) {
      const t = duration ? Math.min((now - start) / duration, 1) : 1;
      const ease = 1 - Math.pow(1 - t, 3);
      sculpture.rotation.y = initialRotation + (-0.16 - initialRotation) * ease;
      Object.entries(panels).forEach(([name, group]) => {
        const targetPosition =
          name === kind
            ? new THREE.Vector3(0.6, 0.02, 2.9)
            : original[name].position;
        const targetRotation =
          name === kind
            ? new THREE.Euler(-0.03, 0.56, 0)
            : original[name].rotation;
        group.position.lerpVectors(starts[name].position, targetPosition, ease);
        group.rotation.set(
          ...["x", "y", "z"].map(
            (axis) =>
              starts[name].rotation[axis] +
              (targetRotation[axis] - starts[name].rotation[axis]) * ease,
          ),
        );
      });
      if (!lost) renderer.render(scene, camera);
      if (t < 1) transition = requestAnimationFrame(update);
      else {
        transitioning = false;
        schedule();
      }
    }
    transition = requestAnimationFrame(update);
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    stop();
    cancelAnimationFrame(transition);
    transitioning = false;
    down = {
      x: event.clientX,
      y: event.clientY,
      rotation: sculpture.rotation.y,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!down) return;
    const dx = event.clientX - down.x;
    if (Math.abs(dx) > 6 || Math.abs(event.clientY - down.y) > 6)
      down.moved = true;
    if (Math.abs(dx) > 6) {
      cancelAnimationFrame(transition);
      sculpture.rotation.y = Math.max(
        -0.95,
        Math.min(0.6, down.rotation + dx * 0.006),
      );
      dragRotation = sculpture.rotation.y;
      shell.dataset.rotation = String(dragRotation);
      if (!lost) renderer.render(scene, camera);
    }
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!down) return;
    if (!down.moved) {
      const rect = canvas.getBoundingClientRect();
      cursor.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(cursor, camera);
      const hit = raycaster.intersectObjects(Object.values(panels), true)[0];
      if (hit) {
        const kind = hit.object.parent.userData.kind;
        select(kind);
        onSelect(kind);
      }
    }
    down = null;
    schedule();
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointercancel", () => {
    down = null;
    schedule();
  });
  motion.addEventListener("click", () => {
    userPaused = !userPaused;
    syncMotion();
  });
  reducedMotion.addEventListener("change", syncMotion);
  const visibility = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) schedule();
      else stop();
    },
    { threshold: 0.01 },
  );
  visibility.observe(shell);
  const resizeObserver = new ResizeObserver(size);
  resizeObserver.observe(shell);
  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;
    if (pageVisible) schedule();
    else stop();
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    stop();
    cancelAnimationFrame(transition);
    transitioning = false;
    shell.classList.remove("scene-ready");
    motion.hidden = true;
    hint.textContent = "A new dimension of possibility";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    lost = false;
    shell.classList.add("scene-ready");
    syncMotion();
    size();
  });
  size();
  renderer.render(scene, camera);
  shell.classList.add("scene-ready");
  syncMotion();
  return {
    select,
    pause() {
      pageVisible = false;
      stop();
      cancelAnimationFrame(transition);
      transitioning = false;
    },
    resume() {
      pageVisible = !document.hidden;
      schedule();
    },
  };
}
