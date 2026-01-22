// server/verify-tasks.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
  console.log("--- Starting Verification Script ---");

  const targetUser = await prisma.user.findUnique({
    where: { email: 'diegolarregui14@outlook.com' },
  });

  if (!targetUser) {
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("ERROR: The user 'diegolarregui14@outlook.com' was NOT found in the database.");
    console.error("This is likely the reason no tasks are being created.");
    console.error("Please ensure this user exists in the 'User' table.");
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    return;
  }

  console.log(`Successfully found user '${targetUser.name}' (ID: ${targetUser.id}).`);

  const tasks = await prisma.task.findMany({
    where: { userId: targetUser.id },
    orderBy: {
        startTime: 'asc',
    }
  });

  console.log(`\nFound a total of ${tasks.length} tasks for this user.`);

  if (tasks.length > 0) {
    console.log("\nHere are the first 5 tasks found:");
    tasks.slice(0, 5).forEach(task => {
        console.log(`- "${task.title}" scheduled for ${new Date(task.startTime).toISOString()}`);
    });
  } else {
    console.log("\nNo tasks were found. This confirms the seed script is not successfully inserting the data, even though it found the user.");
  }
  
  console.log("\n--- Verification Script Finished ---");
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
