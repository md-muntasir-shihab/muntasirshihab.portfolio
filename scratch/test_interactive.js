import { test, chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console logs
  page.on('console', msg => {
    console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`);
  });

  // Listen to failed requests
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Listen to response errors or 4xx/5xx responses
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[HTTP ERROR ${response.status()}] ${response.url()}`);
    }
  });

  try {
    console.log('Navigating to Admin Portal...');
    await page.goto('http://localhost:5174/xk9-admin-portal-2025');

    console.log('Logging in...');
    await page.fill('input[type="email"], input[placeholder*="email"i]', 'mm.xihab@gmail.com');
    await page.fill('input[type="password"], input[placeholder*="password"i]', 'Shihab@2026');
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');

    // Wait and check if 2FA code is requested
    await page.waitForTimeout(2000);
    const has2FA = await page.locator('input[placeholder*="Code"i], input[placeholder*="2FA"i]').isVisible();
    if (has2FA) {
      console.log('Entering 2FA Code...');
      await page.fill('input[placeholder*="Code"i], input[placeholder*="2FA"i]', '246810');
      await page.click('button[type="submit"], button:has-text("Verify")');
    }

    console.log('Waiting for Dashboard...');
    await page.waitForURL('**/xk9-admin-portal-2025');
    await page.waitForTimeout(3000);

    // Click Profile section
    console.log('Navigating to Profile Section...');
    const profileBtn = page.locator('button:has-text("Profile"), a:has-text("Profile")').first();
    await profileBtn.click();
    await page.waitForTimeout(1000);

    // Find Name (EN) input
    console.log('Locating Name (EN) input...');
    const nameInput = page.locator('label:has-text("Name (EN)") + input, label:has-text("Name (EN)") >> xpath=.. >> input, input[value*="Muntasir"]');
    
    // Let's print all inputs with their labels to be sure
    const labels = await page.locator('label').allTextContents();
    console.log('Found labels:', labels);

    const val = await nameInput.inputValue();
    console.log(`Current Profile Name: "${val}"`);

    // Let's modify it
    const newName = val.includes('Updated') ? 'Muntasir Shihab' : 'Muntasir Shihab Updated';
    console.log(`Changing name to: "${newName}"`);
    await nameInput.fill(newName);

    // Click Save
    console.log('Clicking Save button...');
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Save Changes")').first();
    await saveBtn.click();

    // Wait for database save response/log
    console.log('Waiting after Save...');
    await page.waitForTimeout(5000);

    // Let's check the home page to see if it updated
    console.log('Navigating to Home Page...');
    const homePage = await context.newPage();
    
    // Log home page console
    homePage.on('console', msg => {
      console.log(`[HOME BROWSER LOG] [${msg.type()}] ${msg.text()}`);
    });

    await homePage.goto('http://localhost:5174/');
    await homePage.waitForTimeout(3000);
    
    // Check if the new name exists on the home page
    const bodyText = await homePage.innerText('body');
    if (bodyText.includes(newName)) {
      console.log(`🎉 SUCCESS: Home page contains the updated name "${newName}"!`);
    } else {
      console.log(`❌ FAILURE: Home page does not contain "${newName}"!`);
      // Let's find what names are there
      console.log('Home page body sample text:', bodyText.substring(0, 1000));
    }

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await browser.close();
  }
}

run();
