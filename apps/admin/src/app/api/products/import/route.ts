import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";
import { parseProductExcel, slugify } from "@/lib/excel-parser";
import type { ParsedProduct } from "@/lib/excel-parser";

export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일을 선택해주세요" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "엑셀 파일(.xlsx, .xls)만 업로드 가능합니다" }, { status: 400 });
    }

    // 파일 버퍼 읽기
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 엑셀 파싱
    const { products, errors } = parseProductExcel(buffer);

    if (products.length === 0) {
      return NextResponse.json({
        success: false,
        message: "파싱할 상품이 없습니다",
        errors,
        summary: { total: 0, success: 0, failed: 0 },
      }, { status: 400 });
    }

    // 검증 에러가 있으면 경고와 함께 진행 가능한 상품만 처리
    const criticalErrors = errors.filter((e) => e.row > 0);

    // 카테고리 slug → id 매핑
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

    // 태그 slug → id 매핑
    const tags = await prisma.tag.findMany({
      select: { id: true, slug: true },
    });
    const tagMap = new Map(tags.map((t) => [t.slug, t.id]));

    // 기존 slug 목록 조회 (중복 방지)
    const existingSlugs = await prisma.tourProduct.findMany({
      select: { slug: true },
    });
    const slugSet = new Set(existingSlugs.map((p) => p.slug));

    // 상품별 저장
    const results: { title: string; success: boolean; error?: string; slug?: string }[] = [];

    for (const product of products) {
      try {
        const result = await saveProduct(product, categoryMap, tagMap, slugSet);
        results.push({ title: product.title, success: true, slug: result.slug });
        slugSet.add(result.slug); // 중복 방지용 추가
      } catch (err: any) {
        results.push({
          title: product.title,
          success: false,
          error: err.message || "저장 중 오류 발생",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `${successCount}건 성공, ${failedCount}건 실패`,
      summary: {
        total: products.length,
        success: successCount,
        failed: failedCount,
      },
      results,
      parseErrors: criticalErrors.length > 0 ? criticalErrors : undefined,
    });
  } catch (error: any) {
    console.error("엑셀 업로드 오류:", error);
    return NextResponse.json(
      { error: "파일 처리 중 오류가 발생했습니다: " + (error.message || "") },
      { status: 500 }
    );
  }
}

/** 유니크한 slug 생성 */
function generateUniqueSlug(title: string, slugSet: Set<string>): string {
  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = "product";

  let slug = baseSlug;
  let counter = 1;
  while (slugSet.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/** 단일 상품 저장 (트랜잭션) */
async function saveProduct(
  product: ParsedProduct,
  categoryMap: Map<string, string>,
  tagMap: Map<string, string>,
  slugSet: Set<string>
): Promise<{ slug: string }> {
  // 카테고리 검증
  const categoryId = categoryMap.get(product.categorySlug);
  if (!categoryId) {
    throw new Error(`카테고리 "${product.categorySlug}"를 찾을 수 없습니다`);
  }

  // 태그 ID 변환
  const tagIds: string[] = [];
  if (product.tagSlugs) {
    for (const slug of product.tagSlugs) {
      const tagId = tagMap.get(slug);
      if (tagId) {
        tagIds.push(tagId);
      }
      // 없는 태그는 무시 (에러 대신 경고)
    }
  }

  const slug = generateUniqueSlug(product.title, slugSet);

  const result = await prisma.$transaction(async (tx) => {
    // 1. TourProduct 생성
    const tourProduct = await tx.tourProduct.create({
      data: {
        slug,
        title: product.title,
        subtitle: product.subtitle,
        categoryId,
        destination: product.destination,
        departure: product.departure,
        airline: product.airline,
        nights: product.nights,
        days: product.days,
        durationText: product.durationText,
        golfCourses: product.golfCourses ?? undefined,
        totalHoles: product.totalHoles,
        difficulty: product.difficulty,
        minPeople: product.minPeople,
        maxPeople: product.maxPeople,
        basePrice: product.basePrice,
        originalPrice: product.originalPrice,
        content: product.content,
        inclusions: product.inclusions ?? undefined,
        exclusions: product.exclusions ?? undefined,
        scheduleDates: product.scheduleDates ?? undefined,
        naverUrl: product.naverUrl,
        isFeatured: product.isFeatured ?? false,
        isActive: true,
        publishedAt: new Date(),
      },
    });

    // 2. ProductTag 연결
    if (tagIds.length > 0) {
      await tx.productTag.createMany({
        data: tagIds.map((tagId) => ({
          productId: tourProduct.id,
          tagId,
        })),
      });
    }

    // 3. Itinerary 생성
    if (product.itineraries.length > 0) {
      await tx.itinerary.createMany({
        data: product.itineraries.map((itin, idx) => ({
          productId: tourProduct.id,
          day: itin.day,
          title: itin.title,
          description: itin.description,
          meals: itin.meals,
          accommodation: itin.accommodation,
          golfCourse: itin.golfCourse,
          golfHoles: itin.golfHoles,
          transport: itin.transport,
          sortOrder: idx,
        })),
      });
    }

    // 4. PriceOption 생성
    if (product.priceOptions.length > 0) {
      await tx.priceOption.createMany({
        data: product.priceOptions.map((opt, idx) => ({
          productId: tourProduct.id,
          name: opt.name,
          description: opt.description,
          price: opt.price,
          priceType: opt.priceType,
          season: opt.season,
          validFrom: opt.validFrom ? new Date(opt.validFrom) : undefined,
          validTo: opt.validTo ? new Date(opt.validTo) : undefined,
          isDefault: opt.isDefault ?? false,
          isActive: true,
          sortOrder: idx,
        })),
      });
    }

    // 5. ProductImage placeholder 생성 (파일명만 저장)
    const imageData: {
      productId: string;
      url: string;
      alt: string;
      type: string;
      isThumbnail: boolean;
      sortOrder: number;
    }[] = [];

    if (product.thumbnailImage) {
      imageData.push({
        productId: tourProduct.id,
        url: product.thumbnailImage,
        alt: product.title,
        type: "THUMBNAIL",
        isThumbnail: true,
        sortOrder: 0,
      });
    }

    product.detailImages?.forEach((img, idx) => {
      imageData.push({
        productId: tourProduct.id,
        url: img,
        alt: `${product.title} 상세 ${idx + 1}`,
        type: "DETAIL",
        isThumbnail: false,
        sortOrder: idx + 1,
      });
    });

    product.golfCourseImages?.forEach((img, idx) => {
      imageData.push({
        productId: tourProduct.id,
        url: img,
        alt: `${product.title} 골프장 ${idx + 1}`,
        type: "GOLF_COURSE",
        isThumbnail: false,
        sortOrder: idx + 100,
      });
    });

    product.hotelImages?.forEach((img, idx) => {
      imageData.push({
        productId: tourProduct.id,
        url: img,
        alt: `${product.title} 호텔 ${idx + 1}`,
        type: "HOTEL",
        isThumbnail: false,
        sortOrder: idx + 200,
      });
    });

    if (imageData.length > 0) {
      await tx.productImage.createMany({ data: imageData });
    }

    return tourProduct;
  });

  return { slug: result.slug };
}
