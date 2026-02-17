import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// PUT: 빠른아이콘 수정 (인증 필요)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { label, iconName, linkUrl, sortOrder, isActive } = body;

    const quickIcon = await prisma.quickIcon.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(iconName !== undefined && { iconName }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({ success: true, quickIcon });
  } catch (error) {
    console.error("빠른아이콘 수정 실패:", error);
    return NextResponse.json(
      { error: "빠른아이콘을 수정할 수 없습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 빠른아이콘 삭제 (인증 필요)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.quickIcon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("빠른아이콘 삭제 실패:", error);
    return NextResponse.json(
      { error: "빠른아이콘을 삭제할 수 없습니다" },
      { status: 500 }
    );
  }
}
