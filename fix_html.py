import re

with open('index.html', 'r') as f:
    content = f.read()

# 1. canvas
content = content.replace(
    '<canvas id="particle-canvas"\n        style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>',
    '<canvas id="particle-canvas" class="particle-canvas"></canvas>'
)

# 2. copy email
content = content.replace('onclick="copyEmail(event, this)"', 'data-action="copy-email"')

# 3. mobile menu close
content = content.replace('onclick="closeMobileMenu()"', 'data-action="close-mobile-menu"')
content = content.replace('onclick="closeMobileMenu(); document.querySelector(\'a.nav-item[href=\\"#contact\\"]\').click();"', 'data-action="close-mobile-menu"')

# 4. fade-bottom-mask
content = content.replace(
    'class="rounded-3xl overflow-hidden aspect-[4/5] w-[260px] md:w-[400px] relative z-10 cursor-pointer transition-all duration-700 hover:scale-[1.02]"\n                            style="-webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); mask-image: linear-gradient(to bottom, black 60%, transparent 100%);"',
    'class="rounded-3xl overflow-hidden aspect-[4/5] w-[260px] md:w-[400px] relative z-10 cursor-pointer transition-all duration-700 hover:scale-[1.02] fade-bottom-mask"'
)

# 5. no-drag
content = content.replace(
    'class="w-full h-full object-cover transition-all duration-700 pointer-events-none select-none"\n                                draggable="false" style="-webkit-user-drag: none; -webkit-touch-callout: none;"',
    'class="w-full h-full object-cover transition-all duration-700 pointer-events-none select-none no-drag"\n                                draggable="false"'
)

# 6. Modal open/close/nav
content = content.replace('onclick="openModal(this)"', 'data-action="open-modal"')
content = content.replace('onclick="closeModal(event)"', 'data-action="close-modal"')
content = content.replace('onclick="changeModalImg(-1)"', 'data-action="prev-img"')
content = content.replace('onclick="changeModalImg(1)"', 'data-action="next-img"')

# 7. script tag
content = content.replace('<script src="./script.js?v=2"></script>', '<script type="module" src="./js/main.js"></script>')

# 8. animate-on-scroll -> data-reveal="fade"
def repl_animate(m):
    return 'data-reveal="fade" ' + m.group(0).replace('animate-on-scroll ', '')
content = re.sub(r'class="[^"]*animate-on-scroll[^"]*"', repl_animate, content)

# 9. gallery-container scrollbar style
def repl_gallery(m):
    c = m.group(1)
    return f'class="{c} no-scrollbar scroll-smooth"'
content = re.sub(r'class="([^"]*gallery-container[^"]*)"\n\s*style="scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth;"', repl_gallery, content)

with open('index.html', 'w') as f:
    f.write(content)
