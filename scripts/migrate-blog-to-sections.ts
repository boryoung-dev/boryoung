/**
 * 기존 블로그 글의 HTML content를 구조화된 JSON sections로 변환하는 마이그레이션 스크립트
 *
 * 사용법: npx tsx scripts/migrate-blog-to-sections.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BlogSection {
  type: "intro" | "content" | "highlight" | "tips" | "cta";
  heading?: string;
  text?: string;
  items?: string[];
  image?: string;
  imageAlt?: string;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseHtmlToSections(html: string): BlogSection[] {
  const sections: BlogSection[] = [];

  // hr 태그로 섹션 분리
  const rawSections = html.split(/<hr[^>]*>/i).map((s) => s.trim()).filter(Boolean);

  for (let i = 0; i < rawSections.length; i++) {
    const sectionHtml = rawSections[i];

    // blockquote에서 소제목 추출
    const headingMatch = sectionHtml.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    let heading = "";
    if (headingMatch) {
      heading = headingMatch[1]
        .replace(/<strong>([\s\S]*?)<\/strong>/gi, "$1")
        .replace(/<br\s*\/?>/gi, " - ")
        .replace(/<[^>]+>/g, "")
        .trim();
    }

    // 이미지 URL 추출
    const imgMatch = sectionHtml.match(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/i);
    const image = imgMatch?.[1] || undefined;
    const imageAlt = imgMatch?.[2] || undefined;

    // 본문 텍스트 추출 (blockquote, img, hr 제거 후)
    const textHtml = sectionHtml
      .replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi, "")
      .replace(/<div[^>]*>[\s\S]*?<\/div>/gi, "")
      .trim();
    const text = htmlToText(textHtml);

    if (!text && !heading) continue;

    // 첫 번째 섹션은 intro
    if (i === 0 && !heading) {
      sections.push({
        type: "intro",
        text,
      });
      continue;
    }

    // 마지막 섹션이고 "보령항공여행사" or "상담" 포함이면 cta
    if (
      i === rawSections.length - 1 &&
      (text.includes("보령항공여행사") || text.includes("상담") || text.includes("예약") || heading.includes("함께"))
    ) {
      sections.push({
        type: "cta",
        heading: heading || "보령항공여행사와 함께하세요",
        text,
      });
      continue;
    }

    // "예산" or "비용" or "총정리" 포함이면 highlight
    if (heading.includes("예산") || heading.includes("비용") || heading.includes("총정리") || heading.includes("핵심")) {
      sections.push({
        type: "highlight",
        heading,
        text,
      });
      continue;
    }

    // "일정" or "Day" or "체크" or "준비물" or "팁" 포함 + 숫자 패턴이면 tips
    if (
      (heading.includes("일정") || heading.includes("팁") || heading.includes("체크") || heading.includes("준비물")) &&
      (text.includes("Day ") || text.includes("1.") || text.includes("✅") || text.includes("✔"))
    ) {
      const items = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 5);
      if (items.length >= 2) {
        sections.push({
          type: "tips",
          heading,
          items,
        });
        continue;
      }
    }

    // 일반 content 섹션
    sections.push({
      type: "content",
      heading: heading || undefined,
      text,
      image: image?.startsWith("https://picsum") ? undefined : image,
      imageAlt: image?.startsWith("https://picsum") ? undefined : imageAlt,
    });
  }

  // 최소 검증: sections가 2개 미만이면 변환하지 않음
  if (sections.length < 2) {
    return [];
  }

  return sections;
}

async function main() {
  console.log("📝 블로그 글 마이그레이션 시작...\n");

  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`총 ${posts.length}개 발행된 글 발견\n`);

  let converted = 0;
  let skipped = 0;

  for (const post of posts) {
    // 이미 JSON sections 형식이면 건너뛰기
    try {
      const parsed = JSON.parse(post.content);
      if (parsed.sections) {
        console.log(`⏭️  [${post.title}] — 이미 구조화됨, 건너뜀`);
        skipped++;
        continue;
      }
    } catch {
      // JSON이 아니면 변환 대상
    }

    // HTML에서 contentHtml 우선 사용
    const html = post.contentHtml || post.content;
    if (!html || html.length < 100) {
      console.log(`⏭️  [${post.title}] — 본문 너무 짧음, 건너뜀`);
      skipped++;
      continue;
    }

    const sections = parseHtmlToSections(html);

    if (sections.length < 2) {
      console.log(`⚠️  [${post.title}] — 섹션 추출 실패 (${sections.length}개), 건너뜀`);
      skipped++;
      continue;
    }

    // content 필드를 JSON으로 업데이트
    const newContent = JSON.stringify({ sections });

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: newContent },
    });

    console.log(`✅ [${post.title}] — ${sections.length}개 섹션으로 변환 완료`);
    converted++;
  }

  console.log(`\n🎉 마이그레이션 완료: ${converted}개 변환, ${skipped}개 건너뜀`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("마이그레이션 실패:", e);
  prisma.$disconnect();
  process.exit(1);
});
