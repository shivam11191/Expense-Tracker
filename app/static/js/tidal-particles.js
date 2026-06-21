/* ================================================================
   TIDAL PARTICLES — Bioluminescent drift field
   A lightweight canvas2D layer of slow-drifting motes, like
   plankton suspended in deep water. Runs site-wide beneath the
   ambient glow blobs. Pauses when tab is hidden, respects
   prefers-reduced-motion (renders a single static frame only).
   ================================================================ */

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.createElement('canvas');
    canvas.id = 'tidal-particle-field';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;';
    document.addEventListener('DOMContentLoaded', () => {
        document.body.prepend(canvas);
        init();
    });

    const COLORS = ['#F2A93F', '#E0526B', '#7FAE7A', '#C9914A'];
    let ctx, w, h, dpr, particles = [], raf, visible = true;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticles() {
        const count = Math.min(54, Math.floor((w * h) / 28000));
        particles = Array.from({ length: count }, () => spawn());
    }

    function spawn() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.8 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 0.10,
            vy: -0.04 - Math.random() * 0.10,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: 0.10 + Math.random() * 0.22,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.004 + Math.random() * 0.006
        };
    }

    function step() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += p.pulseSpeed;
            if (p.y < -10) { Object.assign(p, spawn()); p.y = h + 10; }
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;

            const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = a;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        if (!reduceMotion && visible) raf = requestAnimationFrame(step);
    }

    function init() {
        ctx = canvas.getContext('2d');
        resize();
        makeParticles();
        step();

        window.addEventListener('resize', () => { resize(); makeParticles(); });
        document.addEventListener('visibilitychange', () => {
            visible = !document.hidden;
            if (visible && !reduceMotion) { cancelAnimationFrame(raf); step(); }
        });
    }
})();
