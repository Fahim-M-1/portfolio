/* ============================================================
   PARTICLE BACKGROUND SYSTEM
   - Orbital ring: particles form a circle around the cursor
   - Inside ring → pushed outward; outside ring → pulled inward
   - Faint guide-ring drawn around the cursor
   - Particles spring back to home when cursor is away
   ============================================================ */
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
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
        count: 500,            // starry sky density
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
            const infSq  = CONFIG.influenceRadius * CONFIG.influenceRadius;

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
})();

/* ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const navItems = document.querySelectorAll('.nav-item');
    const sections = Array.from(navItems).map(item => item.getAttribute('href').substring(1));

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(item => {
            if (item.getAttribute('href') === `#${entry.target.id}`) {
              item.classList.add('text-[#00E5FF]', 'font-bold', 'border-b-2', 'border-[#00E5FF]', 'pb-1');
              item.classList.remove('text-white/70');
            } else {
              item.classList.remove('text-[#00E5FF]', 'font-bold', 'border-b-2', 'border-[#00E5FF]', 'pb-1');
              item.classList.add('text-white/70');
            }
          });
        }
      });
    };

    const navObserver = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });

    // 3. Scroll Reveal Animations (Replacing framer-motion)
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const animationObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered delay if provided via data attribute
                const delay = entry.target.getAttribute('data-delay') || '0';
                entry.target.style.transitionDelay = `${delay}s`;
                
                // Remove starting transforms, opacity will be handled by utility classes
                entry.target.classList.remove('opacity-0', 'translate-y-8', 'translate-x-[50px]', '-translate-x-[50px]', 'scale-90');
                entry.target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0', 'scale-100');
                
                // Unobserve after animating once (viewport={{ once: true }})
                obs.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0 });

    animateElements.forEach(el => {
        // Enforce transition-all on elements so they animate smoothly
        el.classList.add('transition-all', 'duration-700', 'ease-out');
        animationObserver.observe(el);
    });
    
    // 4. Progress Bars Animations
    const progressBars = document.querySelectorAll('.progress-bar');
    const progressObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.getAttribute('data-width');
                entry.target.style.width = targetWidth;
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => {
        bar.style.width = '0%';
        bar.style.transition = 'width 1.5s ease-out';
        progressObserver.observe(bar);
    });

    // 5. Contact nav → scroll to contact-tile + ripple highlight
    const contactNavLink = document.querySelector('a.nav-item[href="#contact"]');
    const contactTile = document.getElementById('contact-tile');

    if (contactNavLink && contactTile) {
        contactNavLink.addEventListener('click', function(e) {
            e.preventDefault();

            // Smooth scroll to the tile, vertically centered in viewport
            contactTile.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Fire the highlight ripple after scroll finishes (~600 ms)
            setTimeout(() => {
                // Remove then re-add to restart the animation if clicked again
                contactTile.classList.remove('contact-highlight');
                void contactTile.offsetWidth; // force reflow
                contactTile.classList.add('contact-highlight');
                contactTile.addEventListener('animationend', () => {
                    contactTile.classList.remove('contact-highlight');
                }, { once: true });
            }, 600);
        });
    }
});

// Fallback: Copy Email to Clipboard
window.copyEmail = function(e, btn) {
    const emailToCopy = "fahimsndrd@gmail.com";
    
    const showSuccess = () => {
        const originalText = "Get in Touch";
        btn.innerText = "Email Copied!";
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2500);
    };

    const fallbackCopy = () => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = emailToCopy;
            textArea.style.position = "fixed";  // Fixed position prevents scrolling to bottom of page
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccess();
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
    };

    // Use Modern API if we are in a secure context (Localhost or HTTPS), otherwise fallback.
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(emailToCopy).then(showSuccess).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}
// Gallery Logic
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.gallery-container').forEach(container => {
        const images = container.querySelectorAll('img');
        const indicator = container.querySelector('.gallery-indicator');
        if (images.length > 1 && indicator) {
            container.addEventListener('scroll', () => {
                const index = Math.round(container.scrollLeft / container.clientWidth);
                indicator.textContent = `${index + 1} / ${images.length}`;
            });
        }
    });
});

// Lightbox Modal Functionality
let currentGalleryImages = [];
let currentGalleryIndex = 0;

window.openModal = function(imgElement) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const controls = document.getElementById('modal-controls');
    
    // Auto-detect other images in the gallery
    const parentNode = imgElement.parentNode;
    const siblingImages = Array.from(parentNode.querySelectorAll('img'));
    
    currentGalleryImages = siblingImages.map(img => img.src);
    currentGalleryIndex = siblingImages.indexOf(imgElement);

    // Hide controls if there's only 1 image
    if (currentGalleryImages.length <= 1) {
        controls.style.display = 'none';
    } else {
        controls.style.display = 'flex';
        updateModalImage(); // Sets the 1 / 3 indicator initially
    }
    
    modalImg.src = currentGalleryImages[currentGalleryIndex];
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modalImg.classList.remove('scale-95');
    modalImg.classList.add('scale-100');
};

window.closeModal = function(e) {
    // Only close if clicking outside the image/buttons
    if(e && e.target && (e.target.id === 'modal-img' || e.target.closest('#modal-controls'))) return;
    
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    modal.classList.add('pointer-events-none', 'opacity-0');
    modalImg.classList.remove('scale-100');
    modalImg.classList.add('scale-95');
};

window.changeModalImg = function(direction) {
    if (currentGalleryImages.length <= 1) return;
    currentGalleryIndex = (currentGalleryIndex + direction + currentGalleryImages.length) % currentGalleryImages.length;
    updateModalImage();
};

function updateModalImage() {
    const modalImg = document.getElementById('modal-img');
    const indicator = document.getElementById('modal-indicator');
    
    // Add a quick fade effect for transitions
    modalImg.style.opacity = 0.5;
    setTimeout(() => {
        modalImg.src = currentGalleryImages[currentGalleryIndex];
        modalImg.style.opacity = 1;
        if(indicator) indicator.textContent = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
    }, 150);
}

// Touch Swiping Logic
let touchStartX = 0;
document.addEventListener('touchstart', e => {
    if(!document.getElementById('image-modal').classList.contains('opacity-0')) {
        touchStartX = e.changedTouches[0].screenX;
    }
});

document.addEventListener('touchend', e => {
    if(document.getElementById('image-modal').classList.contains('opacity-0')) return;
    if(currentGalleryImages.length <= 1) return;
    
    let touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) {
        changeModalImg(1); // Swipe left = Next
    } else if (touchEndX > touchStartX + 50) {
        changeModalImg(-1); // Swipe right = Prev
    }
});

/* ============================================================
   TILE SYMBOL PARTICLE SYSTEM — optimised
   · Single shared RAF loop (not one per card)
   · Cards skip rendering when scrolled out of view
   · Whole system pauses when tab is hidden
   · 30fps cap via timestamp delta
   · mousemove throttled with dirty flag
   ============================================================ */
(function initTileParticles() {
    const FRAME_MS = 1000 / 30;
    let cardStates = [];
    let rafId = null;
    let paused = false;
    let lastTs = 0;

    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
        if (!paused && !rafId) rafId = requestAnimationFrame(tick);
    });

    function sampleGlyph(symbol, W, H) {
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        const oc = off.getContext('2d');
        const sz = Math.min(W, H) * 0.60;
        oc.font = `400 ${sz}px "Material Symbols Outlined"`;
        oc.fillStyle = '#fff';
        oc.textAlign = 'center';
        oc.textBaseline = 'middle';
        oc.fillText(symbol, W / 2, H / 2);
        const d = oc.getImageData(0, 0, W, H).data;
        const pts = [];
        const step = Math.max(4, Math.floor(Math.min(W, H) / 30));
        for (let y = 0; y < H; y += step)
            for (let x = 0; x < W; x += step)
                if (d[(y * W + x) * 4 + 3] > 110) pts.push({ x, y });
        return pts;
    }

    function buildCard(card) {
        if (getComputedStyle(card).position === 'static')
            card.style.position = 'relative';

        const [r, g, b] = (card.dataset.tileParticles || '129,236,255').split(',').map(Number);

        let symbol = card.dataset.tileSymbol || '';
        if (!symbol) {
            const el = card.querySelector('.material-symbols-outlined');
            symbol = el ? el.textContent.trim() : 'star';
        }

        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            position: 'absolute', top: '0', left: '0',
            width: '100%', height: '100%',
            zIndex: '0', pointerEvents: 'none',
            borderRadius: 'inherit',
            willChange: 'transform',
        });
        card.insertBefore(canvas, card.firstChild);

        const ctx = canvas.getContext('2d');
        const W = canvas.width  = card.offsetWidth  || 300;
        const H = canvas.height = card.offsetHeight || 250;

        const pts = sampleGlyph(symbol, W, H);
        const COUNT = Math.min(pts.length, 80);
        const selected = pts.sort(() => Math.random() - 0.5).slice(0, COUNT);

        const particles = selected.map(p => ({
            tx: p.x, ty: p.y,
            x: Math.random() * W, y: Math.random() * H,
            vx: 0, vy: 0,
            size: Math.random() * 1.3 + 0.6,
            baseOp: Math.random() * 0.16 + 0.05,
            phase: Math.random() * Math.PI * 2,
            wobR: Math.random() * 3.5 + 1,
            wobS: (Math.random() * 0.35 + 0.15) * 0.018,
        }));

        const s = {
            ctx, W, H, particles, r, g, b,
            hovered: false, visible: false,
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
        });
        card.addEventListener('mouseleave', () => {
            s.mx = -9999; s.my = -9999;
            s.hovered = false; s.mouseDirty = false;
        });

        new IntersectionObserver(entries => {
            s.visible = entries[0].isIntersecting;
        }, { threshold: 0.05 }).observe(card);

        return s;
    }

    function tick(ts) {
        rafId = requestAnimationFrame(tick);
        if (paused) return;
        if (ts - lastTs < FRAME_MS) return;
        lastTs = ts;

        cardStates.forEach(s => {
            if (!s.visible) return;
            s.mouseDirty = false;
            s.tick++;
            s.ctx.clearRect(0, 0, s.W, s.H);

            const spring = s.hovered ? 0.065 : 0.025;
            const damp   = 0.875;

            s.particles.forEach(p => {
                const w  = Math.sin(s.tick * p.wobS + p.phase) * p.wobR;
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

    const fontReady = document.fonts
        ? document.fonts.load('400 1px "Material Symbols Outlined"')
        : Promise.resolve();

    fontReady.then(() => {
        document.querySelectorAll('[data-tile-particles]').forEach(card => {
            cardStates.push(buildCard(card));
        });
        if (cardStates.length) rafId = requestAnimationFrame(tick);
    }).catch(() => {});
})();
