const { test, expect } = require('@playwright/test');

test.describe('Portfolio Functionality', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });
    
    await page.goto('/');
  });

  test('Page loads without console errors', async () => {
    expect(consoleErrors.length).toBe(0);
  });

  test('Hero section is visible', async ({ page }) => {
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
  });

  test('Gallery modal opens, cycles, and closes', async ({ page }) => {
    // Scroll directly to the first image's parent panel
    const firstImage = page.locator('img[data-action="open-modal"]').first();
    const panel = firstImage.locator('xpath=ancestor::div[contains(@class, "glass-panel")]').first();
    await panel.scrollIntoViewIfNeeded();

    // Wait for the reveal animation to remove opacity-0
    await expect(panel).not.toHaveClass(/opacity-0/);
    
    // We force click via evaluate because 3D transforms (perspective/rotate) and nested overflows can sometimes confuse Playwright's visibility engine
    await firstImage.evaluate(node => node.click());

    const modal = page.locator('#image-modal');
    await expect(modal).not.toHaveClass(/opacity-0/);

    const modalIndicator = page.locator('#modal-indicator');
    await expect(modalIndicator).toBeVisible();
    
    // Cycle next image
    const initialText = await modalIndicator.textContent();
    const nextBtn = page.locator('button[data-action="next-img"]');
    await nextBtn.click({ force: true });
    
    // Wait for the indicator to update
    await expect(modalIndicator).not.toHaveText(initialText);

    // Close modal by clicking the background
    const closeOverlay = page.locator('#image-modal');
    await closeOverlay.click({ force: true, position: { x: 10, y: 10 } });
    await expect(modal).toHaveClass(/opacity-0/);
  });

});
