import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";
import { updateInquirySchema } from "@repo/database/validations";

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

    // Validation
    const validated = updateInquirySchema.parse(body);

    // adminReply가 있으면 자동으로 repliedAt, repliedBy, status 설정
    const updateData: any = {
      ...validated,
    };

    if (validated.adminReply) {
      updateData.repliedAt = new Date();
      updateData.repliedBy = admin.email;
      updateData.status = "REPLIED";
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error: any) {
    console.error("문의 수정 오류:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력 정보를 확인해주세요", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "문의 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

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

    await prisma.inquiry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("문의 삭제 오류:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "문의 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
