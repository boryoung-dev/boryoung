import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// POST: 상품 일괄 작업
// body: { action: "delete" | "activate" | "deactivate" | "feature" | "unfeature", ids: string[] }
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { action, ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "선택된 상품이 없습니다" }, { status: 400 });
    }

    let result;
    switch (action) {
      case "delete":
        result = await prisma.tourProduct.deleteMany({ where: { id: { in: ids } } });
        break;
      case "activate":
        result = await prisma.tourProduct.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        break;
      case "deactivate":
        result = await prisma.tourProduct.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;
      case "feature":
        result = await prisma.tourProduct.updateMany({
          where: { id: { in: ids } },
          data: { isFeatured: true },
        });
        break;
      case "unfeature":
        result = await prisma.tourProduct.updateMany({
          where: { id: { in: ids } },
          data: { isFeatured: false },
        });
        break;
      default:
        return NextResponse.json({ error: "알 수 없는 작업입니다" }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("[products/bulk] error:", error);
    return NextResponse.json({ error: "일괄 작업 실패" }, { status: 500 });
  }
}
