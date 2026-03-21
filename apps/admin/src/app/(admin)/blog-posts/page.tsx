"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, FileText, Sparkles, Search } from "lucide-react";
import FilterTabs from "@/components/ui/FilterTabs";
import Select from "@/components/ui/Select";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import AIWriterModal from "@/components/blog/AIWriterModal";

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
  const { toast } = useToast();
  const { confirm } = useConfirm();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      toast("블로그 글을 불러올 수 없습니다", "error");
    }
  };

  const handleThumbnailChange = (url: string) => {
    setFormData({ ...formData, thumbnail: url });
    setThumbnailPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    const plainContent = formData.content.replace(/<[^>]*>/g, "").trim();
    if (!formData.title.trim() || !plainContent) {
      toast("제목과 본문은 필수입니다", "error");
      return;
    }

    setSubmitting(true);
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
          contentHtml: formData.content,
          category: formData.category || null,
          excerpt: formData.excerpt || null,
          thumbnail: formData.thumbnail || null
        })
      });

      const data = await res.json();
      if (data.success) {
        toast(editingPost ? "글이 수정되었습니다" : "글이 작성되었습니다", "success");
        setModalOpen(false);
        fetchPosts();
      } else {
        toast(data.error || "저장에 실패했습니다", "error");
      }
    } catch (error) {
      console.error("블로그 글 저장 실패:", error);
      toast("블로그 글 저장 중 오류가 발생했습니다", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "정말 이 블로그 글을 삭제하시겠습니까?", variant: "danger", confirmText: "삭제" }))) return;

    try {
      const res = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE",
        headers: authHeaders as any
      });

      const data = await res.json();
      if (data.success) {
        fetchPosts();
      } else {
        toast(data.error || "삭제에 실패했습니다", "error");
      }
    } catch (error) {
      console.error("블로그 글 삭제 실패:", error);
      toast("블로그 글 삭제 중 오류가 발생했습니다", "error");
    }
  };

  // 검색어 디바운스 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 검색어로 클라이언트 사이드 필터링
  const filteredPosts = useMemo(() => {
    if (!debouncedQuery.trim()) return posts;
    const q = debouncedQuery.trim().toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q))
    );
  }, [posts, debouncedQuery]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">매거진 관리</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold text-sm transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> AI 글 작성
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 글 작성
          </button>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="mb-6">
        <FilterTabs
          tabs={[
            { key: "all", label: "전체", count: posts.length },
            { key: "published", label: "발행됨", count: posts.filter((p) => p.isPublished).length },
            { key: "draft", label: "비공개", count: posts.filter((p) => !p.isPublished).length },
          ]}
          activeTab={filterPublished}
          onTabChange={(key) => setFilterPublished(key as "all" | "published" | "draft")}
        />
      </div>

      {/* 검색바 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 내용으로 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">등록된 블로그 글이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">썸네일</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">제목</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">카테고리</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">발행 상태</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">생성일</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
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
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    {post.excerpt && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">{post.excerpt}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {post.category ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {post.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      post.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {post.isPublished ? "발행됨" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* AI 글 작성 모달 */}
      <AIWriterModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSendToEditor={(data) => {
          setEditingPost(null);
          // 구조화된 섹션이 있으면 JSON으로 content 저장
          const contentValue = data.sections
            ? JSON.stringify({ sections: data.sections })
            : data.content;
          setFormData({
            title: data.title,
            category: data.category || "",
            excerpt: data.excerpt || "",
            content: contentValue,
            thumbnail: data.thumbnail || "",
            isPublished: false,
          });
          setThumbnailPreview(data.thumbnail || "");
          setAiModalOpen(false);
          setModalOpen(true);
        }}
      />

      {/* 생성/수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPost ? "글 수정" : "글 작성"}
        size="lg"
        footer={
          <>
            <ModalCancelButton onClick={() => setModalOpen(false)} />
            <ModalConfirmButton
              type="submit"
              disabled={submitting}
              onClick={() => {
                document.getElementById("blog-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
              }}
            >
              {submitting ? "저장 중..." : editingPost ? "수정" : "작성"}
            </ModalConfirmButton>
          </>
        }
      >
        <form id="blog-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <Select
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
              options={[
                { value: "", label: "선택 안함" },
                { value: "준비물", label: "준비물" },
                { value: "코스공략", label: "코스공략" },
                { value: "여행팁", label: "여행팁" },
                { value: "장비리뷰", label: "장비리뷰" },
                { value: "기타", label: "기타" },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">발췌</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm resize-none"
              placeholder="글의 요약 또는 미리보기 텍스트"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">본문 *</label>
            <TiptapEditor
              content={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
              placeholder="블로그 본문을 입력하세요..."
              minHeight="300px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 URL</label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => handleThumbnailChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
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

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">발행</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPublished ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                formData.isPublished ? "translate-x-[22px]" : "translate-x-[2px]"
              }`} />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
