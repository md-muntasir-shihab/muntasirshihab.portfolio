import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';

// Load env files manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filename: string) {
  const filePath = path.resolve(__dirname, filename);
  if (fs.existsSync(filePath)) {
    const envConfig = fs.readFileSync(filePath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  }
}

// Load main .env first, then override with .env.test
loadEnvFile('.env');
loadEnvFile('.env.test');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Single worker to avoid DB / LocalStorage race conditions
  reporter: 'html',
  use: {
    baseURL: process.env.SITE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Main tests depending on setup
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'browser-data/auth.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: 'npx vite preview --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
