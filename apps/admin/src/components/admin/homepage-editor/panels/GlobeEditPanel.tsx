"use client";

import { useState, useRef } from "react";
import { X, GripVertical, Plus, Minus } from "lucide-react";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { useToast } from "@/components/ui/Toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sortOrder: number;
  globeSortOrder: number;
  showOnGlobe: boolean;
  isActive: boolean;
  parentId?: string | null;
}

/** 드래그 가능한 행 래퍼 */
function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (args: { dragHandleProps: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

interface GlobeEditPanelProps {
  onClose: () => void;
}

/** 3D 지구본 노출 국가 선택 패널 */
export function GlobeEditPanel({ onClose }: GlobeEditPanelProps) {
  const { toast } = useToast();

  // 로컬 순서 변경 반영
  const [localGlobeList, setLocalGlobeList] = useState<Category[] | null>(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // 전체 최상위 카테고리 조회
  const { data, isLoading, refetch } = useApiQuery<{
    success: boolean;
    categories: any[];
  }>(["categories", "globe-edit"], "/api/categories");

  const allTop: Category[] = (data?.success ? data.categories ?? [] : [])
    .filter((c: any) => !c.parentId)
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      emoji: c.emoji ?? null,
      latitude: c.latitude ?? null,
      longitude: c.longitude ?? null,
      sortOrder: c.sortOrder ?? 0,
      globeSortOrder: c.globeSortOrder ?? 0,
      showOnGlobe: c.showOnGlobe ?? false,
      isActive: c.isActive ?? true,
      parentId: c.parentId ?? null,
    }));

  // showOnGlobe = true 목록 (globeSortOrder 기준 정렬)
  const serverGlobeList = allTop
    .filter((c) => c.showOnGlobe)
    .sort((a, b) => a.globeSortOrder - b.globeSortOrder);

  // 로컬 우선
  const globeList: Category[] = localGlobeList ?? serverGlobeList;

  // 서버 데이터 바뀌면 로컬 초기화 (최초 로드 시)
  const prevKeyRef = useRef("");
  const serverKey = serverGlobeList.map((c) => c.id).join(",");
  if (prevKeyRef.current !== serverKey && localGlobeList === null) {
    prevKeyRef.current = serverKey;
  }

  // showOnGlobe = false 목록 (sortOrder 기준)
  const hiddenList = allTop
    .filter((c) => !c.showOnGlobe)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // PUT 뮤테이션
  const updateMutation = useApiMutation<any, { id: string; body: any }>(
    async ({ id, body }, token) =>
      fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }),
    { invalidateKeys: [["categories"]] }
  );

  // 드래그 끝 → globeSortOrder 업데이트
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = globeList.findIndex((c) => c.id === active.id);
    const newIdx = globeList.findIndex((c) => c.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(globeList, oldIdx, newIdx).map((c, i) => ({
      ...c,
      globeSortOrder: i,
    }));
    setLocalGlobeList(reordered);
    reordered.forEach((c) => {
      const original = globeList.find((o) => o.id === c.id);
      if (original && original.globeSortOrder !== c.globeSortOrder) {
        updateMutation.mutate(
          { id: c.id, body: { globeSortOrder: c.globeSortOrder } },
          {
            onSuccess: (res) => {
              if (!res.success) toast("순서 저장 실패", "error");
            },
          }
        );
      }
    });
    toast("순서가 변경되었습니다", "success");
  };

  // 제거: showOnGlobe = false
  const handleRemove = (country: Category) => {
    // 로컬 즉시 반영
    setLocalGlobeList((prev) => {
      const base = prev ?? serverGlobeList;
      return base.filter((c) => c.id !== country.id);
    });
    updateMutation.mutate(
      { id: country.id, body: { showOnGlobe: false } },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast(`${country.name}을(를) 지구본에서 제거했습니다`, "success");
            setLocalGlobeList(null);
            refetch();
          } else {
            toast(res.error || "저장 실패", "error");
          }
        },
        onError: () => toast("저장 중 오류가 발생했습니다", "error"),
      }
    );
  };

  // 추가: showOnGlobe = true, globeSortOrder = max + 1
  const handleAdd = (country: Category) => {
    const maxOrder =
      globeList.length > 0
        ? Math.max(...globeList.map((c) => c.globeSortOrder)) + 1
        : 0;
    updateMutation.mutate(
      { id: country.id, body: { showOnGlobe: true, globeSortOrder: maxOrder } },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast(`${country.name}을(를) 지구본에 추가했습니다`, "success");
            setLocalGlobeList(null);
            refetch();
          } else {
            toast(res.error || "저장 실패", "error");
          }
        },
        onError: () => toast("저장 중 오류가 발생했습니다", "error"),
      }
    );
  };

  const missingInfo = (c: Category) => !c.emoji || c.latitude == null || c.longitude == null;

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div>
          <h3 className="text-base font-bold text-gray-900">지구본 편집</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            카테고리 자체 편집은 카테고리 탭에서 / 여기서는 지구본에 노출할 국가와 순서만 관리합니다
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            로딩 중...
          </div>
        ) : (
          <>
            {/* 지구본에 표시 중 */}
            <section>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                지구본에 표시 중
                <span className="ml-1.5 text-gray-400 font-normal">({globeList.length}개)</span>
              </p>

              {globeList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                  지구본에 표시할 국가를 아래에서 추가하세요
                </div>
              ) : (
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={globeList.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1.5">
                      {globeList.map((country) => (
                        <SortableRow key={country.id} id={country.id}>
                          {({ dragHandleProps }) => (
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                              <button
                                type="button"
                                {...dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0"
                                title="드래그하여 순서 변경"
                              >
                                <GripVertical className="w-4 h-4" />
                              </button>
                              <span className="text-base flex-shrink-0 w-6 text-center">
                                {country.emoji || "🌍"}
                              </span>
                              <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                                {country.name}
                              </span>
                              {missingInfo(country) && (
                                <span
                                  className="flex-shrink-0 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5"
                                  title="이모지 또는 좌표가 설정되지 않았습니다"
                                >
                                  ⚠ 카테고리에서 좌표/이모지 설정 필요 → 카테고리 탭에서 편집
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemove(country)}
                                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                                제거
                              </button>
                            </div>
                          )}
                        </SortableRow>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </section>

            {/* 추가 가능한 국가 */}
            <section>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                추가 가능한 국가
                <span className="ml-1.5 text-gray-400 font-normal">({hiddenList.length}개)</span>
              </p>

              {hiddenList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                  모든 국가가 이미 지구본에 표시 중입니다
                </div>
              ) : (
                <div className="space-y-1.5">
                  {hiddenList.map((country) => (
                    <div
                      key={country.id}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <span className="text-base flex-shrink-0 w-6 text-center">
                        {country.emoji || "🌍"}
                      </span>
                      <span className="flex-1 text-sm text-gray-700 truncate">
                        {country.name}
                      </span>
                      {missingInfo(country) && (
                        <span
                          className="flex-shrink-0 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5"
                          title="이모지 또는 좌표가 설정되지 않았습니다"
                        >
                          ⚠ 카테고리에서 좌표/이모지 설정 필요
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAdd(country)}
                        disabled={updateMutation.isPending}
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                        추가
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
