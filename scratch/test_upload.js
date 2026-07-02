import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Testing upload to 'images' bucket using anon key...");
  
  const testBuffer = Buffer.from("test image content");
  const fileName = `test-${Date.now()}.txt`;
  
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, testBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (error) {
      console.error("Upload failed with error:", error);
    } else {
      console.log("Upload succeeded! Data:", data);
      
      // Clean up
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([fileName]);
      console.log("Cleanup status:", deleteError ? `Failed: ${deleteError.message}` : "Success");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
