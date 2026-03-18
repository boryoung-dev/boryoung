import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// GET: ZHIPU OAuth 시작 - 인증 URL로 리다이렉트
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // providerId를 state에 포함 (콜백에서 사용)
  const providerId = request.nextUrl.searchParams.get("providerId") || "";

  // DB에서 해당 제공자의 OAuth Client ID 조회 (환경변수 폴백)
  let clientId = process.env.ZHIPU_CLIENT_ID;
  if (providerId) {
    const provider = await prisma.aIProvider.findUnique({ where: { id: providerId } });
    if (provider?.oauthClientId) {
      clientId = provider.oauthClientId;
    }
  }

  if (!clientId) {
    return NextResponse.json(
      { error: "ZHIPU OAuth Client ID가 설정되지 않았습니다. 제공자 설정에서 Client ID를 입력하세요." },
      { status: 500 }
    );
  }

  const callbackUrl = `${request.nextUrl.origin}/api/ai-providers/oauth/zhipu/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "api",
    state: providerId,
  });

  const authUrl = `https://z.ai/oauth/authorize?${params.toString()}`;

  return NextResponse.json({ success: true, authUrl });
}
