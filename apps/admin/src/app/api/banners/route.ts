import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// GET: 배너 목록 조회 (인증 필요)
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        sortOrder: "asc"
      }
    });

    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error("배너 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "배너 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

// POST: 배너 생성 (인증 필요)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      ctaText,
      sortOrder,
      isActive
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "제목과 이미지 URL은 필수입니다" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        ctaText,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error) {
    console.error("배너 생성 실패:", error);
    return NextResponse.json(
      { error: "배너를 생성할 수 없습니다" },
      { status: 500 }
    );
  }
}
