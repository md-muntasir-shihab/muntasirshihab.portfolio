import { test, expect, Page } from '@playwright/test';

// All public routes to smoke-test
const PUBLIC_ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/experience', name: 'Experience' },
  { path: '/skills', name: 'Skills' },
  { path: '/projects', name: 'Projects' },
  { path: '/blog', name: 'Blog' },
  { path: '/testimonials', name: 'Testimonials' },
  { path: '/recommendations', name: 'Recommendations' },
  { path: '/contact', name: 'Contact' },
  { path: '/cv', name: 'CV' },
];

test.describe('Public Frontend — Page Load & Stability', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} page (${route.path}) should load without console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // Page should have content visible (not blank)
      await expect(page.locator('body')).not.toBeEmpty();

      // Check no critical JS errors (filter out known benign ones like Upstash URL warnings)
      const criticalErrors = consoleErrors.filter(
        e => !e.includes('Upstash Redis') && !e.includes('favicon') && !e.includes('net::ERR')
      );
      expect(criticalErrors).toEqual([]);
    });
  }
});

test.describe('Public Frontend — Theme Switching', () => {
  test('should switch between dark and light theme on toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Default should be dark (from localStorage default)
    const htmlClasses = await page.locator('html').getAttribute('class');
    // It should have either 'dark' or 'light'
    expect(htmlClasses).toContain('dark');

    // Find and click the theme toggle button (sun/moon icon)
    const themeToggle = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
    await themeToggle.click();
    await page.waitForTimeout(400); // Wait for theme transition

    // Now should be light
    const newClasses = await page.locator('html').getAttribute('class');
    expect(newClasses).toContain('light');

    // Body bg should have changed
    const bodyBg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    // Light theme uses #f5f3ee = rgb(245, 243, 238)
    expect(bodyBg).not.toBe('rgb(7, 7, 11)'); // Should no longer be dark bg

    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(400);
    const revertedClasses = await page.locator('html').getAttribute('class');
    expect(revertedClasses).toContain('dark');
  });

  test('theme preference should persist across page navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to light theme
    const themeToggle = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
    await themeToggle.click();
    await page.waitForTimeout(400);
    await expect(page.locator('html')).toHaveClass(/light/);

    // Navigate to another page
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Theme should still be light
    await expect(page.locator('html')).toHaveClass(/light/);

    // Reset to dark for other tests
    await page.evaluate(() => localStorage.setItem('rm_theme', 'dark'));
  });
});

test.describe('Public Frontend — Language Persistence', () => {
  test('language selection should persist across page navigation', async ({ page }) => {
    // Ensure English default
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('rm_lang', 'en'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify English content is visible in navbar
    await expect(page.locator('header nav a:has-text("Home"), header nav a:has-text("হোম")')).toBeVisible();

    // Find and click language toggle to switch to Bengali
    const langToggle = page.locator('button:has-text("BN")').first();
    await langToggle.click();
    await page.waitForTimeout(300);

    // Navigate to another page
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Language should still be Bengali (localStorage persists)
    const storedLang = await page.evaluate(() => localStorage.getItem('rm_lang'));
    expect(storedLang).toBe('bn');

    // Reset to English
    await page.evaluate(() => localStorage.setItem('rm_lang', 'en'));
  });
});

test.describe('Public Frontend — 404 Page', () => {
  test('non-existent route should render 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz');
    await page.waitForLoadState('networkidle');

    // Should show 404 content
    await expect(page.locator('text=/404/')).toBeVisible();
  });
});

test.describe('Public Frontend — Contact Form Validation', () => {
  test('contact form should validate required fields', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Find the send/submit button
    const submitBtn = page.locator('button:has-text("Send"), button:has-text("পাঠাও")').first();

    // Try clicking without filling — HTML5 validation should block
    await submitBtn.click();

    // Page should still be on contact (form didn't submit)
    expect(page.url()).toContain('/contact');
  });
});
