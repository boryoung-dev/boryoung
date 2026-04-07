import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";
import { createProductSchema } from "@repo/database/validations";

// GET: 상품 목록 (필터 + 페이징)
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const status = searchParams.get("status"); // active, inactive, all
  const featured = searchParams.get("featured"); // all, featured, normal
  const startDate = searchParams.get("startDate"); // YYYY-MM-DD
  const endDate = searchParams.get("endDate"); // YYYY-MM-DD
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "default"; // default, latest, priceAsc, priceDesc, viewsDesc, bookingsDesc
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status === "active") where.isActive = true;
  else if (status === "inactive") where.isActive = false;

  if (featured === "featured") where.isFeatured = true;
  else if (featured === "normal") where.isFeatured = false;

  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice.gte = parseInt(minPrice);
    if (maxPrice) where.basePrice.lte = parseInt(maxPrice);
  }

  if (categoryId) where.categoryId = categoryId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { subtitle: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.tourProduct.findMany({
      where,
      include: {
        category: true,
        images: {
          where: { isThumbnail: true },
          take: 1,
        },
        tags: { include: { tag: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy:
        sort === "latest"
          ? [{ createdAt: "desc" }]
          : sort === "priceAsc"
            ? [{ basePrice: "asc" }]
            : sort === "priceDesc"
              ? [{ basePrice: "desc" }]
              : sort === "viewsDesc"
                ? [{ viewCount: "desc" }]
                : sort === "bookingsDesc"
                  ? [{ bookings: { _count: "desc" } }]
                  : [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.tourProduct.count({ where }),
  ]);

  const data = products.map((p) => ({
    ...p,
    thumbnail: p.images[0]?.url || null,
    tagList: p.tags.map((t) => t.tag),
  }));

  return NextResponse.json({
    success: true,
    products: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST: 상품 등록
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "유효성 검사 실패", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tagIds, ...productData } = parsed.data;

    const product = await prisma.tourProduct.create({
      data: {
        ...productData,
        publishedAt: productData.publishedAt
          ? new Date(productData.publishedAt)
          : null,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        images: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("상품 등록 오류:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "이미 존재하는 slug입니다" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "상품 등록 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
