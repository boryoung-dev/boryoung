"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, X, FileText, Eye, EyeOff } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  tags?: string[] | any;
  viewCount: number;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogPostDetail extends BlogPost {
  content: string;
  contentHtml?: string | null;
}

interface BlogPostFormData {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  isPublished: boolean;
}

export default function BlogPostsPage() {
  const { authHeaders, isLoading } = useAdminAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostDetail | null>(null);
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    thumbnail: "",
    isPublished: false
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0 && !isLoading) {
      fetchPosts();
    }
  }, [authHeaders, isLoading, filterPublished]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterPublished === "published") {
        params.append("isPublished", "true");
      } else if (filterPublished === "draft") {
        params.append("isPublished", "false");
      }

      const res = await fetch(`/api/blog-posts?${params.toString()}`, {
        headers: authHeaders as any
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("블로그 글 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      category: "",
      excerpt: "",
      content: "",
      thumbnail: "",
      isPublished: false
    });
    setThumbnailPreview("");
    setModalOpen(true);
  };

  const openEditModal = async (post: BlogPost) => {
    try {
      // 상세 정보 조회 (content 포함)
      const res = await fetch(`/api/blog-posts/${post.id}`, {
        headers: authHeaders as any
      });
      const data = await res.json();
      if (data.success) {
        const detail = data.post as BlogPostDetail;
        setEditingPost(detail);
        setFormData({
          title: detail.title,
          category: detail.category || "",
          excerpt: detail.excerpt || "",
          content: detail.content,
          thumbnail: detail.thumbnail || "",
          isPublished: detail.isPublished
        });
        setThumbnailPreview(detail.thumbnail || "");
        setModalOpen(true);
      }
    } catch (error) {
      console.error("블로그 글 상세 조회 실패:", error);
      alert("블로그 글을 불러올 수 없습니다");
    }
  };

  const handleThumbnailChange = (url: string) => {
    setFormData({ ...formData, thumbnail: url });
    setThumbnailPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 본문은 필수입니다");
      return;
    }

    try {
      const url = editingPost ? `/api/blog-posts/${editingPost.id}` : "/api/blog-posts";
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        } as any,
        body: JSON.stringify({
          ...formData,
          category: formData.category || null,
          excerpt: formData.excerpt || null,
          thumbnail: formData.thumbnail || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchPosts();
      } else {
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("블로그 글 저장 실패:", error);
      alert("블로그 글 저장 중 오류가 발생했습니다");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 블로그 글을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE",
        headers: authHeaders as any
      });

      const data = await res.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.error || "삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("블로그 글 삭제 실패:", error);
      alert("블로그 글 삭제 중 오류가 발생했습니다");
    }
  };

  const filteredPosts = posts;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">매거진 관리</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          글 작성
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterPublished("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterPublished === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilterPublished("published")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterPublished === "published"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          발행됨
        </button>
        <button
          onClick={() => setFilterPublished("draft")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterPublished === "draft"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          비공개
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>등록된 블로그 글이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  썸네일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발행 상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23ddd' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    {post.excerpt && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {post.excerpt}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {post.category ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {post.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      post.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {post.isPublished ? (
                        <>
                          <Eye className="w-3 h-3" />
                          발행됨
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          비공개
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="수정"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 생성/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                {editingPost ? "글 수정" : "글 작성"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택 안함</option>
                    <option value="준비물">준비물</option>
                    <option value="코스공략">코스공략</option>
                    <option value="여행팁">여행팁</option>
                    <option value="장비리뷰">장비리뷰</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    발췌
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="글의 요약 또는 미리보기 텍스트"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    본문 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    썸네일 URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => handleThumbnailChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {thumbnailPreview && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={thumbnailPreview}
                        alt="미리보기"
                        className="w-full h-[200px] object-cover"
                        onError={() => setThumbnailPreview("")}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                    발행
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPost ? "수정" : "작성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
