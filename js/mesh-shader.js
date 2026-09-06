// mesh-shader.js
export function initMeshShader(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let isVisible = true;
    let rafId = null;
    let lastFrameTime = 0;
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    
    // Cached gradients
    let vGradient = null;
    let topGrad = null;
    let horizonY = 0;

    const updateDimensions = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);

        horizonY = height * 0.3;
        
        vGradient = ctx.createLinearGradient(0, horizonY, 0, height);
        vGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.08)');
        vGradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        topGrad = ctx.createLinearGradient(0, 0, 0, horizonY * 1.5);
        topGrad.addColorStop(0, '#0a0a0a');
        topGrad.addColorStop(1, 'rgba(10, 10, 10, 0)');
    };
    
    window.addEventListener('resize', updateDimensions, { passive: true });
    updateDimensions();

    // Pause when tab is inactive
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isVisible = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        } else {
            isVisible = true;
            lastFrameTime = performance.now();
            if (!rafId) rafId = requestAnimationFrame(loop);
        }
    });

    // Pause when hero section is out of view
    const homeSection = document.getElementById('home');
    if (homeSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isVisible = entry.isIntersecting;
            if (isVisible && !rafId) {
                lastFrameTime = performance.now();
                rafId = requestAnimationFrame(loop);
            }
        }, { threshold: 0 });
        observer.observe(homeSection);
    }
    
    let time = 0;
    const pointSpacing = 75;
    
    function draw() {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const cols = Math.ceil(width / pointSpacing) + 8;
        const rows = Math.ceil(height / pointSpacing) + 8;
        
        ctx.lineWidth = 1;
        
        // Batched Vertical lines
        ctx.beginPath();
        for (let i = -4; i < cols; i++) {
            const xBase = (i - cols / 2) * pointSpacing;
            for (let j = 0; j < rows; j++) {
                const y = j * pointSpacing;
                const wave = Math.sin(xBase * 0.01 + y * 0.01 + time) * 28 + Math.cos(xBase * 0.02 - time * 0.8) * 18;
                const z = y + 100;
                const scale = 800 / z;
                
                const projectedX = width / 2 + xBase * scale;
                const projectedY = horizonY + (y + wave) * scale * 0.5;
                
                if (j === 0) ctx.moveTo(projectedX, projectedY);
                else ctx.lineTo(projectedX, projectedY);
            }
        }
        ctx.strokeStyle = vGradient;
        ctx.stroke();
        
        // Batched Horizontal lines
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
            const y = j * pointSpacing;
            for (let i = -4; i < cols; i++) {
                const xBase = (i - cols / 2) * pointSpacing;
                const wave = Math.sin(xBase * 0.01 + y * 0.01 + time) * 28 + Math.cos(xBase * 0.02 - time * 0.8) * 18;
                const z = y + 100;
                const scale = 800 / z;
                
                const projectedX = width / 2 + xBase * scale;
                const projectedY = horizonY + (y + wave) * scale * 0.5;
                
                if (i === -4) ctx.moveTo(projectedX, projectedY);
                else ctx.lineTo(projectedX, projectedY);
            }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.stroke();
        
        // Smooth horizon fade
        if (topGrad) {
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, width, horizonY * 1.5);
        }
    }

    function loop(now) {
        if (!isVisible) {
            rafId = null;
            return;
        }

        rafId = requestAnimationFrame(loop);

        const delta = now - lastFrameTime;
        if (delta >= FRAME_INTERVAL) {
            lastFrameTime = now - (delta % FRAME_INTERVAL);
            time += 0.02;
            draw();
        }
    }

    rafId = requestAnimationFrame(loop);
}
