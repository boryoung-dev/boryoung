import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// API 키 마스킹 (앞 4자 + ****)
function maskApiKey(key: string | null): string | null {
  if (!key) return null;
  if (key.length <= 4) return "****";
  return key.slice(0, 4) + "****";
}

// GET: AI 제공자 목록
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const providers = await prisma.aIProvider.findMany({
      orderBy: { createdAt: "desc" },
    });

    // API 키, OAuth Client Secret 마스킹하여 반환
    const maskedProviders = providers.map((p) => ({
      ...p,
      apiKey: maskApiKey(p.apiKey),
      oauthClientSecret: maskApiKey(p.oauthClientSecret),
    }));

    return NextResponse.json({ success: true, providers: maskedProviders });
  } catch (error) {
    console.error("AI 제공자 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "AI 제공자 목록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST: AI 제공자 생성
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, provider, apiKey, model, isDefault, authType, oauthClientId, oauthClientSecret } = body;

    if (!name || !provider) {
      return NextResponse.json(
        { error: "이름과 제공자는 필수입니다" },
        { status: 400 }
      );
    }

    // 기본 제공자 설정 시 기존 기본 제공자 해제
    if (isDefault) {
      await prisma.aIProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const newProvider = await prisma.aIProvider.create({
      data: {
        name,
        provider,
        apiKey: apiKey || null,
        model: model || null,
        isDefault: isDefault || false,
        authType: authType || "apikey",
        oauthClientId: oauthClientId || null,
        oauthClientSecret: oauthClientSecret || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        provider: { ...newProvider, apiKey: maskApiKey(newProvider.apiKey), oauthClientSecret: maskApiKey(newProvider.oauthClientSecret) },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("AI 제공자 생성 오류:", error);
    return NextResponse.json(
      { error: "AI 제공자 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
