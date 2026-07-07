import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { avatar: null },
        { avatar: '' }
      ]
    }
  });

  console.log(`🔍 Found ${users.length} user(s) with missing avatars.`);

  for (const user of users) {
    const seed = encodeURIComponent(user.name || user.email);
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar }
    });
    console.log(`  - Updated avatar for user: ${user.email}`);
  }

  console.log('✅ All user avatars have been updated successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
