// capabilities.js
// Centralized capability detection for the application

export const capabilities = Object.freeze({
    get isLowEnd() {
        // Disabled for testing/localhost to force full performance visuals
        return false;
    },
    get prefersReducedMotion() {
        // Disabled for testing to ensure animations are always visible
        return false;
    }
});
