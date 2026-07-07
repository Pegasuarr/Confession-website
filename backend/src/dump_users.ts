import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
    }
  });
  console.log('--- Database Users ---');
  console.log(JSON.stringify(users, null, 2));
  console.log('----------------------');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
