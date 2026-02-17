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
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 게시글 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
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
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>
              {post.category && (
                <span className="text-xs font-bold text-[color:var(--brand)] mb-1 inline-block">
                  {post.category}
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:underline decoration-1 underline-offset-4">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
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
