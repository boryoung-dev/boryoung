export const WEB_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://boryoung.co.kr";

// 홈페이지 기준 상대경로(/tours, /images/...)를 관리자 도메인이 아닌 홈페이지 주소로 연다
export function resolveWebSiteUrl(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${WEB_SITE_URL}${path}`;
}
