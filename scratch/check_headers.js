import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('https://tzotvfbovknwxmydvwkt.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'sb_publishable_QHJqmB4MTeZ6w_LQXyJ68w_qmk0IZrP'
      }
    });
    console.log("Status:", res.status);
    console.log("Headers:", JSON.stringify(res.headers, null, 2));
  } catch (err) {
    console.error("Error headers:", err.response ? err.response.headers : err.message);
  }
}

run().catch(console.error);
