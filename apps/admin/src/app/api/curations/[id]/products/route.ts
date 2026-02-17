import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// GET: 큐레이션 연결 상품 목록 조회 (인증 필요)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const products = await prisma.curationProduct.findMany({
      where: { curationId: id },
      include: {
        product: true
      },
      orderBy: {
        sortOrder: "asc"
      }
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("큐레이션 상품 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "상품 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

// PUT: 큐레이션 연결 상품 전체 교체 (인증 필요)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "productIds는 배열이어야 합니다" },
        { status: 400 }
      );
    }

    // 트랜잭션으로 기존 연결 삭제 후 새로 생성
    const result = await prisma.$transaction(async (tx) => {
      // 기존 연결 삭제
      await tx.curationProduct.deleteMany({
        where: { curationId: id }
      });

      // 새 연결 생성
      if (productIds.length > 0) {
        await tx.curationProduct.createMany({
          data: productIds.map((productId, index) => ({
            curationId: id,
            productId,
            sortOrder: index
          }))
        });
      }

      // 생성된 연결 목록 반환
      return await tx.curationProduct.findMany({
        where: { curationId: id },
        include: {
          product: true
        },
        orderBy: {
          sortOrder: "asc"
        }
      });
    });

    return NextResponse.json({ success: true, products: result });
  } catch (error) {
    console.error("큐레이션 상품 연결 실패:", error);
    return NextResponse.json(
      { error: "상품 연결을 업데이트할 수 없습니다" },
      { status: 500 }
    );
  }
}
