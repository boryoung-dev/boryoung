"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  ctaText?: string | null;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  ctaText: string;
  sortOrder: number;
  isActive: boolean;
}

export default function BannersPage() {
  const { token, isLoading, authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    ctaText: "",
    sortOrder: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const { data, isLoading: loading } = useApiQuery<{ success: boolean; banners: Banner[] }>(
    ["banners"],
    "/api/banners"
  );
  const banners = data?.banners ?? [];

  const saveMutation = useApiMutation<any, { id?: string; body: any }>(
    async ({ id, body }, token) => {
      const url = id ? `/api/banners/${id}` : "/api/banners";
      const method = id ? "PUT" : "POST";
      return fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    },
    { invalidateKeys: [["banners"]] }
  );

  const deleteMutation = useApiMutation<any, string>(
    async (id, token) =>
      fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    { invalidateKeys: [["banners"]] }
  );

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      ctaText: "",
      sortOrder: banners.length, // 새 배너는 맨 뒤 순서로 자동 지정
      isActive: true
    });
    setImagePreview("");
    setModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      ctaText: banner.ctaText || "",
      sortOrder: banner.sortOrder,
      isActive: banner.isActive
    });
    setImagePreview(banner.imageUrl);
    setModalOpen(true);
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  // 파일 첨부 업로드 → Supabase Storage 에 올리고 URL 자동 반영
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "banners");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: authHeaders as any,
        body: uploadData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        setImagePreview(data.url);
      } else {
        toast(data.error || "이미지 업로드에 실패했습니다", "error");
      }
    } catch {
      toast("이미지 업로드 중 오류가 발생했습니다", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // 위/아래 화살표로 순서 변경 → 이웃 배너와 자리 바꾸고 sortOrder 정규화 후 저장
  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    setReorderingId(temp.id);
    try {
      await Promise.all(
        reordered
          .map((b, i) =>
            b.sortOrder === i
              ? null
              : fetch(`/api/banners/${b.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", ...authHeaders } as any,
                  body: JSON.stringify({ sortOrder: i }),
                })
          )
          .filter(Boolean) as Promise<Response>[]
      );
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    } catch {
      toast("순서 변경 중 오류가 발생했습니다", "error");
    } finally {
      setReorderingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast("제목과 이미지는 필수입니다", "error");
      return;
    }

    const body = {
      ...formData,
      subtitle: formData.subtitle || null,
      linkUrl: formData.linkUrl || null,
      ctaText: formData.ctaText || null,
    };

    saveMutation.mutate(
      { id: editingBanner?.id, body },
      {
        onSuccess: (data) => {
          if (data.success) {
            setModalOpen(false);
          } else {
            toast(data.error || "저장에 실패했습니다", "error");
          }
        },
        onError: () => toast("배너 저장 중 오류가 발생했습니다", "error"),
      }
    );
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "정말 이 배너를 삭제하시겠습니까?", variant: "danger", confirmText: "삭제" }))) return;

    deleteMutation.mutate(id, {
      onSuccess: (data) => {
        if (!data.success) toast(data.error || "삭제에 실패했습니다", "error");
      },
      onError: () => toast("배너 삭제 중 오류가 발생했습니다", "error"),
    });
  };

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
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-900">투어목록 상단배너</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 배너 추가
        </button>
      </div>

      {/* 노출 위치 안내 — 운영자 혼동 방지 */}
      <div className="mb-6 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <ImageIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          여기서 등록한 배너는 웹사이트 <b>여행상품(투어) 목록 페이지 상단</b>에 노출됩니다.
          여러 개를 등록하면 <b>순서 1번(맨 위) 배너 1개</b>만 표시되니, 노출할 배너를 카드의 ▲▼ 버튼으로 1번에 올려주세요.
          (홈 화면 배너는 <b>홈페이지 에디터</b>에서 관리합니다.)
        </p>
      </div>

      {banners.length === 0 ? (
        <div className="py-16 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">등록된 배너가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner, idx) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-[200px] bg-gray-100">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ddd' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3E이미지 로드 실패%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    banner.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {banner.isActive ? "활성" : "비활성"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                    )}
                  </div>
                  <div className="ml-2 flex items-center gap-1 flex-shrink-0">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {idx + 1}번
                    </span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0 || reorderingId !== null}
                        title="위로"
                        className="p-0.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === banners.length - 1 || reorderingId !== null}
                        title="아래로"
                        className="p-0.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {banner.linkUrl && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">링크: </span>
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {banner.linkUrl}
                    </a>
                  </div>
                )}

                {banner.ctaText && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">CTA: </span>
                    <span className="text-xs font-medium">{banner.ctaText}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 생성/수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? "배너 수정" : "배너 추가"}
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setModalOpen(false)} />
            <ModalConfirmButton
              type="submit"
              onClick={() => {
                document.getElementById("banner-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
              }}
            >
              {editingBanner ? "수정" : "추가"}
            </ModalConfirmButton>
          </>
        }
      >
        <form id="banner-form" onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">부제목</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이미지 *</label>

            {/* 파일 첨부 업로드 */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="banner-image-upload"
            />
            <label
              htmlFor="banner-image-upload"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-gray-500"
            >
              {uploading ? (
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" /> 업로드 중...
                </span>
              ) : (
                <>
                  <Upload className="w-7 h-7" />
                  <span className="text-sm">이미지를 선택하거나 드래그하세요</span>
                  <span className="text-xs text-gray-400">JPG, PNG, WebP, GIF (최대 10MB)</span>
                </>
              )}
            </label>

            {imagePreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full h-[200px] object-cover"
                  onError={() => setImagePreview("")}
                />
              </div>
            )}

            {/* URL 직접 입력 (선택) */}
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer select-none hover:text-gray-600">
                또는 이미지 URL 직접 입력
              </summary>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </details>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">링크 URL</label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA 텍스트</label>
            <input
              type="text"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="자세히 보기"
            />
          </div>

          <p className="text-xs text-gray-400">
            노출 순서는 목록에서 카드의 위/아래 화살표로 변경할 수 있습니다.
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">활성화</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                formData.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
              }`} />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
