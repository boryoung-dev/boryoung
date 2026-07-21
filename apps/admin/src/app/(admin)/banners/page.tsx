"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import {
  GripVertical,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Modal, {
  ModalCancelButton,
  ModalConfirmButton,
} from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

type BannerPlacement = "main" | "tour";

interface Banner {
  id: string;
  placement: BannerPlacement;
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

interface BannerMutationResponse {
  success: boolean;
  banner?: Banner;
  error?: string;
}

const emptyForm: BannerFormData = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  ctaText: "",
  sortOrder: 0,
  isActive: true,
};

const WEB_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://boryoung.co.kr";

function resolveBannerImageUrl(imageUrl: string) {
  if (!imageUrl.startsWith("/")) return imageUrl;
  return `${WEB_SITE_URL}${imageUrl}`;
}

function SortableBannerCard({
  banner,
  onEdit,
  onDelete,
}: {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "z-10 opacity-70 ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="relative h-[200px] bg-gray-100">
        <img
          src={resolveBannerImageUrl(banner.imageUrl)}
          alt={banner.title}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 inline-flex h-10 w-10 cursor-grab items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm transition hover:bg-white active:cursor-grabbing"
          aria-label="배너 순서 드래그"
          title="드래그해서 순서 변경"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="absolute right-2 top-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              banner.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {banner.isActive ? "노출 중" : "내림"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate text-lg font-bold">{banner.title}</h3>
            {banner.subtitle && (
              <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                {banner.subtitle}
              </p>
            )}
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {banner.sortOrder + 1}번째
          </span>
        </div>

        {banner.linkUrl && (
          <p className="mb-2 truncate text-xs text-gray-500">
            링크:{" "}
            <a
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {banner.linkUrl}
            </a>
          </p>
        )}

        {banner.ctaText && (
          <p className="mb-3 text-xs text-gray-500">
            버튼 문구:{" "}
            <span className="font-medium text-gray-800">{banner.ctaText}</span>
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(banner)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <Pencil className="h-4 w-4" />
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete(banner.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const { token, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [placement, setPlacement] = useState<BannerPlacement>("main");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [orderedBanners, setOrderedBanners] = useState<Banner[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data, isLoading: loading } = useApiQuery<{
    success: boolean;
    banners: Banner[];
  }>(["banners", placement], `/api/banners?placement=${placement}`);
  const banners = useMemo(() => data?.banners ?? [], [data?.banners]);

  useEffect(() => {
    setOrderedBanners(
      [...banners].sort((a, b) => a.sortOrder - b.sortOrder),
    );
  }, [banners]);

  const saveMutation = useApiMutation<
    BannerMutationResponse,
    { id?: string; body: Record<string, unknown> }
  >(
    async ({ id, body }, token) => {
      const url = id ? `/api/banners/${id}` : "/api/banners";
      const method = id ? "PUT" : "POST";
      return fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    },
    { invalidateKeys: [["banners", placement]] },
  );

  const deleteMutation = useApiMutation<BannerMutationResponse, string>(
    async (id, token) =>
      fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    { invalidateKeys: [["banners", placement]] },
  );

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({ ...emptyForm, sortOrder: orderedBanners.length });
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
      isActive: banner.isActive,
    });
    setImagePreview(banner.imageUrl);
    setModalOpen(true);
  };

  const setImageUrl = (url: string) => {
    setFormData((current) => ({ ...current, imageUrl: url }));
    setImagePreview(url);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "banners");

    setUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.error || "이미지 업로드에 실패했습니다.", "error");
        return;
      }

      setImageUrl(result.url);
      toast("이미지를 업로드했습니다.", "success");
    } catch {
      toast("이미지 업로드 중 오류가 발생했습니다.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast("제목과 이미지가 필요합니다.", "error");
      return;
    }

    const body = {
      ...formData,
      placement,
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
            toast(editingBanner ? "배너를 수정했습니다." : "배너를 추가했습니다.");
          } else {
            toast(data.error || "저장에 실패했습니다.", "error");
          }
        },
        onError: () => toast("배너 저장 중 오류가 발생했습니다.", "error"),
      },
    );
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      message: "이 배너를 삭제하시겠습니까?",
      variant: "danger",
      confirmText: "삭제",
    });
    if (!ok) return;

    deleteMutation.mutate(id, {
      onSuccess: (data) => {
        if (data.success) {
          toast("배너를 삭제했습니다.");
        } else {
          toast(data.error || "삭제에 실패했습니다.", "error");
        }
      },
      onError: () => toast("배너 삭제 중 오류가 발생했습니다.", "error"),
    });
  };

  const persistOrder = async (nextBanners: Banner[]) => {
    if (!token) return;

    setReordering(true);
    try {
      const responses = await Promise.all(
        nextBanners.map((banner, index) =>
          fetch(`/api/banners/${banner.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sortOrder: index }),
          }),
        ),
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error("failed");
      }

      await queryClient.invalidateQueries({ queryKey: ["banners", placement] });
      toast("배너 순서를 저장했습니다.", "success");
    } catch {
      toast("배너 순서 저장에 실패했습니다.", "error");
      setOrderedBanners([...banners].sort((a, b) => a.sortOrder - b.sortOrder));
    } finally {
      setReordering(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedBanners.findIndex(
      (banner) => banner.id === active.id,
    );
    const newIndex = orderedBanners.findIndex(
      (banner) => banner.id === over.id,
    );
    if (oldIndex < 0 || newIndex < 0) return;

    const nextBanners = arrayMove(orderedBanners, oldIndex, newIndex).map(
      (banner, index) => ({ ...banner, sortOrder: index }),
    );

    setOrderedBanners(nextBanners);
    void persistOrder(nextBanners);
  };

  const isMainPlacement = placement === "main";

  if (isLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isMainPlacement
              ? "메인 화면의 대형 캐러셀 배너를 관리합니다."
              : "여행상품 목록 페이지 상단의 대표 배너를 관리합니다."}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {isMainPlacement ? "메인 배너 추가" : "여행상품 배너 추가"}
        </button>
      </div>

      <div className="mb-6 inline-flex rounded-xl bg-gray-100 p-1">
        {([
          { value: "main" as const, label: "메인 페이지" },
          { value: "tour" as const, label: "여행상품 페이지" },
        ]).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setPlacement(item.value);
              setModalOpen(false);
              setEditingBanner(null);
            }}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              placement === item.value
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {orderedBanners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            등록된 {isMainPlacement ? "메인" : "여행상품"} 배너가 없습니다.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>
              {isMainPlacement
                ? "카드 왼쪽 위 핸들을 잡고 드래그하면 순서가 자동 저장됩니다."
                : "활성 배너 중 첫 번째 배너가 여행상품 페이지 상단에 표시됩니다. 드래그로 우선순위를 변경할 수 있습니다."}
            </span>
            {reordering && <span className="font-medium">저장 중...</span>}
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedBanners.map((banner) => banner.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {orderedBanners.map((banner) => (
                  <SortableBannerCard
                    key={banner.id}
                    banner={banner}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${isMainPlacement ? "메인" : "여행상품"} 배너 ${
          editingBanner ? "수정" : "추가"
        }`}
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setModalOpen(false)} />
            <ModalConfirmButton
              type="submit"
              onClick={() => {
                document
                  .getElementById("banner-form")
                  ?.dispatchEvent(
                    new Event("submit", { bubbles: true, cancelable: true }),
                  );
              }}
            >
              {editingBanner ? "수정" : "추가"}
            </ModalConfirmButton>
          </>
        }
      >
        <form id="banner-form" onSubmit={handleSubmit} className="space-y-4">
          {!isMainPlacement && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              제목, 부제목, 이미지가 여행상품 페이지 상단 배너에 표시됩니다.
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              부제목
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(event) =>
                setFormData({ ...formData, subtitle: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              이미지 *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
                required
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "업로드 중" : "업로드"}
              </button>
            </div>
            {imagePreview && (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={resolveBannerImageUrl(imagePreview)}
                  alt="배너 미리보기"
                  className="h-[200px] w-full object-cover"
                  onError={() => setImagePreview("")}
                />
              </div>
            )}
          </div>

          {isMainPlacement && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  링크 URL
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(event) =>
                    setFormData({ ...formData, linkUrl: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/tours 또는 https://example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  버튼 문구
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(event) =>
                    setFormData({ ...formData, ctaText: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="자세히 보기"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">노출 상태</span>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  formData.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
