import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { MagazinePageClient } from "@/components/magazine/MagazinePageClient";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "골프여행 매거진",
  description: "골프 여행에 유용한 팁, 코스 리뷰, 여행 가이드를 확인하세요. 보령항공여행의 골프여행 매거진.",
  alternates: {
    canonical: `${SITE_URL}/magazine`,
  },
  openGraph: {
    title: "골프여행 매거진 | 보령항공여행",
    description: "골프 여행에 유용한 팁, 코스 리뷰, 여행 가이드를 확인하세요.",
    url: `${SITE_URL}/magazine`,
    type: "website",
  },
};

// 새 글 발행 시 바로 반영되도록 캐시 비활성화
export const dynamic = "force-dynamic";

export default async function MagazinePage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  const serialized = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    thumbnail: p.thumbnail,
    category: p.category,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />

      <main>
        <div className="pt-20 pb-8 md:pt-28 md:pb-10 mx-auto max-w-[1200px] px-6">
          <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Magazine</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">골프여행 매거진</h1>
        </div>
        <div className="mx-auto max-w-[1200px] px-6 pb-16">
          <MagazinePageClient posts={serialized} />
        </div>
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
