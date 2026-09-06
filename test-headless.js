const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    page.on('pageerror', error => {
        errors.push(error.message);
    });

    try {
        await page.goto('http://localhost:9000');
        await page.waitForTimeout(2000); // wait for initial scripts and observers
        
        if (errors.length > 0) {
            console.log('ERRORS FOUND:');
            console.log(errors.join('\n'));
        } else {
            console.log('NO CONSOLE ERRORS.');
        }
    } catch (e) {
        console.error('Failed to load page:', e);
    } finally {
        await browser.close();
    }
})();
