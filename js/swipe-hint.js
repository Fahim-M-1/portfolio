export function initSwipeHint() {
    const galleries = document.querySelectorAll('.gallery-container');

    galleries.forEach(gallery => {
        const hint = gallery.querySelector('.swipe-hint');
        if (!hint) return;

        // Function to hide the hint permanently for this session
        const hideHint = () => {
            hint.style.opacity = '0';
            setTimeout(() => {
                hint.style.display = 'none';
            }, 300); // Wait for transition to finish
            
            // Remove listeners once activated
            gallery.removeEventListener('scroll', hideHint);
            gallery.removeEventListener('touchstart', hideHint);
            gallery.removeEventListener('click', hideHint);
        };

        // Listen for scroll, touch, or click
        gallery.addEventListener('scroll', hideHint, { once: true });
        gallery.addEventListener('touchstart', hideHint, { once: true });
        gallery.addEventListener('click', hideHint, { once: true });
    });
}
