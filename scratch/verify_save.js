import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Step 1: Write via RPC (same as saveToDb now does)
  console.log('=== Step 1: Save via upsert_portfolio_content RPC (anon client) ===');
  const testProfile = { name: 'Muntasir Shihab TEST', title: 'Test Title' };
  const { error: rpcError } = await supabase.rpc('upsert_portfolio_content', {
    p_key: 'test_verify_key',
    p_value: testProfile
  });
  if (rpcError) {
    console.error('❌ RPC FAILED:', rpcError);
    process.exit(1);
  }
  console.log('✅ RPC save succeeded!');

  // Step 2: Read back (same as loadData does)
  console.log('\n=== Step 2: Read back from portfolio_content (anon client) ===');
  const { data, error: readError } = await supabase
    .from('portfolio_content')
    .select('*')
    .eq('key', 'test_verify_key');
  if (readError) {
    console.error('❌ READ FAILED:', readError);
    process.exit(1);
  }
  console.log('✅ Read succeeded:', JSON.stringify(data, null, 2));

  // Step 3: Verify the value matches
  if (data && data.length > 0 && data[0].value.name === 'Muntasir Shihab TEST') {
    console.log('\n🎉 VERIFIED: Data saved and read back correctly!');
    console.log('   The admin panel save → frontend read pipeline WORKS.');
  } else {
    console.error('\n❌ Data mismatch or missing!');
  }

  // Step 4: Cleanup
  console.log('\n=== Cleanup ===');
  const { error: cleanupError } = await supabase.rpc('upsert_portfolio_content', {
    p_key: 'test_verify_key',
    p_value: null
  });
  // Also try deleting - RLS may block this but it's fine
  await supabase.from('portfolio_content').delete().eq('key', 'test_verify_key');
  console.log('Cleanup done (RPC nulled the value)');
}

run();
