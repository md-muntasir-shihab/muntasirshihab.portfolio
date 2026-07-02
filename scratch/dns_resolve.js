import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dns.resolve6('db.tzotvfbovknwxmydvwkt.supabase.co', (err, addresses) => {
  if (err) {
    console.error("AAAA lookup failed:", err);
  } else {
    console.log("AAAA addresses:", addresses);
  }
});

dns.resolve4('db.tzotvfbovknwxmydvwkt.supabase.co', (err, addresses) => {
  if (err) {
    console.error("A lookup failed:", err);
  } else {
    console.log("A addresses:", addresses);
  }
});
