import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import pg from 'pg';
import fs from 'fs';

// Parse .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  }
});

const projectRef = 'tzotvfbovknwxmydvwkt';
const dbPassword = env.SUPABASE_DB_PASSWORD;

const regions = [
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'eu-central-1',
  'sa-east-1',
  'ca-central-1'
];

const clusters = ['aws-0', 'aws-1', 'aws-2', 'aws-3'];

async function tryConnect(host, port) {
  const config = {
    host,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: dbPassword,
    port,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 2000,
  };
  const client = new pg.Client(config);
  await client.connect();
  return client;
}

async function run() {
  console.log("Starting multi-cluster pooler search...");
  for (const cluster of clusters) {
    for (const region of regions) {
      const host = `${cluster}-${region}.pooler.supabase.com`;
      
      // Check if host resolves first
      try {
        await dns.promises.resolve4(host);
      } catch {
        continue;
      }

      for (const port of [5432, 6543]) {
        try {
          console.log(`Connecting to ${host}:${port}...`);
          const client = await tryConnect(host, port);
          console.log(`\n🎉 SUCCESS! Connected via ${host}:${port}`);
          const res = await client.query("SELECT version();");
          console.log("DB version:", res.rows[0].version);
          await client.end();
          return;
        } catch (err) {
          console.log(`  Result on ${host}:${port} -> ${err.message.trim()}`);
        }
      }
    }
  }
  console.log("Search completed.");
}

run().catch(console.error);
