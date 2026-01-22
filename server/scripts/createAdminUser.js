// server/scripts/createAdminUser.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Adjust path to your .env file

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'max@gmail.com';
  const name = 'Admin Max';
  const password = 'darmaxagua';
  const role = 'admin';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.upsert({
      where: { email: email },
      update: {
        name: name,
        password: hashedPassword,
        role: role,
      },
      create: {
        email: email,
        name: name,
        password: hashedPassword,
        role: role,
      },
    });

    console.log(`Admin user '${adminUser.name}' created/updated successfully.`);
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
