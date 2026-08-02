/* ============================================================================
   Hero Particle Head — scroll-pinned 3D dissolve effect
   ----------------------------------------------------------------------------
   Turns the hero photo into a WebGL point cloud. While the hero section is
   pinned (via a tall "scroll track" wrapper), scrolling orbits the cloud
   around its vertical axis and then dissolves it into drifting particles
   before the page releases and continues scrolling down normally.
   Falls back to the original static photo when WebGL, small viewports in
   low-power mode, or prefers-reduced-motion rule it out.
============================================================================ */
(() => {
  const track = document.getElementById('heroScrollTrack');
  const canvas = document.getElementById('heroParticleCanvas');
  const heroImage = document.getElementById('heroPhotoImage');
  const stage = document.getElementById('heroPhotoStage');
  const copyOverlay = document.getElementById('heroCopyOverlay');
  const hud = document.getElementById('heroHud');
  const liveBadge = document.getElementById('heroLiveBadge');
  const enterBtn = document.getElementById('heroEnter');
  const scrollCue = document.getElementById('heroScrollCue');

  if (!track || !canvas || !heroImage || !stage || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let gl;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) { gl = null; }
  if (!gl) return;

  const isSmall = window.innerWidth <= 900;
  const GRID_W = isSmall ? 84 : 132;

  // Reserve the pinned scroll length as soon as we know WebGL works, before the
  // (async) image sampling finishes, so the page never jumps under the user.
  track.classList.add('particle-active');

  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmall ? 1.6 : 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const uniforms = {
    uMix: { value: 0 },
    uRotation: { value: 0 },
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uBaseSize: { value: isSmall ? 2.3 : 1.9 },
  };

  const vertexShader = `
    attribute vec3 aScatter;
    attribute vec3 aColor;
    attribute float aRand;
    uniform float uMix;
    uniform float uRotation;
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uBaseSize;
    varying vec3 vColor;
    varying float vAlpha;
    void main(){
      vec3 base = mix(position, aScatter, uMix);
      base.y += sin(uTime * 0.6 + aRand * 6.2831) * (0.05 + uMix * 0.12);
      base.x += cos(uTime * 0.5 + aRand * 6.2831) * (0.04 + uMix * 0.10);

      float c = cos(uRotation);
      float s = sin(uRotation);
      vec3 rotated = vec3(base.x * c + base.z * s, base.y, -base.x * s + base.z * c);

      vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float size = uBaseSize * (0.55 + aRand * 0.9);
      gl_PointSize = size * uPixelRatio * (120.0 / -mvPosition.z);

      vec3 accent = vec3(0.28, 0.90, 1.0);
      vColor = mix(aColor, accent, clamp(uMix * 1.1, 0.0, 1.0));
      vAlpha = mix(1.0, 0.5, uMix);
    }
  `;

  const fragmentShader = `
    precision mediump float;
    varying vec3 vColor;
    varying float vAlpha;
    void main(){
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.05, d) * vAlpha;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  let points = null;
  let ready = false;

  function buildFromImage(img) {
    const off = document.createElement('canvas');
    const gh = Math.max(1, Math.round(GRID_W * (img.height / img.width)));
    off.width = GRID_W;
    off.height = gh;
    const ctx = off.getContext('2d');
    ctx.drawImage(img, 0, 0, GRID_W, gh);
    let data;
    try {
      data = ctx.getImageData(0, 0, GRID_W, gh).data;
    } catch (e) {
      track.classList.remove('particle-active');
      return;
    }

    const planeHeight = 11.6;
    const imageAspect = img.width / img.height;
    const planeWidth = planeHeight * imageAspect;

    const homes = [];
    const scatters = [];
    const colors = [];
    const rands = [];

    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const i = (y * GRID_W + x) * 4;
        const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
        const luma = r * 0.299 + g * 0.587 + b * 0.114;
        const keepProb = Math.min(1, luma * 2.1 + 0.14);
        if (Math.random() > keepProb) continue;

        const px = (x / GRID_W - 0.5) * planeWidth;
        const py = -(y / gh - 0.5) * planeHeight;
        homes.push(px, py, 0);

        const dir = new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1.3, (Math.random() - 0.5) * 2.2);
        if (dir.lengthSq() < 0.0001) dir.set(1, 0, 0);
        dir.normalize();
        const dist = planeHeight * (0.3 + Math.random() * 0.95);
        scatters.push(px + dir.x * dist, py + dir.y * dist, dir.z * dist * 0.55);

        colors.push(r, g, b);
        rands.push(Math.random());
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(homes, 3));
    geometry.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatters, 3));
    geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('aRand', new THREE.Float32BufferAttribute(rands, 1));

    if (points) scene.remove(points);
    points = new THREE.Points(geometry, material);
    scene.add(points);
    ready = true;

    canvas.classList.add('is-visible');
    heroImage.classList.add('is-particled');
    if (scrollCue) scrollCue.classList.add('is-visible');
  }

  const loaderImg = new Image();
  loaderImg.crossOrigin = 'anonymous';
  loaderImg.onload = () => buildFromImage(loaderImg);
  loaderImg.onerror = () => { track.classList.remove('particle-active'); }; // fall back to the plain static hero
  loaderImg.src = heroImage.currentSrc || heroImage.src;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ---- Scroll-driven progress ----------------------------------------------
  let targetRotation = 0;
  let targetMix = 0;
  let targetFade = 1;
  let curRotation = 0;
  let curMix = 0;
  let curFade = 1;

  function computeProgress() {
    if (!track.classList.contains('particle-active')) return 0;
    const scrollable = track.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    const rect = track.getBoundingClientRect();
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / scrollable));
  }

  function updateTargets() {
    const p = computeProgress();
    const rotPhase = Math.min(1, p / 0.6);
    const mixPhase = Math.max(0, (p - 0.42) / 0.58);
    targetRotation = rotPhase * 0.92;
    targetMix = Math.min(1, mixPhase);
    const fadeStart = 0.82;
    targetFade = 1 - Math.min(1, Math.max(0, (p - fadeStart) / (1 - fadeStart)));

    if (scrollCue) scrollCue.style.opacity = p > 0.03 ? '0' : '';
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { updateTargets(); ticking = false; });
    }
  }, { passive: true });
  updateTargets();

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!ready) return;

    curRotation += (targetRotation - curRotation) * 0.08;
    curMix += (targetMix - curMix) * 0.08;
    curFade += (targetFade - curFade) * 0.12;

    uniforms.uRotation.value = curRotation;
    uniforms.uMix.value = curMix;
    uniforms.uTime.value = clock.getElapsedTime();

    canvas.style.opacity = String(Math.max(0, curFade));
    if (copyOverlay) copyOverlay.style.opacity = String(Math.max(0, curFade));
    if (hud) hud.style.opacity = String(Math.max(0, curFade));
    if (liveBadge) liveBadge.style.opacity = String(Math.max(0, curFade));
    if (enterBtn) enterBtn.style.opacity = String(Math.max(0, curFade));

    renderer.render(scene, camera);
  }
  animate();
})();
