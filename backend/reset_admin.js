const bcrypt = require('bcryptjs');
const { prisma } = require('./src/config/db');

async function resetAdminPassword() {
  const email = 'admin.amit@lms.com';
  const password = 'Admin@123';
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, status: 'approved' },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    console.log('Admin password reset successfully!');
    console.log('User:', JSON.stringify(user, null, 2));
    console.log('Login with:', email, '/', password);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
