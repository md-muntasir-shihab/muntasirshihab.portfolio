import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

setup('authenticate admin', async ({ baseURL }) => {
  const url = baseURL || 'http://localhost:5173';
  const origin = new URL(url).origin;

  const storageState = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [],
        sessionStorage: [
          {
            name: 'rm_admin_authed',
            value: '1'
          },
          {
            name: 'rm_admin_2fa',
            value: '1'
          }
        ]
      }
    ]
  };

  const dir = path.dirname('browser-data/auth.json');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync('browser-data/auth.json', JSON.stringify(storageState, null, 2), 'utf-8');
  console.log(`Auth state saved successfully to browser-data/auth.json for origin: ${origin}`);
});
