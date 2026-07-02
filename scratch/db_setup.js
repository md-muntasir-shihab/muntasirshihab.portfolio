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

const { Client } = pg;

const host = 'aws-1-ap-south-1.pooler.supabase.com';
const dbPassword = env.SUPABASE_DB_PASSWORD;

const config = {
  host,
  database: 'postgres',
  user: `postgres.tzotvfbovknwxmydvwkt`,
  password: dbPassword,
  port: 5432,
  ssl: { rejectUnauthorized: false },
};

const sql = `
DROP POLICY IF EXISTS "Public Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Images" ON storage.objects;

DROP POLICY IF EXISTS "Public Upload Pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Pdfs" ON storage.objects;

CREATE POLICY "Public Upload Images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'images');
CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');
CREATE POLICY "Public Update Images" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'images');
CREATE POLICY "Public Delete Images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'images');

CREATE POLICY "Public Upload Pdfs" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'pdfs');
CREATE POLICY "Public Read Pdfs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'pdfs');
CREATE POLICY "Public Update Pdfs" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'pdfs');
CREATE POLICY "Public Delete Pdfs" ON storage.objects FOR DELETE TO public USING (bucket_id = 'pdfs');
`;

async function run() {
  const client = new Client(config);
  console.log(`Connecting to database at ${host}...`);
  await client.connect();
  console.log('Connected successfully!');

  try {
    console.log('Executing storage policies SQL...');
    await client.query(sql);
    console.log('Storage policies applied successfully.');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
