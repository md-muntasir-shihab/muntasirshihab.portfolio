import { test, expect } from '@playwright/test';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client for verification
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

test.describe('Database & Upstash Caching Logic', () => {
  test('should track visitors and increment count on home page load', async ({ page }) => {
    // Skip if Upstash credentials are not set
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      console.log('Skipping visitor count test: Upstash Redis not configured.');
      return;
    }

    console.log('Querying current visitor count from Upstash Redis...');
    const initialCount = parseInt((await redis.get('visitors:total')) as string || '0', 10);
    console.log(`Initial total visitors: ${initialCount}`);

    // Load home page which triggers visitor increment
    await page.goto('/');
    // Give some time for the fetch to resolve
    await page.waitForTimeout(2000);

    const newCount = parseInt((await redis.get('visitors:total')) as string || '0', 10);
    console.log(`New total visitors after page load: ${newCount}`);
    
    // It should have incremented by 1 (or more if multiple requests occurred)
    expect(newCount).toBeGreaterThanOrEqual(initialCount + 1);
  });

  test('should increment CV download count on download click', async ({ page }) => {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      console.log('Skipping CV download count test: Upstash Redis not configured.');
      return;
    }

    // Go to CV page
    console.log('Navigating to CV page...');
    await page.goto('/cv');
    await page.waitForLoadState('networkidle');

    // Fetch initial count from Redis
    const initialDownloads = parseInt((await redis.get('cv:downloads')) as string || '0', 10);
    console.log(`Initial CV downloads in Redis: ${initialDownloads}`);

    // Wait for the UI to display the count
    const cvCountLocator = page.locator('text=/\\d+ downloads|\\d+ ডাউনলোড/');
    await cvCountLocator.first().waitFor({ timeout: 5000 }).catch(() => {});
    
    // Click CV download button
    console.log('Clicking download button...');
    
    // Handle download event so the browser doesn't block
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download CV"), button:has-text("সিভি ডাউনলোড")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('CV');

    // Wait for the live counter to update or check Redis
    await page.waitForTimeout(2000);
    const newDownloads = parseInt((await redis.get('cv:downloads')) as string || '0', 10);
    console.log(`New CV downloads in Redis: ${newDownloads}`);

    expect(newDownloads).toBeGreaterThanOrEqual(initialDownloads + 1);
  });
});
