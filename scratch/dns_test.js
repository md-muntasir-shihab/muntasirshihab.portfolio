import dns from 'dns/promises';

async function run() {
  const hosts = [
    'db.tzotvfbovknwxmydvwkt.supabase.co',
    'tzotvfbovknwxmydvwkt.supabase.co'
  ];

  for (const host of hosts) {
    console.log(`\nDNS Lookup for: ${host}`);
    try {
      const addresses = await dns.resolve(host, 'ANY');
      console.log('ANY records:', JSON.stringify(addresses, null, 2));
    } catch (err) {
      console.log(`ANY query failed: ${err.message}`);
    }

    try {
      const a = await dns.resolve4(host);
      console.log('A records:', a);
    } catch (err) {
      console.log(`A query failed: ${err.message}`);
    }

    try {
      const aaaa = await dns.resolve6(host);
      console.log('AAAA records:', aaaa);
    } catch (err) {
      console.log(`AAAA query failed: ${err.message}`);
    }
  }
}

run().catch(console.error);
