import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// API 키 마스킹
function maskApiKey(key: string | null): string | null {
  if (!key) return null;
  if (key.length <= 4) return "****";
  return key.slice(0, 4) + "****";
}

// GET: AI 제공자 상세
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const provider = await prisma.aIProvider.findUnique({ where: { id } });

    if (!provider) {
      return NextResponse.json(
        { error: "AI 제공자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: { ...provider, apiKey: maskApiKey(provider.apiKey) },
    });
  } catch (error) {
    console.error("AI 제공자 조회 오류:", error);
    return NextResponse.json(
      { error: "AI 제공자 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PUT: AI 제공자 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, provider, apiKey, model, isDefault, isActive, authType } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (provider !== undefined) updateData.provider = provider;
    if (model !== undefined) updateData.model = model;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (authType !== undefined) updateData.authType = authType;

    // apiKey가 마스킹된 값이 아닌 경우에만 업데이트
    if (apiKey !== undefined && !apiKey.includes("****")) {
      updateData.apiKey = apiKey || null;
    }

    // 기본 제공자 설정 시 기존 기본 제공자 해제
    if (isDefault !== undefined) {
      if (isDefault) {
        await prisma.aIProvider.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
      updateData.isDefault = isDefault;
    }

    const updated = await prisma.aIProvider.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      provider: { ...updated, apiKey: maskApiKey(updated.apiKey) },
    });
  } catch (error: any) {
    console.error("AI 제공자 수정 오류:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "AI 제공자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "AI 제공자 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: AI 제공자 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.aIProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("AI 제공자 삭제 오류:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "AI 제공자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "AI 제공자 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
