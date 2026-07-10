const bcrypt = require('bcryptjs');
const { prisma } = require('./src/config/db');

async function createAdmin() {
  try {
    const email = 'shubham3@gmail.com';
    const password = 'shubham123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'admin',
        status: 'approved'
      },
      create: {
        name: 'Shubham Admin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        status: 'approved'
      }
    });
    console.log('Admin account created/updated successfully!');
    
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
