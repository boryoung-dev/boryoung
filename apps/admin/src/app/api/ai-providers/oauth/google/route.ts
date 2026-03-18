import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// GET: Google OAuth 시작 - 인증 URL로 리다이렉트
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // providerId를 state에 포함 (콜백에서 사용)
  const providerId = request.nextUrl.searchParams.get("providerId") || "";

  // DB에서 해당 제공자의 OAuth Client ID 조회
  let clientId = process.env.GOOGLE_CLIENT_ID;
  if (providerId) {
    const provider = await prisma.aIProvider.findUnique({ where: { id: providerId } });
    if (provider?.oauthClientId) {
      clientId = provider.oauthClientId;
    }
  }

  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth Client ID가 설정되지 않았습니다. 제공자 설정에서 Client ID를 입력하세요." },
      { status: 500 }
    );
  }

  const callbackUrl = `${request.nextUrl.origin}/api/ai-providers/oauth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/cloud-platform",
    access_type: "offline",
    prompt: "consent",
    state: providerId,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.json({ success: true, authUrl });
}
