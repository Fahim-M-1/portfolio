// lightbox.js

export function initLightbox() {
    // Gallery Logic
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

    let currentGalleryImages = [];
    let currentGalleryIndex = 0;

    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const controls = document.getElementById('modal-controls');
    const indicator = document.getElementById('modal-indicator');

    if (!modal || !modalImg) return;

    function openModal(imgElement) {
        // Auto-detect other images in the gallery
        const parentNode = imgElement.parentNode;
        const siblingImages = Array.from(parentNode.querySelectorAll('img'));

        currentGalleryImages = siblingImages.map(img => img.src);
        currentGalleryIndex = siblingImages.indexOf(imgElement);

        // Hide controls if there's only 1 image
        if (controls) {
            if (currentGalleryImages.length <= 1) {
                controls.style.display = 'none';
            } else {
                controls.style.display = 'flex';
                updateModalImage(); // Sets the indicator initially
            }
        }

        modalImg.src = currentGalleryImages[currentGalleryIndex];
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modalImg.classList.remove('scale-95');
        modalImg.classList.add('scale-100');
    }

    function closeModal() {
        modal.classList.add('pointer-events-none', 'opacity-0');
        modalImg.classList.remove('scale-100');
        modalImg.classList.add('scale-95');
    }

    function changeModalImg(direction) {
        if (currentGalleryImages.length <= 1) return;
        currentGalleryIndex = (currentGalleryIndex + direction + currentGalleryImages.length) % currentGalleryImages.length;
        updateModalImage();
    }

    function updateModalImage() {
        // Add a quick fade effect for transitions
        modalImg.style.opacity = 0.5;
        setTimeout(() => {
            modalImg.src = currentGalleryImages[currentGalleryIndex];
            modalImg.style.opacity = 1;
            if (indicator) indicator.textContent = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
        }, 150);
    }

    // Bind data-action elements
    document.querySelectorAll('[data-action="open-modal"]').forEach(el => {
        el.addEventListener('click', function() {
            openModal(this);
        });
    });

    document.querySelectorAll('[data-action="close-modal"]').forEach(el => {
        el.addEventListener('click', function(e) {
            // If the element is the modal background itself, ensure we aren't clicking an image
            if (e.target.id === 'modal-img' || e.target.closest('#modal-controls')) return;
            closeModal();
        });
    });

    document.querySelectorAll('[data-action="prev-img"]').forEach(el => {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            changeModalImg(-1);
        });
    });

    document.querySelectorAll('[data-action="next-img"]').forEach(el => {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            changeModalImg(1);
        });
    });

    // Touch Swiping Logic
    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        if (!modal.classList.contains('opacity-0')) {
            touchStartX = e.changedTouches[0].screenX;
        }
    });

    document.addEventListener('touchend', e => {
        if (modal.classList.contains('opacity-0')) return;
        if (currentGalleryImages.length <= 1) return;

        let touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) {
            changeModalImg(1); // Swipe left = Next
        } else if (touchEndX > touchStartX + 50) {
            changeModalImg(-1); // Swipe right = Prev
        }
    });
}
