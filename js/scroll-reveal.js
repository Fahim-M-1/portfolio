// scroll-reveal.js

export function initScrollReveal() {
    // 3 & 4. Consolidated Scroll Reveal Animations
    // Handled via data-reveal attributes: fade, slide, scale, progress
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const revealType = el.getAttribute('data-reveal');

                if (revealType === 'progress') {
                    const targetWidth = el.getAttribute('data-width') || '0%';
                    el.style.width = targetWidth;
                } else {
                    // General animations (fade, slide, etc.)
                    const delay = el.getAttribute('data-delay') || '0';
                    el.style.transitionDelay = `${delay}s`;

                    // Remove starting transforms, opacity will be handled by utility classes
                    el.classList.remove('opacity-0', 'translate-y-8', 'translate-x-[50px]', '-translate-x-[50px]', 'translate-x-8', '-translate-x-8', 'scale-90');
                    el.classList.add('opacity-100', 'translate-y-0', 'translate-x-0', 'scale-100');
                }

                // Unobserve after animating once
                obs.unobserve(el);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0 });

    revealElements.forEach(el => {
        const revealType = el.getAttribute('data-reveal');
        if (revealType === 'progress') {
            el.style.width = '0%';
            el.style.transition = 'width 1.5s ease-out';
        } else {
            // Enforce transition-all on elements so they animate smoothly
            el.classList.add('transition-all', 'duration-700', 'ease-out');
        }
        observer.observe(el);
    });
}
