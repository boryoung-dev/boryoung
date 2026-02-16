import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 활성 배너 목록 조회 (공개 API, 인증 불필요)
export async function GET() {
  try {
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: {
        sortOrder: "asc"
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
        ctaText: true,
        sortOrder: true
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
