import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.admin.create({
    data: {
      email: 'admin@befroosh.ir',
      password: 'hashed_password_placeholder',
      name: 'مدیر اصلی'
    }
  });
  console.log('Admin seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
