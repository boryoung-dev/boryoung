"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
}

function MagazinePostImage({ thumbnail, title }: { thumbnail: string | null; title: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-[color:var(--surface)] mb-3">
      {thumbnail && !imgError ? (
        <img
          src={thumbnail}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-blue-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-sm text-blue-400">매거진</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MagazinePageClient({ posts }: { posts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[],
    [posts]
  );

  const filtered = useMemo(
    () =>
      activeCategory
        ? posts.filter((p) => p.category === activeCategory)
        : posts,
    [posts, activeCategory]
  );

  return (
    <>
      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
                : "bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--surface-3)]"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
                  : "bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--surface-3)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 게시글 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[color:var(--muted)]">
          <p className="text-lg">아직 등록된 글이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/magazine/${post.slug}`}
              className="group"
            >
              <MagazinePostImage thumbnail={post.thumbnail} title={post.title} />
              {post.category && (
                <span className="text-xs font-bold text-[color:var(--brand)] mb-1 inline-block">
                  {post.category}
                </span>
              )}
              <h2 className="text-lg font-bold text-[color:var(--fg)] mb-1 group-hover:underline decoration-1 underline-offset-4">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-[color:var(--muted)] line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <p className="text-xs text-[color:var(--muted)] mt-2">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("ko-KR")
                  : new Date(post.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
