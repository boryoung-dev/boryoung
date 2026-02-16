import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [
      todayBookings,
      weekBookings,
      monthBookings,
      pendingBookings,
      totalProducts,
      activeProducts,
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          createdAt: { gte: todayStart },
        },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: weekStart },
        },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: monthStart },
        },
      }),
      prisma.booking.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.tourProduct.count(),
      prisma.tourProduct.count({
        where: {
          isActive: true,
        },
      }),
    ]);
    
    return NextResponse.json({
      success: true,
      stats: {
        todayBookings,
        weekBookings,
        monthBookings,
        pendingBookings,
        totalProducts,
        activeProducts,
      },
    });
    
  } catch (error) {
    console.error('Stats fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '통계 조회 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
