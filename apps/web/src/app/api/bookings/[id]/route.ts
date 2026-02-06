import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 예약 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tourProduct: {
          select: {
            id: true,
            title: true,
            destination: true,
            basePrice: true,
            durationText: true,
            images: {
              where: { isThumbnail: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });
    
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: '예약을 찾을 수 없습니다',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      booking,
    });
    
  } catch (error) {
    console.error('Booking fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '예약 조회 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

// 예약 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, adminMemo } = await request.json();
    
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminMemo !== undefined && { adminMemo }),
      },
    });
    
    return NextResponse.json({
      success: true,
      booking,
    });
    
  } catch (error) {
    console.error('Booking update error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '예약 업데이트 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
