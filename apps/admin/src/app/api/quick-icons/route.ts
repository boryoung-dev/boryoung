import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// GET: 빠른아이콘 목록 조회 (인증 필요)
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const quickIcons = await prisma.quickIcon.findMany({
      orderBy: {
        sortOrder: "asc"
      }
    });

    return NextResponse.json({ success: true, quickIcons });
  } catch (error) {
    console.error("빠른아이콘 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "빠른아이콘 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

// POST: 빠른아이콘 생성 (인증 필요)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      label,
      iconName,
      linkUrl,
      sortOrder,
      isActive
    } = body;

    if (!label || !iconName || !linkUrl) {
      return NextResponse.json(
        { error: "레이블, 아이콘 이름, 링크 URL은 필수입니다" },
        { status: 400 }
      );
    }

    const quickIcon = await prisma.quickIcon.create({
      data: {
        label,
        iconName,
        linkUrl,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({ success: true, quickIcon }, { status: 201 });
  } catch (error) {
    console.error("빠른아이콘 생성 실패:", error);
    return NextResponse.json(
      { error: "빠른아이콘을 생성할 수 없습니다" },
      { status: 500 }
    );
  }
}
