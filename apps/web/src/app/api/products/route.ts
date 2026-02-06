import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get('destination');
  const limit = parseInt(searchParams.get('limit') || '1000');
  const featured = searchParams.get('featured') === 'true';

  try {
    const products = await prisma.tourProduct.findMany({
      where: {
        isActive: true,
        ...(destination && destination !== '전체' && { destination }),
        ...(featured && { isFeatured: true }),
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: limit,
    });

    return Response.json({ products });
  } catch (error) {
    console.error('Prisma 오류:', error);
    return Response.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
