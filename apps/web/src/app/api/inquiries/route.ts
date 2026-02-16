import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { createInquirySchema } from "@repo/database/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validated = createInquirySchema.parse(body);

    // email이 빈 문자열이면 null로 변환
    const email = validated.email === "" ? null : validated.email;

    const inquiry = await prisma.inquiry.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email,
        content: validated.content,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error: any) {
    console.error("문의 생성 오류:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력 정보를 확인해주세요", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "문의 접수 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
