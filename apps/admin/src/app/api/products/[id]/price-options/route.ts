import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// PUT: 가격 옵션 일괄 저장 (기존 삭제 후 재생성)
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
    const { priceOptions } = await request.json();

    if (!Array.isArray(priceOptions)) {
      return NextResponse.json({ error: "priceOptions 배열이 필요합니다" }, { status: 400 });
    }

    // 트랜잭션: 기존 가격 옵션 삭제 → 새로 생성
    await prisma.$transaction(async (tx) => {
      await tx.priceOption.deleteMany({ where: { productId: id } });

      if (priceOptions.length > 0) {
        await tx.priceOption.createMany({
          data: priceOptions.map((opt: any, idx: number) => ({
            productId: id,
            name: opt.name,
            description: opt.description || null,
            price: opt.price || 0,
            priceType: opt.priceType || "PER_PERSON",
            season: opt.season || null,
            isDefault: opt.isDefault || false,
            isActive: opt.isActive ?? true,
            sortOrder: idx,
          })),
        });
      }
    });

    const updated = await prisma.priceOption.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, priceOptions: updated });
  } catch (error) {
    console.error("가격 옵션 저장 오류:", error);
    return NextResponse.json(
      { error: "가격 옵션 저장 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
