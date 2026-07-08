const { Client } = require('pg');

async function test(name, config) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log(`SUCCESS: ${name} connected successfully!`);
    await client.end();
    return true;
  } catch (err) {
    // console.log(`FAIL: ${name} - ${err.message}`);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function run() {
  const common = {
    host: "aws-1-ap-southeast-2.pooler.supabase.com",
    database: "postgres",
    user: "postgres.xlzujidrqvbrdvlpefbt",
    ssl: { rejectUnauthorized: false }
  };

  const passwords = [
    "gunal@2005",
    "Gunal2005",
    "gunal2005",
    "Gunal@2005!",
    "gunal@2005!",
    "Gunal@2006",
    "gunal@2006"
  ];

  for (const pwd of passwords) {
    const ok = await test(`Pass=${pwd}`, { ...common, port: 5432, password: pwd });
    if (ok) return;
  }
  console.log("All variations failed.");
}

run();
