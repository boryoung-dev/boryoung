"use client";

import { useState, useCallback } from "react";
import { Plus, Monitor, Pencil } from "lucide-react";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import Modal, {
  ModalCancelButton,
  ModalConfirmButton,
} from "@/components/ui/Modal";
import { SectionList } from "./SectionList";
import { SectionEditPanel } from "./panels/SectionEditPanel";
import { GlobeEditPanel } from "./panels/GlobeEditPanel";

/** 큐레이션 타입 정의 (에디터 전역 공유) */
export interface Curation {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sectionType?: string | null;
  displayConfig?: any;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
  products?: Array<{
    id?: string;
    title: string;
    imageUrl?: string;
    slug?: string;
    destination?: string;
    duration?: string;
    basePrice?: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    badge?: string;
  }>;
}

const SECTION_TYPES = [
  {
    value: "featured_grid",
    label: "추천 그리드",
    desc: "2행 3열 카드 그리드",
  },
  {
    value: "product_carousel",
    label: "상품 캐러셀",
    desc: "가로 슬라이드 상품",
  },
  {
    value: "product_showcase",
    label: "상품 쇼케이스",
    desc: "탭 필터 + 캐러셀",
  },
  {
    value: "destinations_carousel",
    label: "여행지 캐러셀",
    desc: "원형 여행지 이미지",
  },
  { value: "banner_hero", label: "배너 히어로", desc: "배너 2x2 그리드" },
  { value: "trust_cta", label: "신뢰 CTA", desc: "CTA 텍스트 + 전화번호" },
];

/** 홈페이지 비주얼 에디터 메인 컴포넌트 */
export default function HomepageEditor() {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globeSelected, setGlobeSelected] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState("");
  const [newTitle, setNewTitle] = useState("");

  // 로컬 편집 상태 (미리보기 실시간 반영)
  const [localEdits, setLocalEdits] = useState<
    Record<string, Partial<Curation>>
  >({});

  // 데이터 로딩
  const { data, isLoading } = useApiQuery<{
    success: boolean;
    curations: Curation[];
  }>(["curations"], "/api/curations");

  const rawCurations = data?.curations ?? [];

  // 로컬 편집이 적용된 큐레이션 목록
  const curations = rawCurations.map((c) => ({
    ...c,
    ...localEdits[c.id],
  }));

  const selectedCuration = curations.find((c) => c.id === selectedId) || null;

  // 섹션 추가
  const createMutation = useApiMutation<any, any>(
    async (body, token) =>
      fetch("/api/curations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }),
    { invalidateKeys: [["curations"]] }
  );

  // 섹션 삭제
  const deleteMutation = useApiMutation<any, string>(
    async (id, token) =>
      fetch(`/api/curations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    { invalidateKeys: [["curations"]] }
  );

  // 순서 변경
  const reorderMutation = useApiMutation<any, { id: string; sortOrder: number }>(
    async ({ id, sortOrder }, token) =>
      fetch(`/api/curations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sortOrder }),
      }),
    { invalidateKeys: [["curations"]] }
  );

  const handleSelect = useCallback((curation: Curation) => {
    setGlobeSelected(false);
    setSelectedId(curation.id);
  }, []);

  const handleGlobeSelect = useCallback(() => {
    setSelectedId(null);
    setGlobeSelected(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const ok = await confirm({
        message: "이 섹션을 삭제하시겠습니까? 복구할 수 없습니다.",
        variant: "danger",
        confirmText: "삭제",
      });
      if (!ok) return;
      if (selectedId === id) setSelectedId(null);
      deleteMutation.mutate(id, {
        onSuccess: (data) => {
          if (data.success) toast("섹션이 삭제되었습니다", "success");
        },
      });
    },
    [selectedId, confirm, deleteMutation, toast]
  );

  const handleMoveUp = useCallback(
    (id: string) => {
      const idx = curations.findIndex((c) => c.id === id);
      if (idx <= 0) return;
      const targetOrder = curations[idx - 1].sortOrder;
      const currentOrder = curations[idx].sortOrder;
      // 두 항목의 sortOrder를 교환
      reorderMutation.mutate({ id: curations[idx].id, sortOrder: targetOrder });
      reorderMutation.mutate({
        id: curations[idx - 1].id,
        sortOrder: currentOrder,
      });
    },
    [curations, reorderMutation]
  );

  const handleMoveDown = useCallback(
    (id: string) => {
      const idx = curations.findIndex((c) => c.id === id);
      if (idx < 0 || idx >= curations.length - 1) return;
      const targetOrder = curations[idx + 1].sortOrder;
      const currentOrder = curations[idx].sortOrder;
      reorderMutation.mutate({ id: curations[idx].id, sortOrder: targetOrder });
      reorderMutation.mutate({
        id: curations[idx + 1].id,
        sortOrder: currentOrder,
      });
    },
    [curations, reorderMutation]
  );

  const handleLocalUpdate = useCallback(
    (updated: Partial<Curation>) => {
      if (!selectedId) return;
      setLocalEdits((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], ...updated },
      }));
    },
    [selectedId]
  );

  const handleSaved = useCallback(() => {
    if (selectedId) {
      setLocalEdits((prev) => {
        const next = { ...prev };
        delete next[selectedId];
        return next;
      });
    }
  }, [selectedId]);

  const handleAddSection = () => {
    if (!newSectionType) {
      toast("섹션 타입을 선택해주세요", "error");
      return;
    }
    if (!newTitle.trim()) {
      toast("제목을 입력해주세요", "error");
      return;
    }
    const maxOrder =
      curations.length > 0
        ? Math.max(...curations.map((c) => c.sortOrder))
        : -1;
    createMutation.mutate(
      {
        title: newTitle,
        sectionType: newSectionType,
        sortOrder: maxOrder + 1,
        isActive: true,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setAddModalOpen(false);
            setNewSectionType("");
            setNewTitle("");
            toast("섹션이 추가되었습니다", "success");
          } else {
            toast(data.error || "추가 실패", "error");
          }
        },
        onError: () => toast("섹션 추가 중 오류가 발생했습니다", "error"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="w-6 h-6" />
            홈페이지 에디터
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            메인페이지 섹션을 시각적으로 편집합니다
          </p>
        </div>
        <button
          onClick={() => {
            setNewSectionType("");
            setNewTitle("");
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> 섹션 추가
        </button>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="flex gap-6" style={{ minHeight: "calc(100vh - 180px)" }}>
        {/* 좌측: 미리보기 (60%) */}
        <div className="flex-[6] overflow-y-auto pr-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                <Monitor className="w-3 h-3" />
                홈페이지 미리보기
              </span>
            </div>
            <SectionList
              curations={curations}
              selectedId={selectedId}
              globeSelected={globeSelected}
              onSelect={handleSelect}
              onGlobeSelect={handleGlobeSelect}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </div>
        </div>

        {/* 우측: 편집 패널 (40%) */}
        <div className="flex-[4]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-4 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
            {globeSelected ? (
              <GlobeEditPanel
                onClose={() => setGlobeSelected(false)}
              />
            ) : selectedCuration ? (
              <SectionEditPanel
                key={selectedCuration.id}
                curation={selectedCuration}
                onClose={() => {
                  setSelectedId(null);
                  handleSaved();
                }}
                onLocalUpdate={handleLocalUpdate}
                onSaved={handleSaved}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <Pencil className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">섹션을 선택하세요</p>
                <p className="text-xs mt-1">
                  좌측 미리보기에서 섹션을 클릭하면 여기서 편집할 수 있습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 섹션 추가 모달 */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="섹션 추가"
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setAddModalOpen(false)} />
            <ModalConfirmButton onClick={handleAddSection}>
              추가
            </ModalConfirmButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              섹션 타입 *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SECTION_TYPES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setNewSectionType(st.value)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    newSectionType === st.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {st.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              placeholder="섹션 제목을 입력하세요"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
