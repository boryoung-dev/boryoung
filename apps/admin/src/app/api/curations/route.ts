import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// GET: 큐레이션 목록 조회 (인증 필요)
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const curations = await prisma.curation.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        sortOrder: "asc"
      }
    });

    return NextResponse.json({ success: true, curations });
  } catch (error) {
    console.error("큐레이션 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "큐레이션 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

// POST: 큐레이션 생성 (인증 필요)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      sortOrder,
      isActive
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "제목은 필수입니다" },
        { status: 400 }
      );
    }

    const curation = await prisma.curation.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({ success: true, curation }, { status: 201 });
  } catch (error) {
    console.error("큐레이션 생성 실패:", error);
    return NextResponse.json(
      { error: "큐레이션을 생성할 수 없습니다" },
      { status: 500 }
    );
  }
}
