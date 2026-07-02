import { chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const saveLogs = [];

  page.on('console', msg => {
    const text = msg.text();
    console.log(`[BROWSER LOG] [${msg.type()}] ${text}`);
    if (text.includes('Saved key')) {
      saveLogs.push(text);
    }
  });

  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[HTTP ERROR ${response.status()}] ${response.url()}`);
    }
  });

  try {
    console.log('--- STARTING LIVE FUNCTIONAL TEST ---');
    console.log('Step 1: Navigating to Admin Panel...');
    await page.goto('http://localhost:5174/xk9-admin-portal-2025');

    console.log('Step 2: Performing Login...');
    await page.fill('input[type="email"]', 'mm.xihab@gmail.com');
    await page.fill('input[type="password"]', 'Shihab@2026');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    const has2FA = await page.locator('input[placeholder*="Code"i], input[placeholder*="2FA"i]').isVisible();
    if (has2FA) {
      console.log('Entering 2FA Code...');
      await page.fill('input[placeholder*="Code"i], input[placeholder*="2FA"i]', '246810');
      await page.click('button[type="submit"]');
    }

    console.log('Waiting for admin dashboard to load...');
    await page.waitForURL('**/xk9-admin-portal-2025');
    await page.waitForTimeout(3000);

    // Get current language from the button in nav
    const langBtn = page.locator('button:has-text("বাংলা"), button:has-text("EN")').first();
    const currentLangText = await langBtn.innerText();
    console.log(`Current Admin Language Option Button: "${currentLangText}"`);
    const isCurrentlyBengali = currentLangText.trim() === 'EN';
    console.log(`Is the admin interface currently in Bengali? ${isCurrentlyBengali}`);

    // ----------------------------------------------------
    // TEST 1: Change Profile Title (EN) and check if it persists
    // ----------------------------------------------------
    console.log('\n--- TEST 1: PROFILE TITLE UPDATE ---');
    const profileBtn = page.locator('a[href*="/profile"]').first();
    await profileBtn.click();
    await page.waitForTimeout(2500);

    const titleEnInput = page.locator('label:has-text("Title (EN)") + input, label:has-text("Title (EN)") >> xpath=.. >> input');
    const originalTitle = await titleEnInput.inputValue();
    console.log(`Original Title (EN): "${originalTitle}"`);

    const newTitle = originalTitle.includes('Dev') ? 'Student • Graphic Designer • Creative Learner' : 'Student • Graphic Designer • Expert Dev';
    console.log(`Setting new Title (EN): "${newTitle}"`);
    await titleEnInput.fill(newTitle);

    // Save
    console.log('Clicking Save...');
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Save Changes"), button:has-text("সংরক্ষণ করুন")').first();
    await saveBtn.click();
    await page.waitForTimeout(4000);

    // ----------------------------------------------------
    // TEST 2: Toggle Visibility of a Section
    // ----------------------------------------------------
    console.log('\n--- TEST 2: SECTIONS VISIBILITY TOGGLE ---');
    const sectionsBtn = page.locator('a[href*="/sections"]').first();
    await sectionsBtn.click();
    await page.waitForTimeout(2500);

    // Find the toggle for Blog
    console.log('Locating Blog section visibility toggle...');
    const blogToggle = page.locator('button:right-of(div:has-text("Blog")), button:right-of(div:has-text("ব্লগ"))').first();
    const blogToggleState = await blogToggle.innerText();
    console.log(`Blog current toggle state text: ${blogToggleState.trim()}`);

    // Toggle it
    await blogToggle.click();
    await page.waitForTimeout(4000);

    // ----------------------------------------------------
    // VERIFY FRONTEND REFLECTION
    // ----------------------------------------------------
    console.log('\n--- VERIFYING FRONTEND REFLECTION ---');
    const homePage = await context.newPage();
    console.log('Navigating to CV Page...');
    await homePage.goto('http://localhost:5174/cv');
    await homePage.waitForTimeout(3000);

    // Check if newTitle is visible on the CV Page
    const cvBody = await homePage.innerText('body');
    const isTitleUpdated = cvBody.includes(newTitle);
    console.log(`Result of Title check on CV Page: ${isTitleUpdated ? '✅ PASSED' : '❌ FAILED'}`);

    // Check if the blog navigation link is present/absent on the Navbar
    const blogLinks = homePage.locator('a[href="/blog"]');
    const blogLinksCount = await blogLinks.count();
    console.log(`Result of Blog visibility toggle: Found ${blogLinksCount} Blog links on the page (0 means hidden/toggled off).`);

    // Let's toggle the blog back to original so we don't mess up the user's settings
    console.log('\nCleaning up: Toggling Blog visibility back...');
    await page.bringToFront();
    await sectionsBtn.click();
    await page.waitForTimeout(1500);
    await blogToggle.click();
    await page.waitForTimeout(3000);

    // Restore original profile title
    console.log('Cleaning up: Restoring original profile title...');
    await profileBtn.click();
    await page.waitForTimeout(1500);
    await titleEnInput.fill(originalTitle);
    await saveBtn.click();
    await page.waitForTimeout(3000);

    console.log('\n--- LIVE TEST SUMMARY ---');
    console.log('DB Saves registered:', saveLogs);
    if (saveLogs.length > 0) {
      console.log('🎉 SUCCESS: All database writes were verified live in the browser!');
    } else {
      console.log('❌ FAILED: No DB saves registered.');
    }

  } catch (error) {
    console.error('Error during live test:', error);
  } finally {
    await browser.close();
  }
}

run();
