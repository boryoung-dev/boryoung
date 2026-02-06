import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tourProductId,
      name,
      phone,
      email,
      peopleCount,
      desiredDate,
      selectedOptions,
      totalPrice,
      requests,
    } = body;

    if (!tourProductId || !name || !phone || !peopleCount) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요" },
        { status: 400 }
      );
    }

    // 예약 번호 생성
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const todayBookings = await prisma.booking.count({
      where: {
        bookingNumber: {
          startsWith: `BK${dateStr}`,
        },
      },
    });
    const bookingNumber = `BK${dateStr}-${String(todayBookings + 1).padStart(3, "0")}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        tourProductId,
        name,
        phone,
        email: email || null,
        peopleCount: parseInt(peopleCount),
        desiredDate: desiredDate ? new Date(desiredDate) : null,
        selectedOptions: selectedOptions || [],
        totalPrice: totalPrice || null,
        requests,
        status: "PENDING",
      },
      include: {
        tourProduct: {
          select: { title: true },
        },
      },
    });

    // 예약 수 증가
    await prisma.tourProduct.update({
      where: { id: tourProductId },
      data: { bookingCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      bookingNumber,
      message: "예약 문의가 접수되었습니다",
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "예약 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingNumber = searchParams.get("bookingNumber");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (bookingNumber) {
      const booking = await prisma.booking.findUnique({
        where: { bookingNumber },
        include: {
          tourProduct: {
            select: {
              title: true,
              destination: true,
              durationText: true,
              basePrice: true,
            },
          },
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "예약을 찾을 수 없습니다" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, booking });
    }

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
