import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash passwords for the users
  const saltRounds = 10;
  const passwordJane = await bcrypt.hash('password123', saltRounds);
  const passwordJohn = await bcrypt.hash('password456', saltRounds);

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: passwordJane,
      lc_username: 'janedoe_lc',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      password: passwordJohn,
      lc_username: 'johnsmith_lc',
    },
  });

  console.log(`Created user: ${user1.name} (ID: ${user1.id})`);
  console.log(`Created user: ${user2.name} (ID: ${user2.id})`);

  // Create a Group and connect the users to it
  const group1 = await prisma.group.create({
    data: {
      groupName: 'LeetCode Champions',
      numberOfUsers: 2,
      users: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
    },
  });

  console.log(`Created group: ${group1.groupName} and connected users.`);
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