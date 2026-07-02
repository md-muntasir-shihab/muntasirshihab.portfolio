import pg from 'pg';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const passMatch = env.match(/SUPABASE_DB_PASSWORD=(.*)/);
const dbPassword = passMatch ? passMatch[1].trim() : '';

// Try multiple pooler regions (IPv4-compatible)
const regions = [
  'aws-0-ap-southeast-1',
  'aws-0-us-east-1',
  'aws-0-eu-central-1', 
  'aws-0-us-west-1',
  'aws-0-ap-south-1',
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
    connectionTimeoutMillis: 8000,
  };
  const client = new pg.Client(config);
  await client.connect();
  return client;
}

async function run() {
  let client = null;

  // Try pooler hosts
  for (const region of regions) {
    const host = `${region}.pooler.supabase.com`;
    for (const port of [5432, 6543]) {
      try {
        console.log(`Trying ${host}:${port}...`);
        client = await tryConnect(host, port);
        console.log(`✅ Connected via ${host}:${port}`);
        break;
      } catch (err) {
        console.log(`  ❌ Failed: ${err.message?.substring(0, 80)}`);
      }
    }
    if (client) break;
  }

  // Also try direct connection (IPv6)
  if (!client) {
    try {
      const host = `db.${projectRef}.supabase.co`;
      console.log(`Trying direct ${host}:5432...`);
      const directConfig = {
        host,
        database: 'postgres',
        user: 'postgres',
        password: dbPassword,
        port: 5432,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      };
      client = new pg.Client(directConfig);
      await client.connect();
      console.log(`✅ Connected via direct connection`);
    } catch (err) {
      console.log(`  ❌ Direct failed: ${err.message?.substring(0, 80)}`);
    }
  }

  if (!client) {
    console.error('❌ Could not connect to database via any method');
    process.exit(1);
  }

  try {
    // 1. Create mark_message_read RPC
    console.log('\nCreating mark_message_read...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.mark_message_read(p_id uuid)
      RETURNS void AS $$
      BEGIN
        UPDATE public.messages SET is_read = true WHERE id = p_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('  ✅ mark_message_read created');

    // 2. Create delete_message RPC
    console.log('Creating delete_message...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.delete_message(p_id uuid)
      RETURNS void AS $$
      BEGIN
        DELETE FROM public.messages WHERE id = p_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('  ✅ delete_message created');

    // 3. Create reset_portfolio_content RPC
    console.log('Creating reset_portfolio_content...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.reset_portfolio_content()
      RETURNS void AS $$
      BEGIN
        DELETE FROM public.portfolio_content WHERE key != '';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('  ✅ reset_portfolio_content created');

    // 4. Create read_all_messages RPC (so anon can read messages)
    console.log('Creating read_all_messages...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.read_all_messages()
      RETURNS SETOF public.messages AS $$
      BEGIN
        RETURN QUERY SELECT * FROM public.messages ORDER BY created_at DESC;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('  ✅ read_all_messages created');

    // Verify functions exist
    const { rows } = await client.query(`
      SELECT routine_name FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
      ORDER BY routine_name;
    `);
    console.log('\n📋 All public functions:', rows.map(r => r.routine_name));

    console.log('\n✅ All schema updates applied successfully!');
  } catch (error) {
    console.error('❌ Schema update error:', error.message);
  } finally {
    await client.end();
  }
}

run();
