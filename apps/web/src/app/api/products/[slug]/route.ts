import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await prisma.tourProduct.findUnique({
      where: {
        slug,
        isActive: true,
      },
    });

    if (!product) {
      return Response.json(
        { error: '상품을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return Response.json({ product });
  } catch (error) {
    console.error('Prisma 오류:', error);
    return Response.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
