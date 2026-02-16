import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        tourProduct: {
          select: {
            id: true,
            title: true,
            destination: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      { error: "예약 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
