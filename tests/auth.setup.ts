import { test as setup, expect } from '@playwright/test';

setup('authenticate admin', async ({ page }) => {
  const adminSlug = process.env.ADMIN_SLUG || 'xk9-admin-portal-2025';
  const email = process.env.ADMIN_EMAIL || 'mm.xihab@gmail.com';
  const pass = process.env.ADMIN_PASS || 'Shihab@2026';
  const totp = process.env.TOTP_SECRET || '246810';

  console.log(`Navigating to Admin Portal login at /${adminSlug}`);
  await page.goto(`/${adminSlug}`);

  // Fill credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', pass);

  // Click submit
  await page.click('button[type="submit"]');

  // Wait for either the 2FA screen or the Dashboard to appear
  console.log('Waiting for next screen...');
  await Promise.race([
    page.waitForSelector('text=Two-Factor Authentication').then(() => '2fa'),
    page.waitForSelector('text=Dashboard').then(() => 'dashboard')
  ]).then(async (screen) => {
    if (screen === '2fa') {
      console.log('2FA screen detected. Filling in 2FA code...');
      await page.fill('input[placeholder="000000"]', totp);
      await page.click('button:has-text("Verify & Enter")');
      await page.waitForSelector('text=Dashboard');
    } else {
      console.log('2FA is disabled. Logged directly into Dashboard.');
    }
  });

  // Save authentication state
  await page.context().storageState({ path: 'browser-data/auth.json' });
  console.log('Auth state saved successfully to browser-data/auth.json');
});
