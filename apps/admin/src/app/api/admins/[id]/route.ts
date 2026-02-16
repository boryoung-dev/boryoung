import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// PUT: 관리자 수정 (SUPER_ADMIN만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, role, isActive, password } = body;

    // 자기 자신의 role 변경 방지
    if (id === admin.adminId && role && role !== admin.role) {
      return NextResponse.json(
        { error: "자기 자신의 권한은 변경할 수 없습니다" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // 비밀번호 변경
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ success: true, admin: updatedAdmin });
  } catch (error: any) {
    console.error("관리자 수정 오류:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "관리자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "관리자 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 관리자 삭제 (SUPER_ADMIN만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { id } = await params;

  // 자기 자신 삭제 방지
  if (id === admin.adminId) {
    return NextResponse.json(
      { error: "자기 자신은 삭제할 수 없습니다" },
      { status: 400 }
    );
  }

  try {
    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("관리자 삭제 오류:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "관리자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "관리자 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
