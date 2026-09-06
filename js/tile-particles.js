// tile-particles.js
import { capabilities } from './capabilities.js?v=5';

export function initTileParticles(cardSelector) {
    if (capabilities.prefersReducedMotion || capabilities.isLowEnd) return;

    const FRAME_MS = 1000 / 30;
    let cardStates = [];
    let rafId = null;
    let paused = false;
    let lastTs = 0;

    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
        if (!paused && !rafId && cardStates.some(s => s.visible)) {
            rafId = requestAnimationFrame(tick);
        }
    });

    // Fast, low-resolution glyph sampling to eliminate main-thread lag
    function sampleGlyphFast(symbol, W, H) {
        const sampleSize = 64;
        const off = document.createElement('canvas');
        off.width = sampleSize;
        off.height = sampleSize;
        const oc = off.getContext('2d', { willReadFrequently: true });
        if (!oc) return [];

        oc.font = '400 42px "Material Symbols Outlined"';
        oc.fillStyle = '#fff';
        oc.textAlign = 'center';
        oc.textBaseline = 'middle';
        oc.fillText(symbol, sampleSize / 2, sampleSize / 2);

        const d = oc.getImageData(0, 0, sampleSize, sampleSize).data;
        const pts = [];
        const scaleX = W / sampleSize;
        const scaleY = H / sampleSize;

        for (let y = 0; y < sampleSize; y += 2) {
            for (let x = 0; x < sampleSize; x += 2) {
                if (d[(y * sampleSize + x) * 4 + 3] > 100) {
                    pts.push({ x: x * scaleX, y: y * scaleY });
                }
            }
        }
        return pts;
    }

    function buildCard(card) {
        if (card._tileParticlesBuilt) return;
        card._tileParticlesBuilt = true;

        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }

        const [r, g, b] = (card.dataset.tileParticles || '129,236,255').split(',').map(Number);

        let symbol = card.dataset.tileSymbol || '';
        if (!symbol) {
            const el = card.querySelector('.material-symbols-outlined');
            symbol = el ? el.textContent.trim() : 'star';
        }

        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '0',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            willChange: 'transform',
        });
        card.insertBefore(canvas, card.firstChild);

        const ctx = canvas.getContext('2d');
        const W = canvas.width = card.offsetWidth || 300;
        const H = canvas.height = card.offsetHeight || 250;

        const pts = sampleGlyphFast(symbol, W, H);
        const COUNT = Math.min(pts.length, 60);
        const selected = pts.sort(() => Math.random() - 0.5).slice(0, COUNT);

        const particles = selected.map(p => ({
            tx: p.x,
            ty: p.y,
            x: Math.random() * W,
            y: Math.random() * H,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.2 + 0.6,
            baseOp: Math.random() * 0.16 + 0.05,
            phase: Math.random() * Math.PI * 2,
            wobR: Math.random() * 3.5 + 1,
            wobS: (Math.random() * 0.35 + 0.15) * 0.018,
        }));

        const s = {
            ctx, W, H, particles, r, g, b,
            hovered: false, visible: true,
            mx: -9999, my: -9999,
            mouseDirty: false, tick: 0,
        };

        card.addEventListener('mousemove', e => {
            if (!s.mouseDirty) {
                const rect = card.getBoundingClientRect();
                s.mx = e.clientX - rect.left;
                s.my = e.clientY - rect.top;
                s.hovered = true;
                s.mouseDirty = true;
            }
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            s.mx = -9999;
            s.my = -9999;
            s.hovered = false;
            s.mouseDirty = false;
        }, { passive: true });

        cardStates.push(s);

        if (!rafId) {
            rafId = requestAnimationFrame(tick);
        }
    }

    function tick(ts) {
        if (paused) {
            rafId = null;
            return;
        }

        const anyVisible = cardStates.some(s => s.visible);
        if (!anyVisible) {
            rafId = null;
            return;
        }

        rafId = requestAnimationFrame(tick);
        if (ts - lastTs < FRAME_MS) return;
        lastTs = ts;

        cardStates.forEach(s => {
            if (!s.visible) return;
            s.mouseDirty = false;
            s.tick++;
            s.ctx.clearRect(0, 0, s.W, s.H);

            const spring = s.hovered ? 0.065 : 0.025;
            const damp = 0.875;

            s.particles.forEach(p => {
                const w = Math.sin(s.tick * p.wobS + p.phase) * p.wobR;
                const hx = p.tx + Math.cos(p.phase) * w;
                const hy = p.ty + Math.sin(p.phase) * w;

                p.vx = (p.vx + (hx - p.x) * spring) * damp;
                p.vy = (p.vy + (hy - p.y) * spring) * damp;

                const dx = p.x - s.mx, dy = p.y - s.my;
                const d2 = dx * dx + dy * dy, R = 52;
                if (d2 < R * R && d2 > 0.1) {
                    const dist = Math.sqrt(d2);
                    const f = (1 - dist / R) * 2.5;
                    p.vx += (dx / dist) * f;
                    p.vy += (dy / dist) * f;
                }

                p.x += p.vx;
                p.y += p.vy;

                const op = s.hovered ? Math.min(p.baseOp * 3.2, 0.8) : p.baseOp;
                s.ctx.beginPath();
                s.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                s.ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${op})`;
                s.ctx.fill();
            });
        });
    }

    // Lazy load tile particles using IntersectionObserver
    const cards = document.querySelectorAll(cardSelector);
    if (!cards.length) return;

    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                if (entry.isIntersecting) {
                    if (!card._tileParticlesBuilt) {
                        buildCard(card);
                    } else {
                        const state = cardStates.find(s => s.ctx.canvas.parentElement === card);
                        if (state) state.visible = true;
                    }
                    if (!rafId) rafId = requestAnimationFrame(tick);
                } else {
                    const state = cardStates.find(s => s.ctx.canvas.parentElement === card);
                    if (state) state.visible = false;
                }
            });
        }, { rootMargin: '150px 0px 150px 0px', threshold: 0 });

        cards.forEach(card => cardObserver.observe(card));
    } else {
        cards.forEach(buildCard);
    }
}
