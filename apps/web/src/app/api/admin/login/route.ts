import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // 관리자 찾기
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다',
        },
        { status: 401 }
      );
    }
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다',
        },
        { status: 401 }
      );
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 마지막 로그인 시간 업데이트
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });
    
    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '로그인 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
