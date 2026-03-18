import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";

// GET: ZHIPU OAuth 시작 - 인증 URL로 리다이렉트
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const clientId = process.env.ZHIPU_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "ZHIPU OAuth가 설정되지 않았습니다. ZHIPU_CLIENT_ID 환경변수를 확인하세요." },
      { status: 500 }
    );
  }

  // providerId를 state에 포함 (콜백에서 사용)
  const providerId = request.nextUrl.searchParams.get("providerId") || "";
  const callbackUrl = `${request.nextUrl.origin}/api/ai-providers/oauth/zhipu/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "api",
    state: providerId,
  });

  const authUrl = `https://open.bigmodel.cn/oauth/authorize?${params.toString()}`;

  return NextResponse.json({ success: true, authUrl });
}
