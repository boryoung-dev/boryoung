#!/usr/bin/env node

/**
 * 초기 관리자 계정 생성
 * 실행: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 관리자 계정 생성 시작...\n');
  
  const email = 'admin@boryoung.com';
  const password = 'admin1234'; // 최초 비밀번호
  const name = '관리자';
  
  // 이미 존재하는지 확인
  const existing = await prisma.admin.findUnique({
    where: { email },
  });
  
  if (existing) {
    console.log('⚠️  이미 관리자 계정이 존재합니다:', email);
    console.log('   비밀번호를 재설정하시겠습니까? (y/n)');
    process.exit(0);
  }
  
  // 비밀번호 해시
  const passwordHash = await bcrypt.hash(password, 10);
  
  // 관리자 생성
  const admin = await prisma.admin.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  
  console.log('✅ 관리자 계정 생성 완료!\n');
  console.log('📧 이메일:', email);
  console.log('🔑 비밀번호:', password);
  console.log('👤 이름:', name);
  console.log('\n⚠️  보안을 위해 최초 로그인 후 비밀번호를 변경하세요!\n');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
