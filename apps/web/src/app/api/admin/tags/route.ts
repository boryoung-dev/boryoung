import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { createTagSchema } from "@/lib/validations/tag";

// GET: 태그 목록
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { productTags: true } },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({ success: true, tags });
}

// POST: 태그 생성
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "유효성 검사 실패", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch (error: any) {
    console.error("태그 생성 오류:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "이미 존재하는 이름 또는 slug입니다" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "태그 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
