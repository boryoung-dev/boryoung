import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";
import { createCategorySchema } from "@repo/database/validations";

// GET: 카테고리 트리
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: {
        include: {
          children: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  // 트리 구조로 변환 (최상위만 반환)
  const tree = categories
    .filter((c) => !c.parentId)
    .map((c) => ({
      ...c,
      children: categories
        .filter((child) => child.parentId === c.id)
        .map((child) => ({
          ...child,
          children: categories.filter((gc) => gc.parentId === child.id),
        })),
    }));

  return NextResponse.json({ success: true, categories: tree });
}

// POST: 카테고리 생성
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "유효성 검사 실패", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 부모가 있으면 레벨 자동 설정
    let level = parsed.data.level ?? 0;
    if (parsed.data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parsed.data.parentId },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const category = await prisma.category.create({
      data: {
        ...parsed.data,
        level,
        parentId: parsed.data.parentId || null,
      },
      include: { parent: true, children: true },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error("카테고리 생성 오류:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "이미 존재하는 이름 또는 slug입니다" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "카테고리 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
