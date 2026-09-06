// mobile-menu.js

export function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const panel = document.getElementById('mobile-drawer-panel');
    if (!btn || !drawer || !panel) return;

    let isOpen = false;

    function openMenu() {
        isOpen = true;
        drawer.classList.remove('pointer-events-none', 'opacity-0');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';
        btn.setAttribute('aria-label', 'Close navigation menu');
    }

    function closeMobileMenu() {
        isOpen = false;
        drawer.classList.add('opacity-0');
        panel.classList.remove('translate-x-0');
        panel.classList.add('translate-x-full');
        document.body.style.overflow = '';
        btn.setAttribute('aria-label', 'Open navigation menu');
        // Re-add pointer-events-none after transition
        setTimeout(() => drawer.classList.add('pointer-events-none'), 300);
    }

    btn.addEventListener('click', () => {
        if (isOpen) closeMobileMenu();
        else openMenu();
    });

    // Close drawer when a nav link is tapped
    panel.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Handle data-action="close-mobile-menu"
    document.querySelectorAll('[data-action="close-mobile-menu"]').forEach(el => {
        el.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isOpen) closeMobileMenu();
    });
}
