import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// PUT: 배너 수정 (인증 필요)
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
      subtitle,
      imageUrl,
      linkUrl,
      ctaText,
      sortOrder,
      isActive,
      startDate,
      endDate,
      placement,
    } = body;

    if (placement !== undefined && !["main", "tour"].includes(placement)) {
      return NextResponse.json(
        { error: "올바르지 않은 배너 위치입니다" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(ctaText !== undefined && { ctaText }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
        ...(placement !== undefined && { placement }),
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("배너 수정 실패:", error);
    return NextResponse.json(
      { error: "배너를 수정할 수 없습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 배너 삭제 (인증 필요)
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

    await prisma.banner.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("배너 삭제 실패:", error);
    return NextResponse.json(
      { error: "배너를 삭제할 수 없습니다" },
      { status: 500 }
    );
  }
}
