/* ================================================================
   TIDAL 3D — Live financial sculptures
   Three.js scenes, loaded as an ES module. Each function checks
   for its target canvas and initializes only if present, so one
   shared file can serve every page. All scenes:
     - respect prefers-reduced-motion (freeze rotation, single frame)
     - cap devicePixelRatio for perf
     - pause render loop when tab is hidden
     - fail gracefully to a CSS fallback if WebGL is unavailable
   ================================================================ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PALETTE = ['#E0526B', '#7FAE7A', '#A87FD1', '#C9914A', '#D98BA0', '#F2A93F', '#5FA8A0', '#D9784F'];
const BIO = 0xF2A93F;
const EMBER = 0xE0526B;
const CURRENT = 0x7FAE7A;

function safeRenderer(canvas, opts = {}) {
    try {
        const renderer = new THREE.WebGLRenderer({
            canvas, alpha: true, antialias: true, powerPreference: 'low-power', ...opts
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        return renderer;
    } catch (e) {
        console.warn('Tidal 3D: WebGL unavailable, falling back.', e);
        canvas.closest('[data-fallback]')?.classList.add('scene-fallback-active');
        return null;
    }
}

function fitToParent(canvas, camera, renderer) {
    const parent = canvas.parentElement;
    const w = Math.max(parent.clientWidth, 50);
    const h = Math.max(parent.clientHeight, 50);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
}

function watchVisibility(loop) {
    let visible = true;
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
    return () => visible;
}

/* ────────────────────────────────────────────────────────────────
   1. HERO SCULPTURE — landing page
   Floating icosahedron core, orbiting coin-rings, drifting receipt
   cubes. Slow autonomous rotation + cursor parallax tilt.
   ──────────────────────────────────────────────────────────────── */
function initHeroSculpture() {
    const canvas = document.getElementById('hero-sculpture');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.4, 7.5);

    const renderer = safeRenderer(canvas);
    if (!renderer) return;
    fitToParent(canvas, camera, renderer);

    const group = new THREE.Group();
    scene.add(group);

    /* Core */
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x1F171C, emissive: BIO, emissiveIntensity: 0.35,
        roughness: 0.35, metalness: 0.4, transparent: true, opacity: 0.92
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const wireGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: BIO, wireframe: true, transparent: true, opacity: 0.18 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    /* Orbiting coin-rings */
    const coins = [];
    const coinColors = [BIO, EMBER, CURRENT, 0xC9914A];
    for (let i = 0; i < 4; i++) {
        const geo = new THREE.TorusGeometry(0.26, 0.07, 12, 28);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x1F171C, emissive: coinColors[i], emissiveIntensity: 0.65,
            roughness: 0.3, metalness: 0.6
        });
        const coin = new THREE.Mesh(geo, mat);
        const radius = 2.5 + i * 0.55;
        const speed = 0.18 + i * 0.05;
        const incline = (i % 2 === 0 ? 1 : -1) * (0.3 + i * 0.08);
        coins.push({ mesh: coin, radius, speed, incline, offset: i * 1.7 });
        group.add(coin);
    }

    /* Drifting receipt cubes */
    const cubes = [];
    for (let i = 0; i < 6; i++) {
        const geo = new THREE.BoxGeometry(0.22, 0.3, 0.02);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xF7F1E6, emissive: 0x271C22, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.55
        });
        const cube = new THREE.Mesh(geo, mat);
        cube.position.set((Math.random() - 0.5) * 6, -3 - Math.random() * 2, (Math.random() - 0.5) * 3);
        cube.rotation.set(Math.random(), Math.random(), Math.random());
        cubes.push({ mesh: cube, speed: 0.004 + Math.random() * 0.006, spin: 0.002 + Math.random() * 0.004 });
        scene.add(cube);
    }

    /* Lights */
    scene.add(new THREE.AmbientLight(0x3A2C28, 1.2));
    const bioLight = new THREE.PointLight(BIO, 18, 12);
    bioLight.position.set(2.5, 2, 3);
    scene.add(bioLight);
    const emberLight = new THREE.PointLight(EMBER, 10, 12);
    emberLight.position.set(-3, -1.5, 2);
    scene.add(emberLight);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    canvas.parentElement.addEventListener('mousemove', e => {
        const r = canvas.parentElement.getBoundingClientRect();
        targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
        targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });

    const isVisible = watchVisibility();
    let raf, t = 0;
    function tick() {
        if (!REDUCE_MOTION) {
            t += 0.01;
            mouseX += (targetX - mouseX) * 0.04;
            mouseY += (targetY - mouseY) * 0.04;
            group.rotation.y = t * 0.25 + mouseX * 0.35;
            group.rotation.x = mouseY * -0.2;
            core.rotation.y += 0.003;
            wire.rotation.y -= 0.0015;
            wire.rotation.x += 0.001;

            coins.forEach(c => {
                const a = t * c.speed + c.offset;
                c.mesh.position.set(Math.cos(a) * c.radius, Math.sin(a * 0.7) * c.incline, Math.sin(a) * c.radius);
                c.mesh.rotation.x += 0.01;
                c.mesh.rotation.y += 0.006;
            });

            cubes.forEach(c => {
                c.mesh.position.y += c.speed;
                c.mesh.rotation.x += c.spin;
                c.mesh.rotation.y += c.spin * 0.7;
                if (c.mesh.position.y > 3.2) c.mesh.position.y = -3.2;
            });

            bioLight.intensity = 16 + Math.sin(t * 1.4) * 4;
        }
        if (isVisible()) renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
    }
    tick();
    if (REDUCE_MOTION) renderer.render(scene, camera);

    const ro = new ResizeObserver(() => fitToParent(canvas, camera, renderer));
    ro.observe(canvas.parentElement);
}

/* ────────────────────────────────────────────────────────────────
   2. SPENDING RING — dashboard (data-driven)
   Real category data rendered as a ring of glowing 3D columns.
   Raycasting hover shows a tooltip with category + amount.
   ──────────────────────────────────────────────────────────────── */
function initSpendingRing() {
    const canvas = document.getElementById('spending-ring');
    if (!canvas) return;

    let data;
    try { data = JSON.parse(canvas.dataset.categories || '{}'); } catch { data = {}; }
    const entries = Object.entries(data).filter(([, v]) => v > 0);
    if (entries.length === 0) return;

    const tooltip = document.getElementById('ring-tooltip');
    const wrap = canvas.parentElement;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 3.6, 8.8);
    camera.lookAt(0, 0.8, 0);

    const renderer = safeRenderer(canvas);
    if (!renderer) return;
    fitToParent(canvas, camera, renderer);

    const group = new THREE.Group();
    scene.add(group);

    const maxVal = Math.max(...entries.map(([, v]) => v));
    const radius = 2.5;
    const columns = [];

    /* Base platform ring — lies flat on the floor (XZ plane), columns stand on top of it */
    const platGeo = new THREE.TorusGeometry(radius, 0.025, 8, 64);
    const platMat = new THREE.MeshBasicMaterial({ color: BIO, transparent: true, opacity: 0.3 });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.rotation.x = Math.PI / 2;
    group.add(platform);

    /* Soft floor disc beneath the ring, reinforcing the "resting on a surface" read */
    const floorGeo = new THREE.CircleGeometry(radius + 0.4, 48);
    const floorMat = new THREE.MeshBasicMaterial({ color: BIO, transparent: true, opacity: 0.035, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.01;
    group.add(floor);

    entries.forEach(([label, value], i) => {
        const angle = (i / entries.length) * Math.PI * 2;
        const heightNorm = 0.4 + (value / maxVal) * 1.9;
        const color = new THREE.Color(PALETTE[i % PALETTE.length]);

        const geo = new THREE.CylinderGeometry(0.26, 0.32, heightNorm, 8, 1);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x1F171C, emissive: color, emissiveIntensity: 0.55,
            roughness: 0.35, metalness: 0.5
        });
        const col = new THREE.Mesh(geo, mat);
        col.position.set(Math.cos(angle) * radius, heightNorm / 2, Math.sin(angle) * radius);
        col.userData = { label, value, baseY: heightNorm / 2, baseEmissive: 0.55, baseScale: 1, color };
        columns.push(col);
        group.add(col);

        /* Cap glow disc */
        const capGeo = new THREE.CircleGeometry(0.27, 16);
        const capMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.rotation.x = -Math.PI / 2;
        cap.position.set(col.position.x, heightNorm + 0.001, col.position.z);
        group.add(cap);
    });

    scene.add(new THREE.AmbientLight(0x3A2C28, 1.4));
    const key = new THREE.PointLight(BIO, 14, 14);
    key.position.set(3, 4, 3);
    scene.add(key);
    const fill = new THREE.PointLight(CURRENT, 8, 14);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    /* Raycasting hover */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered = null;

    function onMove(e) {
        const r = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(columns);

        if (hits.length) {
            const obj = hits[0].object;
            if (hovered !== obj) {
                if (hovered) { hovered.userData._hover = false; }
                hovered = obj;
                hovered.userData._hover = true;
            }
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX - wrap.getBoundingClientRect().left + 14) + 'px';
            tooltip.style.top = (e.clientY - wrap.getBoundingClientRect().top - 10) + 'px';
            tooltip.innerHTML = `<strong>${obj.userData.label}</strong><span>₹ ${obj.userData.value.toLocaleString('en-IN')}</span>`;
            canvas.style.cursor = 'pointer';
        } else {
            if (hovered) { hovered.userData._hover = false; hovered = null; }
            tooltip.style.display = 'none';
            canvas.style.cursor = 'default';
        }
    }
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', () => {
        if (hovered) { hovered.userData._hover = false; hovered = null; }
        tooltip.style.display = 'none';
        canvas.style.cursor = 'default';
    });

    const isVisible = watchVisibility();
    let t = 0;
    function tick() {
        if (!REDUCE_MOTION) {
            t += 0.006;
            group.rotation.y = t * 0.35;

            columns.forEach(c => {
                const targetScale = c.userData._hover ? 1.12 : 1;
                const targetEmissive = c.userData._hover ? 1.15 : c.userData.baseEmissive;
                c.scale.x += (targetScale - c.scale.x) * 0.15;
                c.scale.z += (targetScale - c.scale.z) * 0.15;
                c.material.emissiveIntensity += (targetEmissive - c.material.emissiveIntensity) * 0.15;
            });

            key.intensity = 12 + Math.sin(t * 2) * 3;
        }
        if (isVisible()) renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();
    if (REDUCE_MOTION) renderer.render(scene, camera);

    const ro = new ResizeObserver(() => fitToParent(canvas, camera, renderer));
    ro.observe(canvas.parentElement);
}

/* ────────────────────────────────────────────────────────────────
   3. AUTH ORB — compact value sculpture for login/register side panel
   ──────────────────────────────────────────────────────────────── */
function initAuthOrb() {
    const canvas = document.getElementById('auth-orb');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 4.2);

    const renderer = safeRenderer(canvas);
    if (!renderer) return;
    fitToParent(canvas, camera, renderer);

    const group = new THREE.Group();
    scene.add(group);

    const coreGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x1F171C, emissive: BIO, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.5
    });
    group.add(new THREE.Mesh(coreGeo, coreMat));

    const wireGeo = new THREE.IcosahedronGeometry(1.12, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: BIO, wireframe: true, transparent: true, opacity: 0.22 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    const motes = [];
    for (let i = 0; i < 2; i++) {
        const geo = new THREE.TorusGeometry(0.07, 0.022, 8, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0x1F171C, emissive: i ? EMBER : CURRENT, emissiveIntensity: 0.8 });
        const m = new THREE.Mesh(geo, mat);
        motes.push({ mesh: m, radius: 1.6 + i * 0.3, speed: 0.2 + i * 0.08, offset: i * 3 });
        scene.add(m);
    }

    scene.add(new THREE.AmbientLight(0x3A2C28, 1.3));
    const light = new THREE.PointLight(BIO, 12, 8);
    light.position.set(1.5, 1, 2);
    scene.add(light);

    const isVisible = watchVisibility();
    let t = 0;
    function tick() {
        if (!REDUCE_MOTION) {
            t += 0.008;
            group.rotation.y = t * 0.4;
            group.rotation.x = Math.sin(t * 0.5) * 0.15;
            wire.rotation.y -= 0.002;
            motes.forEach(m => {
                const a = t * m.speed + m.offset;
                m.mesh.position.set(Math.cos(a) * m.radius, Math.sin(a * 1.4) * 0.5, Math.sin(a) * m.radius);
            });
        }
        if (isVisible()) renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();
    if (REDUCE_MOTION) renderer.render(scene, camera);

    const ro = new ResizeObserver(() => fitToParent(canvas, camera, renderer));
    ro.observe(canvas.parentElement);
}

/* ────────────────────────────────────────────────────────────────
   4. EXPENSE COIN — small rotating coin for add/edit form panels
   ──────────────────────────────────────────────────────────────── */
function initExpenseCoin() {
    const canvas = document.getElementById('expense-coin');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    camera.position.set(0, 0, 3.4);

    const renderer = safeRenderer(canvas);
    if (!renderer) return;
    fitToParent(canvas, camera, renderer);

    const geo = new THREE.CylinderGeometry(0.85, 0.85, 0.16, 36);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x1F171C, emissive: BIO, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.65
    });
    const coin = new THREE.Mesh(geo, mat);
    coin.rotation.x = Math.PI / 2.6;
    scene.add(coin);

    const ringGeo = new THREE.TorusGeometry(0.85, 0.04, 10, 40);
    const ringMat = new THREE.MeshBasicMaterial({ color: EMBER, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.6;
    scene.add(ring);

    scene.add(new THREE.AmbientLight(0x3A2C28, 1.4));
    const light = new THREE.PointLight(BIO, 10, 6);
    light.position.set(1.2, 1, 2);
    scene.add(light);

    const isVisible = watchVisibility();
    let t = 0;
    function tick() {
        if (!REDUCE_MOTION) {
            t += 0.012;
            coin.rotation.z += 0.014;
            ring.rotation.z -= 0.008;
            coin.position.y = Math.sin(t) * 0.08;
        }
        if (isVisible()) renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();
    if (REDUCE_MOTION) renderer.render(scene, camera);

    const ro = new ResizeObserver(() => fitToParent(canvas, camera, renderer));
    ro.observe(canvas.parentElement);
}

/* ── Boot ──────────────────────────────────────────────────────── */
initHeroSculpture();
initSpendingRing();
initAuthOrb();
initExpenseCoin();
