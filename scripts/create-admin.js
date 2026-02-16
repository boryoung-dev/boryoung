const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Admin 계정 생성 시작...\n');

  const admins = [
    {
      email: 'admin@boryoung.com',
      password: 'admin1234',
      name: '심재형',
      role: 'SUPER_ADMIN',
    },
    {
      email: 'manager@boryoung.com',
      password: 'manager1234',
      name: '김매니저',
      role: 'MANAGER',
    },
    {
      email: 'staff@boryoung.com',
      password: 'staff1234',
      name: '이직원',
      role: 'STAFF',
    },
  ];

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 10);

    const result = await prisma.admin.upsert({
      where: { email: admin.email },
      update: {
        passwordHash,
        name: admin.name,
        role: admin.role,
        isActive: true,
      },
      create: {
        email: admin.email,
        passwordHash,
        name: admin.name,
        role: admin.role,
        isActive: true,
      },
    });

    console.log(`✅ ${result.role} 생성: ${result.email} (${result.name})`);
  }

  console.log('\n🎉 Admin 계정 생성 완료!');
  console.log('로그인 정보:');
  admins.forEach(a => {
    console.log(`  - ${a.role}: ${a.email} / ${a.password}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
