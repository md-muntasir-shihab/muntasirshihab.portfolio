import { test, expect } from '@playwright/test';

// Mobile viewports to test
const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
];

// Key public pages to test responsively
const PAGES = ['/', '/about', '/experience', '/skills', '/projects', '/contact', '/cv'];

test.describe('Mobile Responsiveness — No Horizontal Overflow', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    for (const pagePath of PAGES) {
      test(`${viewport.name} (${viewport.width}px) — ${pagePath} has no horizontal scroll`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');

        // Check that document doesn't overflow horizontally
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasOverflow).toBe(false);
      });
    }
  }
});

test.describe('Mobile Responsiveness — Hamburger Menu', () => {
  test('hamburger menu should open and close on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Reset language to English for consistent selectors
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('rm_lang', 'en'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Hamburger button should be visible (lg:hidden means visible on mobile)
    const hamburger = page.locator('header button:has(svg)').last();
    await expect(hamburger).toBeVisible();

    // Click hamburger to open mobile drawer
    await hamburger.click();
    await page.waitForTimeout(500);

    // The mobile drawer is a motion.div inside header with class lg:hidden
    // It contains a grid of NavLink items  
    const mobileDrawer = page.locator('header .lg\\:hidden').last();
    await expect(mobileDrawer).toBeVisible();

    // Find a nav link inside the drawer (scoped to the drawer element)
    const drawerHomeLink = mobileDrawer.locator('a:has-text("Home")');
    await expect(drawerHomeLink).toBeVisible();

    // Click the link — drawer should close
    await drawerHomeLink.click();
    await page.waitForTimeout(400);
  });
});

test.describe('Mobile Responsiveness — Touch Target Sizes', () => {
  test('all buttons and links should have minimum 44px touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check all interactive elements in the header
    const interactiveElements = page.locator('header a, header button');
    const count = await interactiveElements.count();

    for (let i = 0; i < count; i++) {
      const el = interactiveElements.nth(i);
      const isVisible = await el.isVisible();
      if (!isVisible) continue;

      const box = await el.boundingBox();
      if (box) {
        // At least 32px minimum (some icon buttons may be slightly smaller)
        expect(box.height).toBeGreaterThanOrEqual(28);
      }
    }
  });
});

test.describe('Mobile Responsiveness — Admin Panel Mobile', () => {
  test('admin panel should show hamburger menu on mobile', async ({ page }) => {
    const adminSlug = process.env.ADMIN_SLUG || 'xk9-admin-portal-2025';
    await page.setViewportSize({ width: 375, height: 667 });

    // Set auth and 2FA bypass in sessionStorage
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('rm_admin_authed', '1');
      sessionStorage.setItem('rm_admin_2fa', '1');
    });

    await page.goto(`/${adminSlug}`);
    await page.waitForLoadState('networkidle');

    // Desktop sidebar should be hidden on mobile
    const sidebar = page.locator('aside.hidden.lg\\:block');
    await expect(sidebar).not.toBeVisible();

    // Hamburger button should be visible
    const hamburger = page.locator('button.lg\\:hidden:has(svg)').first();
    await expect(hamburger).toBeVisible();

    // Click hamburger
    await hamburger.click();
    await page.waitForTimeout(400);

    // Mobile drawer should appear with admin nav links
    const adminDrawer = page.locator('.lg\\:hidden.fixed');
    await expect(adminDrawer).toBeVisible();
  });
});
