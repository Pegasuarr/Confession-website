import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { verified: false },
    data: { verified: true }
  });
  console.log(`✅ Successfully verified ${result.count} existing user account(s) in local database.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
