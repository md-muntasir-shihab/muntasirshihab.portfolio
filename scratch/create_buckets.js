import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("Checking storage buckets...");
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }

  const bucketNames = buckets.map(b => b.name);
  console.log("Existing buckets:", bucketNames);

  for (const bucketName of ['images', 'pdfs']) {
    if (!bucketNames.includes(bucketName)) {
      console.log(`Creating public bucket "${bucketName}"...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: bucketName === 'pdfs' ? ['application/pdf'] : undefined
      });
      if (error) {
        console.error(`Failed to create bucket "${bucketName}":`, error.message);
      } else {
        console.log(`Bucket "${bucketName}" created successfully.`);
      }
    } else {
      console.log(`Bucket "${bucketName}" already exists.`);
      // Update it to be public just in case
      const { error } = await supabase.storage.updateBucket(bucketName, {
        public: true
      });
      if (error) {
        console.error(`Failed to update bucket "${bucketName}":`, error.message);
      } else {
        console.log(`Bucket "${bucketName}" updated to public.`);
      }
    }
  }
}

run().catch(console.error);
