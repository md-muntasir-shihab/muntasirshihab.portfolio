import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const serviceRoleKey = keyMatch ? keyMatch[1].trim() : '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("Initializing Supabase Admin client...");
  
  // 1. Create or verify 'images' bucket
  console.log("Checking 'images' bucket...");
  const { data: imgData, error: imgError } = await supabaseAdmin.storage.createBucket('images', {
    public: true
  });
  if (imgError) {
    console.log(`Note for 'images' bucket: ${imgError.message}`);
  } else {
    console.log("Successfully created/verified 'images' bucket.");
  }

  // 2. Create or verify 'pdfs' bucket
  console.log("Checking 'pdfs' bucket...");
  const { data: pdfData, error: pdfError } = await supabaseAdmin.storage.createBucket('pdfs', {
    public: true
  });
  if (pdfError) {
    console.log(`Note for 'pdfs' bucket: ${pdfError.message}`);
  } else {
    console.log("Successfully created/verified 'pdfs' bucket.");
  }

  // List existing buckets to verify
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError.message);
  } else {
    console.log("Current Buckets in Supabase:", buckets.map(b => `${b.name} (public: ${b.public})`));
  }
}

run();
