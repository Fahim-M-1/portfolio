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
});

// Fallback: Copy Email to Clipboard
window.copyEmail = function(e, btn) {
    const emailToCopy = "fahimsndrd@gmail.com";
    
    const showSuccess = () => {
        const originalText = "Hire Me";
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
