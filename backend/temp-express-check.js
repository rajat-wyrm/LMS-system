const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ ok: true }));
app.post('/test', async (req, res) => {
  const { prisma } = require('./src/config/db');
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
app.listen(5002, () => console.log('listening'));
