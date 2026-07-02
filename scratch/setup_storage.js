import pg from 'pg';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const passMatch = env.match(/SUPABASE_DB_PASSWORD=(.*)/);
const dbPassword = passMatch ? passMatch[1].trim() : '';

const regions = [
  'aws-0-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-0-ap-northeast-1',
  'aws-0-ap-northeast-2',
  'aws-0-ap-south-1',
  'aws-0-us-east-1',
  'aws-0-us-east-2',
  'aws-0-us-west-1',
  'aws-0-us-west-2',
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-eu-west-3',
  'aws-0-eu-north-1',
  'aws-0-eu-central-1',
  'aws-0-sa-east-1',
  'aws-0-ca-central-1'
];

const projectRef = 'tzotvfbovknwxmydvwkt';

async function tryConnect(host, port) {
  const config = {
    host,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: dbPassword,
    port,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  };
  const client = new pg.Client(config);
  await client.connect();
  return client;
}

async function run() {
  let client = null;

  for (const region of regions) {
    const host = `${region}.pooler.supabase.com`;
    for (const port of [5432, 6543]) {
      try {
        console.log(`Trying ${host}:${port}...`);
        client = await tryConnect(host, port);
        console.log(`✅ Connected via ${host}:${port}`);
        break;
      } catch (err) {
        // Only print if connection wasn't a hostname resolution error
        if (!err.message?.includes('ENOTFOUND')) {
          console.log(`  ❌ Failed: ${err.message?.substring(0, 80)}`);
        }
      }
    }
    if (client) break;
  }

  if (!client) {
    console.error('❌ Could not connect to database via any pooler region');
    process.exit(1);
  }

  try {
    const sql = `
      -- Ensure buckets exist in storage.buckets
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES 
        ('images', 'images', true, null, null),
        ('pdfs', 'pdfs', true, null, null)
      ON CONFLICT (id) DO UPDATE 
      SET public = true;

      -- Enable RLS on storage.objects
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist to prevent conflict
      DROP POLICY IF EXISTS "Public Upload Images" ON storage.objects;
      DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
      DROP POLICY IF EXISTS "Public Update Images" ON storage.objects;
      DROP POLICY IF EXISTS "Public Delete Images" ON storage.objects;
      
      DROP POLICY IF EXISTS "Public Upload Pdfs" ON storage.objects;
      DROP POLICY IF EXISTS "Public Read Pdfs" ON storage.objects;
      DROP POLICY IF EXISTS "Public Update Pdfs" ON storage.objects;
      DROP POLICY IF EXISTS "Public Delete Pdfs" ON storage.objects;

      -- Create public policies for 'images' bucket
      CREATE POLICY "Public Upload Images" ON storage.objects 
        FOR INSERT TO public WITH CHECK (bucket_id = 'images');
        
      CREATE POLICY "Public Read Images" ON storage.objects 
        FOR SELECT TO public USING (bucket_id = 'images');
        
      CREATE POLICY "Public Update Images" ON storage.objects 
        FOR UPDATE TO public USING (bucket_id = 'images');

      CREATE POLICY "Public Delete Images" ON storage.objects 
        FOR DELETE TO public USING (bucket_id = 'images');

      -- Create public policies for 'pdfs' bucket
      CREATE POLICY "Public Upload Pdfs" ON storage.objects 
        FOR INSERT TO public WITH CHECK (bucket_id = 'pdfs');
        
      CREATE POLICY "Public Read Pdfs" ON storage.objects 
        FOR SELECT TO public USING (bucket_id = 'pdfs');
        
      CREATE POLICY "Public Update Pdfs" ON storage.objects 
        FOR UPDATE TO public USING (bucket_id = 'pdfs');

      CREATE POLICY "Public Delete Pdfs" ON storage.objects 
        FOR DELETE TO public USING (bucket_id = 'pdfs');
    `;

    console.log("Running storage bucket and policy configuration SQL...");
    await client.query(sql);
    console.log("Storage configuration completed successfully!");

  } catch (error) {
    console.error("Error setting up storage:", error);
  } finally {
    await client.end();
  }
}

run();
