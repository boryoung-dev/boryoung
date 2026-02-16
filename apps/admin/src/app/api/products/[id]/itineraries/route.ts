import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// PUT: 일정 일괄 저장 (기존 삭제 후 재생성)
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
    const { itineraries } = await request.json();

    if (!Array.isArray(itineraries)) {
      return NextResponse.json({ error: "itineraries 배열이 필요합니다" }, { status: 400 });
    }

    // 트랜잭션: 기존 일정 삭제 → 새로 생성
    await prisma.$transaction(async (tx) => {
      await tx.itinerary.deleteMany({ where: { productId: id } });

      if (itineraries.length > 0) {
        await tx.itinerary.createMany({
          data: itineraries.map((it: any, idx: number) => ({
            productId: id,
            day: it.day || idx + 1,
            title: it.title || `${idx + 1}일차`,
            description: it.description || null,
            activities: it.activities || [],
            meals: it.meals || null,
            accommodation: it.accommodation || null,
            golfCourse: it.golfCourse || null,
            golfHoles: it.golfHoles || null,
            transport: it.transport || null,
            sortOrder: idx,
          })),
        });
      }
    });

    const updated = await prisma.itinerary.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, itineraries: updated });
  } catch (error) {
    console.error("일정 저장 오류:", error);
    return NextResponse.json(
      { error: "일정 저장 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PATCH: 개별 일정 description 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { updates } = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "updates 배열이 필요합니다" }, { status: 400 });
    }

    // 각 일정의 description을 개별 업데이트
    await prisma.$transaction(
      updates.map((u: { itineraryId: string; description: string }) =>
        prisma.itinerary.update({
          where: { id: u.itineraryId },
          data: { description: u.description },
        })
      )
    );

    const updated = await prisma.itinerary.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, itineraries: updated });
  } catch (error) {
    console.error("일정 설명 업데이트 오류:", error);
    return NextResponse.json(
      { error: "일정 설명 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
