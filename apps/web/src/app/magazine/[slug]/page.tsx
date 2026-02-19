import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.isPublished) {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: `${post.title} - 보령항공여행 매거진`,
    description: post.excerpt || post.title,
  };
}

export default async function MagazineDetailPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.isPublished) {
    notFound();
  }

  // 조회수 증가
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  // 관련 글 (같은 카테고리, 최신 3개)
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      id: { not: post.id },
      ...(post.category ? { category: post.category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />

      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12">
        {/* 뒤로가기 */}
        <Link
          href="/magazine"
          className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-8"
        >
          &larr; 매거진 목록
        </Link>

        {/* 카테고리 & 날짜 */}
        <div className="flex items-center gap-3 mb-4">
          {post.category && (
            <span className="text-sm font-bold text-[color:var(--brand)]">
              {post.category}
            </span>
          )}
          <span className="text-sm text-gray-400">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("ko-KR")
              : new Date(post.createdAt).toLocaleDateString("ko-KR")}
          </span>
          <span className="text-sm text-gray-400">
            조회 {post.viewCount.toLocaleString()}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        {/* 썸네일 */}
        {post.thumbnail && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-8">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 본문 */}
        <article className="prose prose-lg max-w-none mb-16">
          {post.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          ) : (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          )}
        </article>

        {/* 관련 글 */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-xl font-bold mb-6">관련 글</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/magazine/${related.slug}`}
                  className="group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2">
                    {related.thumbnail ? (
                      <img
                        src={related.thumbnail}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:underline">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
