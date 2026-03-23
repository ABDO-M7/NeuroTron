import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ⛔ قم بتغيير هذا الإيميل للإيميل اللي سجلت بيه الدخول للموقع
  const myEmail = 'abdulrahma.muhammad51@gmail.com'; 

  try {
    const updatedUser = await prisma.user.update({
      where: { email: myEmail },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Success! The user ${updatedUser.email} is now an ADMIN.`);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    console.log('Make sure the user already exists in the database (Log in first).');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
