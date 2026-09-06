// nav.js

export function initNav(navSelector) {
    const navItems = document.querySelectorAll(navSelector);
    if (!navItems.length) return;
    const sections = Array.from(navItems).map(item => item.getAttribute('href').substring(1));

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navItems.forEach(item => {
                    const isMatch = item.getAttribute('href').substring(1) === targetId;
                    if (isMatch) {
                        item.classList.add('text-[#00E5FF]', 'border-[#00E5FF]');
                        item.classList.remove('text-white/70', 'border-transparent');
                    } else {
                        item.classList.remove('text-[#00E5FF]', 'border-[#00E5FF]');
                        item.classList.add('text-white/70', 'border-transparent');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) observer.observe(section);
    });

    // Special case for 'Contact' clicking (Desktop and Mobile)
    document.querySelectorAll(`a[href="#contact"]`).forEach(contactLink => {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            const contactTile = document.getElementById('contact-tile');
            if (!contactTile) return;
            
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
    });
}
