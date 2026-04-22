# Md. Fahim Mahmud - Professional Portfolio

Welcome to the source code for my professional portfolio website!!
## 🚀 Overview

This is a highly optimized, responsive static web application built with performance and accessibility at its core. It achieves near-perfect PageSpeed Insights scores across Desktop and Mobile.

### Tech Stack & Features
- **HTML5 & Vanilla JavaScript**: A lightweight, dependency-free core.
- **Custom Particle Engine**: A bespoke, mathematically-driven canvas particle system (Twinkling Starlight) running entirely on vanilla JS.
- **Tailwind CSS (Static Build)**: Utility-first styling compiled into a minimal, static stylesheet.
- **Performance Optimized**: 
  - Zero render-blocking scripts.
  - Next-gen **WebP** image compression.
  - LCP prioritization (`fetchpriority="high"`), lazy-loaded gallery images, and preconnected Google Fonts.
- **Accessibility (a11y)**: Passes strict WCAG contrast ratio requirements and utilizes proper ARIA labels.

## 🛠 Local Development

While the site runs statically, the CSS is compiled using Tailwind. If you wish to run the project locally or modify the styling, follow these steps:

1. **Install Dependencies** (Requires Node.js/npm)
   ```bash
   npm install
   ```

2. **Run the CSS Compiler (Development Mode)**
   This will watch for changes in `index.html` and automatically update the CSS.
   ```bash
   npx tailwindcss -i ./input.css -o ./output.css --watch
   ```

3. **Serve the HTML**
   Open `index.html` in your browser, or use a local server like Python's `http.server` or VS Code's Live Server extension.

## 📦 Building for Production

Before deploying to production, run the minify command to squeeze the CSS file size down:
```bash
npx tailwindcss -i ./input.css -o ./output.css --minify
```

## 🌍 Deployment

This project is built to be hosted directly on **GitHub Pages**. Simply upload the repository (ensuring you include the compiled `output.css` and optimized `.webp` assets) and GitHub Pages will serve it seamlessly.

---
*© 2026 Md. Fahim Mahmud*
