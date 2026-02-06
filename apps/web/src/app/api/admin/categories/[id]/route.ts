import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { updateCategorySchema } from "@/lib/validations/category";

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
    // 하위 카테고리가 있는지 확인
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return NextResponse.json(
        { error: "하위 카테고리가 있어 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    // 해당 카테고리를 사용하는 상품이 있는지 확인
    const productCount = await prisma.tourProduct.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "해당 카테고리를 사용 중인 상품이 있어 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("카테고리 삭제 오류:", error);
    return NextResponse.json(
      { error: "카테고리 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
