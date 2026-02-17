import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// GET: 큐레이션 상세 조회 (인증 필요)
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

    const curation = await prisma.curation.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true
          },
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    });

    if (!curation) {
      return NextResponse.json(
        { error: "큐레이션을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, curation });
  } catch (error) {
    console.error("큐레이션 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "큐레이션을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

// PUT: 큐레이션 수정 (인증 필요)
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

    const {
      title,
      description,
      imageUrl,
      linkUrl,
      sortOrder,
      isActive
    } = body;

    const curation = await prisma.curation.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({ success: true, curation });
  } catch (error) {
    console.error("큐레이션 수정 실패:", error);
    return NextResponse.json(
      { error: "큐레이션을 수정할 수 없습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 큐레이션 삭제 (인증 필요)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.curation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("큐레이션 삭제 실패:", error);
    return NextResponse.json(
      { error: "큐레이션을 삭제할 수 없습니다" },
      { status: 500 }
    );
  }
}
