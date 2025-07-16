import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash passwords for the users
  const saltRounds = 10;
  const passwordJane = await bcrypt.hash('password123', saltRounds);
  const passwordJohn = await bcrypt.hash('password456', saltRounds);
  const passwordAlice = await bcrypt.hash('alicepass', saltRounds);
  const passwordBob = await bcrypt.hash('bobpass', saltRounds);
  const passwordCharlie = await bcrypt.hash('charliepass', saltRounds);

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: passwordJane,
      lcUsername: 'janedoe_lc',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      password: passwordJohn,
      lcUsername: 'johnsmith_lc',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      password: passwordAlice,
      lcUsername: 'alicejohnson_lc',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Bob Lee',
      email: 'bob.lee@example.com',
      password: passwordBob,
      lcUsername: 'boblee_lc',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Charlie Kim',
      email: 'charlie.kim@example.com',
      password: passwordCharlie,
      lcUsername: 'charliekim_lc',
    },
  });

  console.log(`Created user: ${user1.name} (ID: ${user1.id})`);
  console.log(`Created user: ${user2.name} (ID: ${user2.id})`);
  console.log(`Created user: ${user3.name} (ID: ${user3.id})`);
  console.log(`Created user: ${user4.name} (ID: ${user4.id})`);
  console.log(`Created user: ${user5.name} (ID: ${user5.id})`);

  // Create a Group and connect the users to it
  const group1 = await prisma.group.create({
    data: {
      groupName: 'LeetCode Champions',
      numberOfUsers: 5,
      users: {
        connect: [
          { id: user1.id },
          { id: user2.id },
          { id: user3.id },
          { id: user4.id },
          { id: user5.id },
        ],
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