import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";
import { updateCategorySchema } from "@repo/database/validations";

// PUT: 카테고리 수정
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
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "유효성 검사 실패", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...parsed.data,
        parentId: parsed.data.parentId ?? undefined,
      },
      include: { parent: true, children: true },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("카테고리 수정 오류:", error);
    return NextResponse.json(
      { error: "카테고리 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 카테고리 삭제
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
    // 상품이 연결된 카테고리는 삭제 시 상품이 고아가 되므로 차단 (상품 카테고리는 필수값)
    const productCount = await prisma.tourProduct.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `이 카테고리를 사용 중인 상품이 ${productCount}개 있어 삭제할 수 없습니다. 먼저 상품의 카테고리를 변경해주세요.` },
        { status: 400 }
      );
    }

    // 하위 카테고리는 onDelete: SetNull 로 자동 최상위 승격됨 (삭제를 막지 않음)
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("카테고리 삭제 오류:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "카테고리를 찾을 수 없습니다" },
        { status: 404 }
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "다른 데이터와 연결되어 있어 삭제할 수 없습니다" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "카테고리 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
