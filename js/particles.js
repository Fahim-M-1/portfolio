// particles.js
import { capabilities } from './capabilities.js?v=5';

export function initParticles(canvas) {
    if (!canvas) return;

    if (capabilities.prefersReducedMotion) { 
        canvas.style.display = 'none'; 
        return; 
    }

    const ctx = canvas.getContext('2d');

    // ── Palette ──────────────────────────────────────────────────
    const COLORS = [
        'rgba(255, 255, 255, VAL)',  // pure white
        'rgba(226, 232, 240, VAL)',  // slate 200 (light gray)
        'rgba(186, 230, 253, VAL)',  // sky 200 (faint blue star)
        'rgba(241, 245, 249, VAL)',  // slate 100
    ];

    // ── Config ───────────────────────────────────────────────────
    const CONFIG = {
        count: capabilities.isLowEnd ? 200 : 500,  // starry sky density (reduced on low-end)
        minSize: 0.5,
        maxSize: 2.2,
        ringRadius: 115,       // target orbital radius (px)
        influenceRadius: 220,  // outer boundary where ring pulls particles
        ringStrength: 5.2,     // orbital force strength
        returnSpeed: 0.042,    // spring back to home (slower = ring lingers longer)
        damping: 0.86,         // friction — higher = smoother orbit
        baseOpacityMin: 0.1,
        baseOpacityMax: 0.8,
        driftSpeed: 0.08,      // very slow drift for stars
    };

    let W, H;
    let mouse = { x: -9999, y: -9999 };
    let particles = [];
    let animId;

    // ── Particle factory ─────────────────────────────────────────
    function createParticle() {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const baseOpacity = CONFIG.baseOpacityMin +
            Math.random() * (CONFIG.baseOpacityMax - CONFIG.baseOpacityMin);
        const colorTemplate = COLORS[Math.floor(Math.random() * COLORS.length)];
        const size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
        // Slow idle drift
        const driftAngle = Math.random() * Math.PI * 2;
        const driftAmp = (Math.random() * 0.4 + 0.1) * CONFIG.driftSpeed;

        // Twinkle properties
        const twinkleSpeed = 0.01 + Math.random() * 0.04;
        const twinklePhase = Math.random() * Math.PI * 2;
        const twinkleAmp = baseOpacity * 0.6;

        return {
            ox: x, oy: y,         // home / origin position
            x, y,                 // current position
            vx: 0, vy: 0,         // velocity
            size,
            colorTemplate,
            baseOpacity,
            twinkleSpeed,
            twinklePhase,
            twinkleAmp,
            driftAngle,
            driftAmp,
            driftOffset: Math.random() * Math.PI * 2, // phase offset
        };
    }

    function initParticlePool() {
        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push(createParticle());
        }
    }

    // ── Resize handler ───────────────────────────────────────────
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        // Re-scatter particles proportionally
        particles.forEach(p => {
            p.ox = Math.random() * W;
            p.oy = Math.random() * H;
            p.x = p.ox;
            p.y = p.oy;
            p.vx = 0;
            p.vy = 0;
        });
    }

    // ── Animation loop ───────────────────────────────────────────
    let tick = 0;
    function animate() {
        animId = requestAnimationFrame(animate);
        tick++;
        ctx.clearRect(0, 0, W, H);

        particles.forEach(p => {
            // ── Idle sinusoidal drift (very subtle) ──
            const drift = Math.sin(tick * 0.008 + p.driftOffset) * p.driftAmp;
            const driftX = Math.cos(p.driftAngle) * drift;
            const driftY = Math.sin(p.driftAngle) * drift;
            const homeX = p.ox + driftX;
            const homeY = p.oy + driftY;

            // ── Spring force back to drifted home ──
            const fx = (homeX - p.x) * CONFIG.returnSpeed;
            const fy = (homeY - p.y) * CONFIG.returnSpeed;
            p.vx = (p.vx + fx) * CONFIG.damping;
            p.vy = (p.vy + fy) * CONFIG.damping;

            // ── Mouse orbital-ring force ──────────────────────────
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const distSq = dx * dx + dy * dy;
            const infSq = CONFIG.influenceRadius * CONFIG.influenceRadius;

            if (distSq < infSq && distSq > 0.01) {
                const dist = Math.sqrt(distSq);
                const nx = dx / dist;  // unit vector: mouse → particle
                const ny = dy / dist;

                // Orbital force: push out when inside ring, pull in when outside
                // ringForce > 0 → push away; < 0 → pull toward mouse
                const ringForce = (CONFIG.ringRadius - dist) / CONFIG.ringRadius
                    * CONFIG.ringStrength;
                p.vx += nx * ringForce;
                p.vy += ny * ringForce;
            }

            // ── Integrate ──
            p.x += p.vx;
            p.y += p.vy;

            // ── Draw particle ──
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

            // Twinkle math
            let currentOpacity = p.baseOpacity + Math.sin(tick * p.twinkleSpeed + p.twinklePhase) * p.twinkleAmp;
            if (currentOpacity < 0.05) currentOpacity = 0.05;
            if (currentOpacity > 1) currentOpacity = 1;

            ctx.fillStyle = p.colorTemplate.replace('VAL', currentOpacity.toFixed(2));
            ctx.fill();
        });

        // ── Draw faint cursor guide-ring ─────────────────────────
        if (mouse.x > -100) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, CONFIG.ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // ── Mouse tracking ───────────────────────────────────────────
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // ── Touch support ─────────────────────────────────────────────
    window.addEventListener('touchmove', e => {
        const t = e.touches[0];
        mouse.x = t.clientX;
        mouse.y = t.clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // ── Init ─────────────────────────────────────────────────────
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticlePool();
    animate();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animId);
        resize();
        animate();
    });
}
