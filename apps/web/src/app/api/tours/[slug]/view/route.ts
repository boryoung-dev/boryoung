import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

// POST: 상품 조회수 증가
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.tourProduct.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
