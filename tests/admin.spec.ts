import { test, expect } from '@playwright/test';

const adminSlug = process.env.ADMIN_SLUG || 'xk9-admin-portal-2025';

test.describe('Admin Panel Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    // Navigate to the site to establish origin, then set sessionStorage
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('rm_admin_authed', '1');
      sessionStorage.setItem('rm_admin_2fa', '1');
    });
  });

  test('should navigate between different admin sections', async ({ page }) => {
    // Navigate to admin main portal
    await page.goto(`/${adminSlug}`);
    await page.waitForLoadState('networkidle');

    // Default panel should be Dashboard
    await expect(page.locator('text=/Portfolio Admin|পোর্টফোলিও অ্যাডমিন/')).toBeVisible();
    await expect(page.locator('text=/Dashboard|ড্যাশবোর্ড/').first()).toBeVisible();

    // Expand Profile menu group
    await page.click('button:has-text("Profile"), button:has-text("প্রোফাইল")');
    // Click on Profile Editor link in expanded submenu
    await page.click('a:has-text("Profile Editor"), a:has-text("প্রোফাইল এডিটর")');
    await expect(page.locator('text=/Name \\(EN\\)|নাম \\(EN\\)/')).toBeVisible();

    // Click on CV Manager link in sidebar
    await page.click('a:has-text("CV Manager"), a:has-text("সিভি ম্যানেজার")');
    await expect(page.locator('text=/ATS CV|ATS সিভি/')).toBeVisible();

    // Click on Security link in sidebar
    await page.click('a:has-text("Security"), a:has-text("সিকিউরিটি")');
    await expect(page.locator('text=/Two-Factor Authentication/').first()).toBeVisible();
  });

  test('should toggle section visibility and reflect in public navbar', async ({ page }) => {
    // 1. Go to Admin sections panel first to read/set initial state
    await page.goto(`/${adminSlug}/sections`);
    await page.waitForLoadState('networkidle');

    const experienceRow = page.locator('div:has(> span:has-text("experience"))');
    const toggleButton = experienceRow.locator('button');
    
    // Read current state
    const btnClass = await toggleButton.getAttribute('class') || '';
    const isInitiallyEnabled = btnClass.includes('bg-[#5bd07a]');

    if (!isInitiallyEnabled) {
      // Enable it first
      await toggleButton.click();
      await page.waitForTimeout(2000);
    }

    // 2. Go to home page, verify Experience nav link is visible
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header nav a[href="/experience"]')).toBeVisible();

    // 3. Go back to Admin sections panel and disable it
    await page.goto(`/${adminSlug}/sections`);
    await page.waitForLoadState('networkidle');
    await page.locator('div:has(> span:has-text("experience")) button').click();
    await page.waitForTimeout(2000);

    // 4. Go back to home page, verify Experience nav link is hidden
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header nav a[href="/experience"]')).not.toBeVisible();

    // 5. Restore original state or leave it enabled for normal portfolio display
    await page.goto(`/${adminSlug}/sections`);
    await page.waitForLoadState('networkidle');
    const finalToggle = page.locator('div:has(> span:has-text("experience")) button');
    const finalClass = await finalToggle.getAttribute('class') || '';
    const isCurrentlyEnabled = finalClass.includes('bg-[#5bd07a]');
    
    if (isInitiallyEnabled !== isCurrentlyEnabled) {
      await finalToggle.click();
      await page.waitForTimeout(1500);
    }
  });

  test('should switch language dynamically inside admin panel', async ({ page }) => {
    await page.goto(`/${adminSlug}`);
    await page.waitForLoadState('networkidle');

    // Check default header label
    await expect(page.locator('text=Portfolio Admin')).toBeVisible();

    // Click the language toggle button in the sidebar (should be 'বাংলা' if current lang is EN)
    await page.click('button:has-text("বাংলা")');

    // Header label should now be in Bengali
    await expect(page.locator('text=পোর্টফোলিও অ্যাডমিন')).toBeVisible();

    // Switch back to English
    await page.click('button:has-text("EN")');
    await expect(page.locator('text=Portfolio Admin')).toBeVisible();
  });
});
