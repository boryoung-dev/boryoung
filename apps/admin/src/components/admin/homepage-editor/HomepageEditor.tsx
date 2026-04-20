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

/** 섹션 카테고리 그룹 (모달에 표시되는 순서) */
const SECTION_GROUPS = [
  "상품",
  "히어로 / 배너",
  "콘텐츠 / 스토리",
  "숫자 / 비교",
  "신뢰 / 소셜",
  "기능 안내",
  "갤러리 / 탐색",
] as const;

type SectionGroup = (typeof SECTION_GROUPS)[number];

interface SectionTypeMeta {
  value: string;
  label: string;
  desc: string;
  group: SectionGroup;
}

const SECTION_TYPES: SectionTypeMeta[] = [
  // 상품 (기존 3 + 신규 10)
  { value: "featured_grid", label: "추천 그리드", desc: "2행 3열 카드 그리드", group: "상품" },
  { value: "product_carousel", label: "상품 캐러셀", desc: "가로 슬라이드 상품", group: "상품" },
  { value: "product_showcase", label: "상품 쇼케이스", desc: "탭 필터 + 캐러셀", group: "상품" },
  { value: "product_masonry", label: "상품 메이슨리", desc: "자연스러운 메이슨리 그리드", group: "상품" },
  { value: "product_magazine", label: "상품 매거진", desc: "큰 메인 + 4개 서브 매거진 레이아웃", group: "상품" },
  { value: "product_spotlight", label: "상품 스포트라이트", desc: "단일 상품 풀스크린 강조", group: "상품" },
  { value: "product_split_carousel", label: "상품 좌우+캐러셀", desc: "좌측 헤딩 + 우측 가로 캐러셀", group: "상품" },
  { value: "product_compact_list", label: "상품 컴팩트 리스트", desc: "한 행 한 상품 (모바일 친화)", group: "상품" },
  { value: "product_hero_banner", label: "상품 히어로 배너", desc: "단일 상품 풀와이드 50:50 배너", group: "상품" },
  { value: "product_tabs_country", label: "상품 국가 탭", desc: "탭으로 상품을 목적지별 필터", group: "상품" },
  { value: "product_deal_grid", label: "특가 그리드", desc: "할인율 강조 그리드", group: "상품" },
  { value: "product_polaroid_carousel", label: "폴라로이드 캐러셀", desc: "폴라로이드 카드 가로 캐러셀", group: "상품" },
  { value: "product_overlap_grid", label: "오버랩 그리드", desc: "카드가 일부 겹치며 호버 시 떠오름", group: "상품" },
  // 신규 상품 섹션 (31~40) — 여행/골프 CSS 차별화
  { value: "product_passport", label: "여권 스탬프", desc: "크래프트 + 스탬프", group: "상품" },
  { value: "product_ticket", label: "항공권 티켓", desc: "티켓 절취선 스타일", group: "상품" },
  { value: "product_vintage_poster", label: "빈티지 포스터", desc: "1960s 여행 포스터", group: "상품" },
  { value: "product_green_luxury", label: "그린 럭셔리", desc: "골프 그린 + 골드", group: "상품" },
  { value: "product_sunset", label: "선셋", desc: "노을 그라디언트", group: "상품" },
  { value: "product_watercolor", label: "수채화", desc: "파스텔 블롭", group: "상품" },
  { value: "product_postcard", label: "엽서", desc: "우표 + 손글씨", group: "상품" },
  { value: "product_luxury_black", label: "럭셔리 블랙", desc: "검정 + 골드 라인", group: "상품" },
  { value: "product_cinematic", label: "시네마 파노라마", desc: "letterbox + 가로 스크롤", group: "상품" },
  { value: "product_journal", label: "여행 일지", desc: "테이프 + 크래프트", group: "상품" },

  // 히어로 / 배너
  { value: "full_bleed_hero", label: "풀스크린 히어로", desc: "풀화면 배경 + CTA", group: "히어로 / 배너" },
  { value: "gradient_banner", label: "그라디언트 배너", desc: "풀와이드 그라디언트", group: "히어로 / 배너" },
  { value: "video_hero", label: "비디오 히어로", desc: "배경 영상 + CTA", group: "히어로 / 배너" },
  { value: "banner_hero", label: "배너 히어로", desc: "배너 2x2 그리드", group: "히어로 / 배너" },

  // 콘텐츠 / 스토리
  { value: "story_split", label: "스토리 (좌우)", desc: "이미지 + 텍스트 50:50", group: "콘텐츠 / 스토리" },
  { value: "rich_text", label: "리치 텍스트", desc: "자유 본문 + 정렬", group: "콘텐츠 / 스토리" },
  { value: "quote_block", label: "인용구", desc: "큰 인용 + 작성자", group: "콘텐츠 / 스토리" },
  { value: "feature_alternating", label: "기능 좌우 교차", desc: "이미지 좌우 번갈아 배치", group: "콘텐츠 / 스토리" },
  { value: "cta_centered", label: "중앙 CTA", desc: "중앙 정렬 카피 + 버튼", group: "콘텐츠 / 스토리" },
  { value: "trust_cta", label: "신뢰 CTA", desc: "CTA 텍스트 + 전화번호", group: "콘텐츠 / 스토리" },

  // 숫자 / 비교
  { value: "stat_highlights", label: "숫자 강조", desc: "큰 숫자 통계 카드", group: "숫자 / 비교" },
  { value: "comparison_table", label: "비교 테이블", desc: "헤더 + 라벨 행 비교", group: "숫자 / 비교" },
  { value: "price_table", label: "가격 플랜", desc: "플랜 카드 비교", group: "숫자 / 비교" },
  { value: "timeline", label: "타임라인", desc: "세로 연혁/히스토리", group: "숫자 / 비교" },

  // 신뢰 / 소셜
  { value: "testimonial_slider", label: "고객 후기", desc: "별점 + 후기 슬라이더", group: "신뢰 / 소셜" },
  { value: "awards_badges", label: "수상 배지", desc: "수상/인증 배지 그리드", group: "신뢰 / 소셜" },
  { value: "logo_wall", label: "로고월", desc: "파트너/협력사 로고 그리드", group: "신뢰 / 소셜" },

  // 기능 안내
  { value: "feature_cards", label: "기능 카드", desc: "아이콘 카드 그리드", group: "기능 안내" },
  { value: "icon_callouts", label: "아이콘 콜아웃", desc: "작은 아이콘 가로 배치", group: "기능 안내" },
  { value: "process_steps", label: "프로세스 단계", desc: "번호+카드 단계 표시", group: "기능 안내" },
  { value: "faq_accordion", label: "FAQ 아코디언", desc: "질문 클릭 시 답변 펼침", group: "기능 안내" },

  // 갤러리 / 탐색
  { value: "image_gallery", label: "이미지 갤러리", desc: "메이슨리/그리드 이미지", group: "갤러리 / 탐색" },
  { value: "destinations_carousel", label: "여행지 캐러셀", desc: "원형 여행지 이미지", group: "갤러리 / 탐색" },
];

/** 그룹별로 묶인 섹션 타입 */
const SECTION_TYPES_BY_GROUP: Array<{ group: SectionGroup; items: SectionTypeMeta[] }> =
  SECTION_GROUPS.map((group) => ({
    group,
    items: SECTION_TYPES.filter((st) => st.group === group),
  })).filter((g) => g.items.length > 0);

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
  const allCurations = rawCurations.map((c) => ({
    ...c,
    ...localEdits[c.id],
  }));

  // 지구본 섹션 텍스트 저장용 특수 큐레이션 (sectionType="globe_3d")
  const globeConfig = allCurations.find((c) => c.sectionType === "globe_3d") ?? null;
  // 일반 큐레이션 목록 (globe_3d 제외 — 미리보기/편집 패널에 표시 안 함)
  const curations = allCurations.filter((c) => c.sectionType !== "globe_3d");

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
              globeTitle={globeConfig?.title ?? undefined}
              globeSubtitle={globeConfig?.subtitle ?? undefined}
            />
          </div>
        </div>

        {/* 우측: 편집 패널 (40%) */}
        <div className="flex-[4]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-4 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
            {globeSelected ? (
              <GlobeEditPanel
                globeConfig={globeConfig}
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
            <div className="overflow-y-auto max-h-[60vh] pr-1">
              {SECTION_TYPES_BY_GROUP.map((g, gIdx) => (
                <div key={g.group}>
                  <h4
                    className={`text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                      gIdx === 0 ? "mt-0" : "mt-4"
                    } mb-2`}
                  >
                    {g.group}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {g.items.map((st) => (
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
