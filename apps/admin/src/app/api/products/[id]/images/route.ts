import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// PUT: 상품 이미지 일괄 저장 (기존 삭제 후 재생성)
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
    const { images } = await request.json();

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "images 배열이 필요합니다" }, { status: 400 });
    }

    // 트랜잭션: 기존 이미지 삭제 → 새로 생성
    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });

      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: any, idx: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || null,
            type: img.type || "DETAIL",
            sortOrder: idx,
            isThumbnail: img.isThumbnail || false,
          })),
        });
      }
    });

    const updated = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, images: updated });
  } catch (error) {
    console.error("이미지 저장 오류:", error);
    return NextResponse.json(
      { error: "이미지 저장 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
