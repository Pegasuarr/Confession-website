import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const links = await prisma.link.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      expiresAt: true,
      createdAt: true,
    }
  });
  console.log('--- Database Links ---');
  console.log(JSON.stringify(links, null, 2));
  console.log('----------------------');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
