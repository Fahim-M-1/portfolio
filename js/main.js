// main.js
import { initMeshShader } from './mesh-shader.js?v=2';
import { initNav } from './nav.js?v=6';
import { initScrollReveal } from './scroll-reveal.js?v=5';
import { initLightbox } from './lightbox.js?v=5';
import { initTileParticles } from './tile-particles.js?v=6';
import { initMobileMenu } from './mobile-menu.js?v=5';
import { initCopyEmail } from './copy-email.js?v=5';
import { initMockups } from './mockups.js?v=7';
import { initSwipeHint } from './swipe-hint.js?v=1';

document.addEventListener("DOMContentLoaded", () => {
    // Critical Above-the-fold initializations
    initMeshShader('mesh-canvas');
    initNav('.nav-item');
    initScrollReveal();
    initMobileMenu();

    // Defer below-the-fold and interaction-dependent modules to idle time
    const deferTask = window.requestIdleCallback || ((cb) => setTimeout(cb, 16));

    deferTask(() => {
        initLightbox();
        initTileParticles('[data-tile-particles]');
        initCopyEmail();
        initMockups();
        initSwipeHint();
    });
});
