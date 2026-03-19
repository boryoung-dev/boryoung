import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { sanitizeHtml } from "@/lib/sanitize";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import BlogPostTemplate from "@/components/magazine/BlogPostTemplate";
import type { BlogSection } from "@/components/magazine/BlogPostTemplate";

// 새 글 발행 시 바로 반영되도록 캐시 비활성화
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.isPublished) {
    return { title: "글을 찾을 수 없습니다" };
  }

  const title = post.title;
  const description = post.excerpt || post.title;
  const url = `${SITE_URL}/magazine/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: SITE_NAME,
      ...(post.publishedAt && { publishedTime: post.publishedAt.toISOString() }),
      ...(post.thumbnail && {
        images: [
          {
            url: post.thumbnail,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.thumbnail && { images: [post.thumbnail] }),
    },
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

  // JSON-LD: BlogPosting 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    url: `${SITE_URL}/magazine/${slug}`,
    ...(post.thumbnail && { image: post.thumbnail }),
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/magazine/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--fg)] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12">
        {/* 뒤로가기 */}
        <Link
          href="/magazine"
          className="inline-flex items-center text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)] mb-8"
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
          <span className="text-sm text-[color:var(--muted)]">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("ko-KR")
              : new Date(post.createdAt).toLocaleDateString("ko-KR")}
          </span>
          <span className="text-sm text-[color:var(--muted)]">
            조회 {post.viewCount.toLocaleString()}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        {/* 썸네일 */}
        {post.thumbnail && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-[color:var(--surface)] mb-8">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 본문 */}
        {(() => {
          // 구조화된 JSON 콘텐츠 감지
          try {
            const parsed = JSON.parse(post.content);
            if (parsed.sections && Array.isArray(parsed.sections)) {
              return <BlogPostTemplate sections={parsed.sections as BlogSection[]} />;
            }
          } catch {
            // JSON 파싱 실패 → 기존 방식으로 렌더링
          }
          return (
            <article className="prose prose-lg max-w-none mb-16">
              {post.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.contentHtml) }} />
              ) : (
                <div className="whitespace-pre-wrap text-[color:var(--fg)] leading-relaxed">
                  {post.content}
                </div>
              )}
            </article>
          );
        })()}

        {/* 관련 글 */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-[color:var(--border)] pt-10">
            <h2 className="text-xl font-bold mb-6">관련 글</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/magazine/${related.slug}`}
                  className="group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-[color:var(--surface)] mb-2">
                    {related.thumbnail ? (
                      <img
                        src={related.thumbnail}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[color:var(--muted)] text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[color:var(--fg)] group-hover:underline">
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
