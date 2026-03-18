import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

// GET: Google OAuth 콜백 처리
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const providerId = request.nextUrl.searchParams.get("state") || "";
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    // OAuth 거부 시 설정 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL(`/ai-settings?error=${encodeURIComponent("Google 인증이 취소되었습니다")}`, request.nextUrl.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/ai-settings?error=${encodeURIComponent("인증 코드가 없습니다")}`, request.nextUrl.origin)
    );
  }

  // DB에서 해당 제공자의 OAuth Client ID/Secret 조회 (환경변수 폴백)
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (providerId) {
    const provider = await prisma.aIProvider.findUnique({ where: { id: providerId } });
    if (provider?.oauthClientId) clientId = provider.oauthClientId;
    if (provider?.oauthClientSecret) clientSecret = provider.oauthClientSecret;
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`/ai-settings?error=${encodeURIComponent("Google OAuth Client ID/Secret이 설정되지 않았습니다. 제공자 설정에서 입력하세요.")}`, request.nextUrl.origin)
    );
  }

  try {
    const callbackUrl = `${request.nextUrl.origin}/api/ai-providers/oauth/google/callback`;

    // Authorization code를 토큰으로 교환
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Google OAuth 토큰 교환 실패:", tokenData);
      return NextResponse.redirect(
        new URL(`/ai-settings?error=${encodeURIComponent("토큰 교환에 실패했습니다")}`, request.nextUrl.origin)
      );
    }

    // providerId가 있으면 해당 제공자 업데이트
    if (providerId) {
      await prisma.aIProvider.update({
        where: { id: providerId },
        data: {
          authType: "oauth",
          oauthData: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + tokenData.expires_in * 1000,
            token_type: tokenData.token_type,
          },
        },
      });
    }

    return NextResponse.redirect(
      new URL(`/ai-settings?success=${encodeURIComponent("Google 계정이 연결되었습니다")}`, request.nextUrl.origin)
    );
  } catch (err) {
    console.error("Google OAuth 콜백 처리 오류:", err);
    return NextResponse.redirect(
      new URL(`/ai-settings?error=${encodeURIComponent("OAuth 처리 중 오류가 발생했습니다")}`, request.nextUrl.origin)
    );
  }
}
