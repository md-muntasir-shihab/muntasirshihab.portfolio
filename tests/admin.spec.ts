import { test, expect } from '@playwright/test';

const adminSlug = process.env.ADMIN_SLUG || 'xk9-admin-portal-2025';

test.describe('Admin Panel Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
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

    // Click on Profile link in sidebar
    await page.click('a:has-text("Profile"), a:has-text("প্রোফাইল")');
    await expect(page.locator('text=/Name \\(EN\\)|নাম \\(EN\\)/')).toBeVisible();

    // Click on CV Manager link in sidebar
    await page.click('a:has-text("CV Manager"), a:has-text("সিভি ম্যানেজার")');
    await expect(page.locator('text=/ATS CV|ATS সিভি/')).toBeVisible();

    // Click on Security link in sidebar
    await page.click('a:has-text("Security"), a:has-text("সিকিউরিটি")');
    await expect(page.locator('text=/Two-Factor Authentication/')).toBeVisible();
  });

  test('should toggle section visibility and reflect in public navbar', async ({ page }) => {
    // 1. Go to home page, verify Experience nav link is visible
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header nav a:has-text("Experience")')).toBeVisible();

    // 2. Go to Admin sections panel
    await page.goto(`/${adminSlug}/sections`);
    await page.waitForLoadState('networkidle');

    // 3. Locate Experience toggle and turn it off
    const experienceRow = page.locator('div:has(> span:has-text("experience"))');
    const toggleButton = experienceRow.locator('button');
    
    // Check initial state (should be active / green)
    await expect(toggleButton).toHaveClass(/bg-\[#5bd07a\]/);
    
    // Click toggle to disable it
    await toggleButton.click();
    
    // Verify it changed class to inactive
    await expect(toggleButton).toHaveClass(/bg-white/);

    // 4. Go back to home page, verify Experience nav link is hidden
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header nav a:has-text("Experience")')).not.toBeVisible();

    // 5. Turn it back on so that site state remains clean
    await page.goto(`/${adminSlug}/sections`);
    await page.waitForLoadState('networkidle');
    await page.locator('div:has(> span:has-text("experience")) button').click();
    await expect(page.locator('div:has(> span:has-text("experience")) button')).toHaveClass(/bg-\[#5bd07a\]/);
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
