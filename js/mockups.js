export function initMockups() {
    const mockups = document.querySelectorAll('.device-mockup-wrapper');

    mockups.forEach(wrapper => {
        const mockup = wrapper.querySelector('.device-mockup');
        if (!mockup) return;

        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation (max 10 degrees)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            mockup.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            mockup.style.transition = 'transform 0.1s ease-out';
        });

        wrapper.addEventListener('mouseleave', () => {
            // Reset position
            mockup.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            mockup.style.transition = 'transform 0.5s ease-out';
        });
    });
}
