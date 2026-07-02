import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing upsert_portfolio_content RPC using ANON client...');
  const { data: rpcData, error: rpcError } = await supabase.rpc('upsert_portfolio_content', {
    p_key: 'test_anon_rpc_key',
    p_value: { hello: 'world_anon' }
  });

  if (rpcError) {
    console.error('ANON RPC Error:', rpcError);
  } else {
    console.log('ANON RPC Success:', rpcData);
    
    // Read using anon client to verify it exists
    const { data: selectData, error: selectError } = await supabase
      .from('portfolio_content')
      .select('*')
      .eq('key', 'test_anon_rpc_key');
      
    console.log('Select verification:', selectData);
    
    // Clean up using the RPC if possible, or delete (will delete fail due to RLS?)
    console.log('Attempting cleanup delete...');
    const { error: deleteError } = await supabase.from('portfolio_content').delete().eq('key', 'test_anon_rpc_key');
    console.log('Cleanup delete error:', deleteError);
  }
}

run();
