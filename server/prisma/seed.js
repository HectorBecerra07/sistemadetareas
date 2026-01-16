// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { users as mockUsers, tasks as mockTasks, messages as mockMessages } from '../data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Seed users
  for (const user of mockUsers) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }
  console.log('Users seeded.');

  // Seed tasks
  for (const task of mockTasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        completed: task.completed,
        userId: task.userId,
      },
    });
  }
  console.log('Tasks seeded.');

  // Seed messages
  for (const message of mockMessages) {
    await prisma.message.upsert({
        where: { id: message.id },
        update: {},
        create: {
            id: message.id,
            text: message.text,
            createdAt: message.createdAt,
            from_user_id: message.from,
            to_user_id: message.to,
        }
    });
  }
  console.log('Messages seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
