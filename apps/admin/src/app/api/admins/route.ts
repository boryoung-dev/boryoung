import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET: 관리자 목록 (SUPER_ADMIN만)
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error("관리자 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "관리자 목록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST: 관리자 생성 (SUPER_ADMIN만)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요" },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, admin: newAdmin }, { status: 201 });
  } catch (error: any) {
    console.error("관리자 생성 오류:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "이미 존재하는 이메일입니다" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "관리자 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
