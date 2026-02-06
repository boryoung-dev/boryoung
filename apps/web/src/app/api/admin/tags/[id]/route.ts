import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { updateTagSchema } from "@/lib/validations/tag";

// PUT: 태그 수정
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
    const parsed = updateTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "유효성 검사 실패", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    console.error("태그 수정 오류:", error);
    return NextResponse.json(
      { error: "태그 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 태그 삭제
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
    // 연결된 ProductTag도 cascade로 삭제
    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("태그 삭제 오류:", error);
    return NextResponse.json(
      { error: "태그 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
