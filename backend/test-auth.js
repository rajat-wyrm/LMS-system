const http = require('http');

const request = (options, data) => new Promise((resolve, reject) => {
  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
      catch (e) { resolve({ status: res.statusCode, data: body }); }
    });
  });
  req.on('error', reject);
  if (data) req.write(JSON.stringify(data));
  req.end();
});

async function testAuth() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "Password123!";
  
  console.log("1. Testing Registration...");
  const regRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: "Test User",
    email,
    password,
    role: "admin" // malicious attempt
  });
  
  console.log("Register Response:", regRes.status, regRes.data);

  if (regRes.status !== 201) {
    console.error("Registration failed!");
    process.exit(1);
  }

  // Expecting the backend to force 'user' role
  if (!regRes.data.pending && regRes.data.user && regRes.data.user.role === 'admin') {
    console.error("VULNERABILITY: User got admin role from public register!");
  } else {
    console.log("Role check passed. System is secure.");
  }

  console.log("\n2. Testing Login...");
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email,
    password
  });

  console.log("Login Response:", loginRes.status, loginRes.data);
  
  if (loginRes.status === 200) {
    console.log("Login successful! Token received.");
  } else {
    console.log("Login returned:", loginRes.data.error || loginRes.data.message);
  }
}

testAuth().catch(console.error);
