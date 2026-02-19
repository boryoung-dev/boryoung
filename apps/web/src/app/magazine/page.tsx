import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { MagazinePageClient } from "@/components/magazine/MagazinePageClient";

export const metadata = {
  title: "매거진 - 보령항공여행",
  description: "골프 여행에 유용한 팁과 가이드를 확인하세요.",
};

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

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">매거진</h1>
        <p className="text-gray-500 mb-8">골프 여행에 유용한 팁과 가이드</p>

        <MagazinePageClient posts={serialized} />
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
