import { test, expect } from '@playwright/test';

const adminSlug = process.env.ADMIN_SLUG || 'xk9-admin-portal-2025';

test.describe('Security & Routing Tests', () => {
  // Use a clean browser context for these tests (no authenticated state from setup)
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should show 404 page for common admin fallback routes', async ({ page }) => {
    // These paths should not exist on public or admin routes
    const forbiddenPaths = ['/admin', '/dashboard', '/cms', '/non-existent-random-route'];
    
    for (const path of forbiddenPaths) {
      console.log(`Testing 404 fallback for path: ${path}`);
      await page.goto(path);
      await expect(page.locator('text=/Page Not Found|পেজ পাওয়া যায়নি/')).toBeVisible();
      await expect(page.locator('text=/does not exist|বিদ্যমান নেই/')).toBeVisible();
    }
  });

  test('should reject incorrect login credentials & rate limit / secure inputs', async ({ page }) => {
    await page.goto(`/${adminSlug}`);

    // Test SQL Injection / XSS rejection
    console.log('Testing SQL Injection input validation');
    await page.fill('input[name="admin_username"]', "admin'quote@gmail.com");
    await page.fill('input[type="password"]', "wrongpass");
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid characters detected.')).toBeVisible();

    // Test invalid credentials and remaining attempts count decrementing
    console.log('Testing invalid credentials lockout mechanism');
    await page.fill('input[name="admin_username"]', "mm.xihab@gmail.com");
    await page.fill('input[type="password"]', "wrongpassword123");
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page.locator('text=4 attempt(s) left')).toBeVisible();
  });

  test('should protect admin dashboard page from unauthenticated users', async ({ page }) => {
    // Attempt direct access to admin panel routes without logging in
    console.log('Testing direct unauthenticated access protection');
    await page.goto(`/${adminSlug}/dashboard`);
    
    // It should render the login portal layout, not the dashboard
    await expect(page.locator('text=Admin Portal Login')).toBeVisible();
    await expect(page.locator('text=Dashboard')).not.toBeVisible();
  });
});
