import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// POST: API 키 연결 테스트
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: "제공자 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "AI 제공자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 제공자별 연결 테스트
    switch (provider.provider) {
      case "openai":
        return await testOpenAI(provider.apiKey);
      case "anthropic":
        return await testAnthropic(provider.apiKey);
      case "google":
        return await testGoogle(provider);
      case "xai":
        return await testXAI(provider.apiKey);
      default:
        return NextResponse.json(
          { error: `지원하지 않는 제공자입니다: ${provider.provider}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("API 키 테스트 오류:", error);
    return NextResponse.json(
      { error: "연결 테스트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// OpenAI 연결 테스트 (모델 목록 조회)
async function testOpenAI(apiKey: string | null) {
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "API 키가 설정되지 않았습니다" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json({
      success: false,
      error: errorData?.error?.message || `HTTP ${response.status}`,
    });
  }

  return NextResponse.json({ success: true, message: "OpenAI 연결 성공" });
}

// Anthropic 연결 테스트 (간단한 메시지 요청)
async function testAnthropic(apiKey: string | null) {
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "API 키가 설정되지 않았습니다" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{ role: "user", content: "test" }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json({
      success: false,
      error: errorData?.error?.message || `HTTP ${response.status}`,
    });
  }

  return NextResponse.json({ success: true, message: "Anthropic 연결 성공" });
}

// Google 연결 테스트 (모델 목록 조회)
async function testGoogle(provider: {
  apiKey: string | null;
  authType: string;
  oauthData: any;
}) {
  let url: string;
  const headers: Record<string, string> = {};

  if (provider.authType === "oauth" && provider.oauthData) {
    const oauthData = provider.oauthData as { access_token: string };
    url = "https://generativelanguage.googleapis.com/v1beta/models";
    headers["Authorization"] = `Bearer ${oauthData.access_token}`;
  } else if (provider.apiKey) {
    url = `https://generativelanguage.googleapis.com/v1beta/models?key=${provider.apiKey}`;
  } else {
    return NextResponse.json(
      { success: false, error: "API 키 또는 OAuth 인증이 필요합니다" },
      { status: 400 }
    );
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json({
      success: false,
      error: errorData?.error?.message || `HTTP ${response.status}`,
    });
  }

  return NextResponse.json({ success: true, message: "Google 연결 성공" });
}

// x.ai 연결 테스트 (모델 목록 조회, OpenAI 호환)
async function testXAI(apiKey: string | null) {
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "API 키가 설정되지 않았습니다" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.x.ai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json({
      success: false,
      error: errorData?.error?.message || `HTTP ${response.status}`,
    });
  }

  return NextResponse.json({ success: true, message: "x.ai 연결 성공" });
}
