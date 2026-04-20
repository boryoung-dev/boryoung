"use client";

import { useState } from "react";
import { X, GripVertical, Upload, Plus } from "lucide-react";
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
import { useAdminAuth } from "@/hooks/useAdminAuth";

const genUid = () => `i-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

// ============================================================================
// 공용 입력 헬퍼
// ============================================================================

function TextInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2 py-1.5 border border-gray-200 rounded text-xs ${className || ""}`}
    />
  );
}

function ImageUploadButton({
  onUploaded,
  folder = "homepage",
}: {
  onUploaded: (url: string) => void;
  folder?: string;
}) {
  const { token } = useAdminAuth();
  return (
    <label className="inline-flex items-center px-2 py-1.5 border border-gray-200 rounded text-xs cursor-pointer hover:bg-gray-50">
      <Upload className="w-3.5 h-3.5 mr-1" />
      업로드
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const fd = new FormData();
          fd.append("file", file);
          fd.append("folder", folder);
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            });
            const data = await res.json();
            if (data.success) onUploaded(data.url);
          } catch {}
        }}
      />
    </label>
  );
}

// ============================================================================
// FullBleedHero 편집기
// ============================================================================

export function FullBleedHeroEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [buttons, setButtons] = useState<any[]>(
    (config.ctaButtons || []).map((b: any) => ({ _uid: genUid(), ...b }))
  );
  const heightPreset = config.heightPreset || "80vh";

  const sync = (nextButtons: any[], nextHeight = heightPreset) => {
    onChange({
      ...config,
      heightPreset: nextHeight,
      ctaButtons: nextButtons.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          높이
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(["60vh", "80vh", "100vh"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => sync(buttons, h)}
              className={`px-2 py-1.5 text-xs rounded border ${
                heightPreset === h
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">CTA 버튼 (최대 2개)</label>
          {buttons.length < 2 && (
            <button
              type="button"
              onClick={() => {
                const next = [...buttons, { _uid: genUid(), label: "", url: "", style: "primary" }];
                setButtons(next);
                sync(next);
              }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + 추가
            </button>
          )}
        </div>
        <div className="space-y-2">
          {buttons.map((btn, idx) => (
            <div key={btn._uid} className="flex gap-1.5 items-center p-2 bg-gray-50 rounded">
              <input
                value={btn.label || ""}
                onChange={(e) => {
                  const next = [...buttons];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setButtons(next);
                  sync(next);
                }}
                placeholder="라벨"
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <input
                value={btn.url || ""}
                onChange={(e) => {
                  const next = [...buttons];
                  next[idx] = { ...next[idx], url: e.target.value };
                  setButtons(next);
                  sync(next);
                }}
                placeholder="URL"
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <select
                value={btn.style || "primary"}
                onChange={(e) => {
                  const next = [...buttons];
                  next[idx] = { ...next[idx], style: e.target.value };
                  setButtons(next);
                  sync(next);
                }}
                className="px-1 py-1 border border-gray-200 rounded text-xs bg-white"
              >
                <option value="primary">기본</option>
                <option value="outline">아웃라인</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const next = buttons.filter((_, i) => i !== idx);
                  setButtons(next);
                  sync(next);
                }}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// StorySplit 편집기
// ============================================================================

export function StorySplitEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const imagePosition = config.imagePosition || "left";
  const imageUrl = config.imageUrl || "";
  const ctaLabel = config.ctaLabel || "";
  const ctaUrl = config.ctaUrl || "";

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          이미지 위치
        </label>
        <div className="grid grid-cols-2 gap-1">
          {(["left", "right"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...config, imagePosition: p })}
              className={`px-2 py-1.5 text-xs rounded border ${
                imagePosition === p
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {p === "left" ? "← 왼쪽" : "오른쪽 →"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          이미지 URL
        </label>
        <div className="flex gap-1.5">
          <TextInput
            value={imageUrl}
            onChange={(v) => onChange({ ...config, imageUrl: v })}
            placeholder="https://..."
          />
          <ImageUploadButton
            onUploaded={(url) => onChange({ ...config, imageUrl: url })}
          />
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="mt-2 w-full max-h-32 object-cover rounded"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            CTA 라벨
          </label>
          <TextInput
            value={ctaLabel}
            onChange={(v) => onChange({ ...config, ctaLabel: v })}
            placeholder="자세히 보기"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            CTA URL
          </label>
          <TextInput
            value={ctaUrl}
            onChange={(v) => onChange({ ...config, ctaUrl: v })}
            placeholder="/about"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Columns 선택기 (공용)
// ============================================================================

function ColumnsPicker({
  value,
  onChange,
}: {
  value: 2 | 3 | 4;
  onChange: (v: 2 | 3 | 4) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        컬럼 수
      </label>
      <div className="grid grid-cols-3 gap-1">
        {([2, 3, 4] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`px-2 py-1.5 text-xs rounded border ${
              value === c
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {c}열
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// StatHighlights 편집기
// ============================================================================

export function StatHighlightsEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [stats, setStats] = useState<any[]>(
    (config.stats || []).map((s: any) => ({ _uid: genUid(), ...s }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const columns = (config.columns || 3) as 2 | 3 | 4;

  const sync = (next: any[], cols = columns) => {
    setStats(next);
    onChange({
      ...config,
      columns: cols,
      stats: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <ColumnsPicker value={columns} onChange={(c) => sync(stats, c)} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">통계 항목</label>
          <button
            type="button"
            onClick={() =>
              sync([...stats, { _uid: genUid(), value: "", unit: "", label: "", description: "" }])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = stats.findIndex((x) => x._uid === active.id);
              const newIdx = stats.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(stats, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={stats.map((s) => s._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {stats.map((stat, idx) => (
                <SortableRow key={stat._uid} id={stat._uid}>
                  {({ dragHandleProps }) => (
                    <div className="flex gap-1.5 items-center p-2 bg-gray-50 rounded">
                      <button
                        type="button"
                        {...dragHandleProps}
                        className="cursor-grab text-gray-400"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        <input
                          value={stat.value || ""}
                          onChange={(e) => {
                            const next = [...stats];
                            next[idx] = { ...next[idx], value: e.target.value };
                            sync(next);
                          }}
                          placeholder="값 (예: 22)"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          value={stat.unit || ""}
                          onChange={(e) => {
                            const next = [...stats];
                            next[idx] = { ...next[idx], unit: e.target.value };
                            sync(next);
                          }}
                          placeholder="단위 (예: 년)"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          value={stat.label || ""}
                          onChange={(e) => {
                            const next = [...stats];
                            next[idx] = { ...next[idx], label: e.target.value };
                            sync(next);
                          }}
                          placeholder="라벨"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          value={stat.description || ""}
                          onChange={(e) => {
                            const next = [...stats];
                            next[idx] = { ...next[idx], description: e.target.value };
                            sync(next);
                          }}
                          placeholder="설명 (선택)"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => sync(stats.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </SortableRow>
              ))}
              {stats.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">통계 항목을 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// FeatureCards 편집기
// ============================================================================

export function FeatureCardsEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [cards, setCards] = useState<any[]>(
    (config.cards || []).map((c: any) => ({ _uid: genUid(), ...c }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const columns = (config.columns || 3) as 2 | 3 | 4;
  const cardBg = config.cardBackground || { type: "transparent" };

  const sync = (next: any[], opts: { columns?: 2 | 3 | 4; cardBackground?: any } = {}) => {
    setCards(next);
    onChange({
      ...config,
      columns: opts.columns ?? columns,
      cardBackground: opts.cardBackground ?? cardBg,
      cards: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <ColumnsPicker value={columns} onChange={(c) => sync(cards, { columns: c })} />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          카드 배경
        </label>
        <div className="grid grid-cols-3 gap-1 mb-2">
          {(["transparent", "color", "gradient"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => sync(cards, { cardBackground: { ...cardBg, type: t } })}
              className={`px-2 py-1.5 text-xs rounded border ${
                cardBg.type === t
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t === "transparent" && "투명"}
              {t === "color" && "단색"}
              {t === "gradient" && "그라디언트"}
            </button>
          ))}
        </div>
        {cardBg.type === "color" && (
          <input
            type="color"
            value={cardBg.color || "#3b82f6"}
            onChange={(e) =>
              sync(cards, { cardBackground: { ...cardBg, color: e.target.value } })
            }
            className="w-full h-9 rounded border border-gray-200"
          />
        )}
        {cardBg.type === "gradient" && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cardBg.gradientFrom || "#3b82f6"}
              onChange={(e) =>
                sync(cards, { cardBackground: { ...cardBg, gradientFrom: e.target.value } })
              }
              className="w-9 h-8 rounded border border-gray-200"
            />
            <span className="text-xs text-gray-500">→</span>
            <input
              type="color"
              value={cardBg.gradientTo || "#8b5cf6"}
              onChange={(e) =>
                sync(cards, { cardBackground: { ...cardBg, gradientTo: e.target.value } })
              }
              className="w-9 h-8 rounded border border-gray-200"
            />
            <select
              value={cardBg.gradientDirection || "to-br"}
              onChange={(e) =>
                sync(cards, {
                  cardBackground: { ...cardBg, gradientDirection: e.target.value },
                })
              }
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
            >
              <option value="to-r">→</option>
              <option value="to-br">↘</option>
              <option value="to-b">↓</option>
              <option value="to-bl">↙</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">카드</label>
          <button
            type="button"
            onClick={() =>
              sync([
                ...cards,
                { _uid: genUid(), icon: "", title: "", description: "", linkUrl: "" },
              ])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = cards.findIndex((x) => x._uid === active.id);
              const newIdx = cards.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(cards, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={cards.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {cards.map((card, idx) => (
                <SortableRow key={card._uid} id={card._uid}>
                  {({ dragHandleProps }) => (
                    <div className="p-2 bg-gray-50 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          value={card.icon || ""}
                          onChange={(e) => {
                            const next = [...cards];
                            next[idx] = { ...next[idx], icon: e.target.value };
                            sync(next);
                          }}
                          placeholder="lucide 아이콘 (예: Star)"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => sync(cards.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        value={card.title || ""}
                        onChange={(e) => {
                          const next = [...cards];
                          next[idx] = { ...next[idx], title: e.target.value };
                          sync(next);
                        }}
                        placeholder="제목"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <input
                        value={card.description || ""}
                        onChange={(e) => {
                          const next = [...cards];
                          next[idx] = { ...next[idx], description: e.target.value };
                          sync(next);
                        }}
                        placeholder="설명 (선택)"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <input
                        value={card.linkUrl || ""}
                        onChange={(e) => {
                          const next = [...cards];
                          next[idx] = { ...next[idx], linkUrl: e.target.value };
                          sync(next);
                        }}
                        placeholder="링크 URL (선택)"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                    </div>
                  )}
                </SortableRow>
              ))}
              {cards.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">카드를 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// TestimonialSlider 편집기
// ============================================================================

export function TestimonialSliderEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [items, setItems] = useState<any[]>(
    (config.testimonials || []).map((t: any) => ({ _uid: genUid(), ...t }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sync = (next: any[]) => {
    setItems(next);
    onChange({
      ...config,
      testimonials: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-600">고객 후기</label>
        <button
          type="button"
          onClick={() =>
            sync([
              ...items,
              {
                _uid: genUid(),
                rating: 5,
                quote: "",
                name: "",
                affiliation: "",
                avatarUrl: "",
              },
            ])
          }
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          + 추가
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => {
          const { active, over } = e;
          if (over && active.id !== over.id) {
            const oldIdx = items.findIndex((x) => x._uid === active.id);
            const newIdx = items.findIndex((x) => x._uid === over.id);
            if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(items, oldIdx, newIdx));
          }
        }}
      >
        <SortableContext items={items.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((t, idx) => (
              <SortableRow key={t._uid} id={t._uid}>
                {({ dragHandleProps }) => (
                  <div className="p-2 bg-gray-50 rounded space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        {...dragHandleProps}
                        className="cursor-grab text-gray-400"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <select
                        value={t.rating || 5}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], rating: parseInt(e.target.value) };
                          sync(next);
                        }}
                        className="px-2 py-1 border border-gray-200 rounded text-xs bg-white"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            ★{n}
                          </option>
                        ))}
                      </select>
                      <input
                        value={t.name || ""}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], name: e.target.value };
                          sync(next);
                        }}
                        placeholder="작성자"
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => sync(items.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={t.quote || ""}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], quote: e.target.value };
                        sync(next);
                      }}
                      placeholder="후기 인용문"
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        value={t.affiliation || ""}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], affiliation: e.target.value };
                          sync(next);
                        }}
                        placeholder="소속 (선택)"
                        className="px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <div className="flex gap-1">
                        <input
                          value={t.avatarUrl || ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], avatarUrl: e.target.value };
                            sync(next);
                          }}
                          placeholder="아바타 URL"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <ImageUploadButton
                          folder="avatars"
                          onUploaded={(url) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], avatarUrl: url };
                            sync(next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </SortableRow>
            ))}
            {items.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">후기를 추가하세요</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ============================================================================
// ProcessSteps 편집기
// ============================================================================

export function ProcessStepsEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [steps, setSteps] = useState<any[]>(
    (config.steps || []).map((s: any) => ({ _uid: genUid(), ...s }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sync = (next: any[]) => {
    setSteps(next);
    onChange({
      ...config,
      steps: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-600">단계 (3~6)</label>
        <button
          type="button"
          onClick={() =>
            sync([...steps, { _uid: genUid(), title: "", description: "", icon: "" }])
          }
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          + 추가
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => {
          const { active, over } = e;
          if (over && active.id !== over.id) {
            const oldIdx = steps.findIndex((x) => x._uid === active.id);
            const newIdx = steps.findIndex((x) => x._uid === over.id);
            if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(steps, oldIdx, newIdx));
          }
        }}
      >
        <SortableContext items={steps.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {steps.map((s, idx) => (
              <SortableRow key={s._uid} id={s._uid}>
                {({ dragHandleProps }) => (
                  <div className="p-2 bg-gray-50 rounded space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        {...dragHandleProps}
                        className="cursor-grab text-gray-400"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-gray-500 w-6">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <input
                        value={s.title || ""}
                        onChange={(e) => {
                          const next = [...steps];
                          next[idx] = { ...next[idx], title: e.target.value };
                          sync(next);
                        }}
                        placeholder="단계 제목"
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <input
                        value={s.icon || ""}
                        onChange={(e) => {
                          const next = [...steps];
                          next[idx] = { ...next[idx], icon: e.target.value };
                          sync(next);
                        }}
                        placeholder="아이콘"
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => sync(steps.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      value={s.description || ""}
                      onChange={(e) => {
                        const next = [...steps];
                        next[idx] = { ...next[idx], description: e.target.value };
                        sync(next);
                      }}
                      placeholder="설명 (선택)"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </div>
                )}
              </SortableRow>
            ))}
            {steps.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">단계를 추가하세요</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ============================================================================
// CtaCentered 편집기
// ============================================================================

export function CtaCenteredEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [buttons, setButtons] = useState<any[]>(
    (config.buttons || []).map((b: any) => ({ _uid: genUid(), ...b }))
  );

  const sync = (next: any[]) => {
    setButtons(next);
    onChange({
      ...config,
      buttons: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-600">버튼 (최대 2개)</label>
        {buttons.length < 2 && (
          <button
            type="button"
            onClick={() =>
              sync([...buttons, { _uid: genUid(), label: "", url: "", style: "primary" }])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        )}
      </div>
      <div className="space-y-2">
        {buttons.map((btn, idx) => (
          <div key={btn._uid} className="flex gap-1.5 items-center p-2 bg-gray-50 rounded">
            <input
              value={btn.label || ""}
              onChange={(e) => {
                const next = [...buttons];
                next[idx] = { ...next[idx], label: e.target.value };
                sync(next);
              }}
              placeholder="라벨"
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
            />
            <input
              value={btn.url || ""}
              onChange={(e) => {
                const next = [...buttons];
                next[idx] = { ...next[idx], url: e.target.value };
                sync(next);
              }}
              placeholder="URL"
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
            />
            <select
              value={btn.style || "primary"}
              onChange={(e) => {
                const next = [...buttons];
                next[idx] = { ...next[idx], style: e.target.value };
                sync(next);
              }}
              className="px-1 py-1 border border-gray-200 rounded text-xs bg-white"
            >
              <option value="primary">기본</option>
              <option value="outline">아웃라인</option>
            </select>
            <button
              type="button"
              onClick={() => sync(buttons.filter((_, i) => i !== idx))}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ImageGallery 편집기
// ============================================================================

export function ImageGalleryEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [images, setImages] = useState<any[]>(
    (config.images || []).map((i: any) => ({ _uid: genUid(), ...i }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const columns = (config.columns || 3) as 2 | 3 | 4;
  const { token } = useAdminAuth();

  const sync = (next: any[], cols = columns) => {
    setImages(next);
    onChange({
      ...config,
      columns: cols,
      images: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <ColumnsPicker value={columns} onChange={(c) => sync(images, c)} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">이미지 (2~12)</label>
          <button
            type="button"
            onClick={() => sync([...images, { _uid: genUid(), url: "", caption: "" }])}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = images.findIndex((x) => x._uid === active.id);
              const newIdx = images.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(images, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={images.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {images.map((img, idx) => (
                <SortableRow key={img._uid} id={img._uid}>
                  {({ dragHandleProps }) => (
                    <div className="flex gap-1.5 items-center p-2 bg-gray-50 rounded">
                      <button
                        type="button"
                        {...dragHandleProps}
                        className="cursor-grab text-gray-400"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div className="flex-shrink-0">
                        {img.url ? (
                          <img
                            src={img.url}
                            alt=""
                            className="w-12 h-12 object-cover rounded"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex gap-1">
                          <input
                            value={img.url || ""}
                            onChange={(e) => {
                              const next = [...images];
                              next[idx] = { ...next[idx], url: e.target.value };
                              sync(next);
                            }}
                            placeholder="이미지 URL"
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                          />
                          <label className="inline-flex items-center px-2 py-1 border border-gray-200 rounded text-xs cursor-pointer hover:bg-gray-100">
                            <Upload className="w-3 h-3" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append("file", file);
                                fd.append("folder", "gallery");
                                try {
                                  const res = await fetch("/api/upload", {
                                    method: "POST",
                                    headers: { Authorization: `Bearer ${token}` },
                                    body: fd,
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    const next = [...images];
                                    next[idx] = { ...next[idx], url: data.url };
                                    sync(next);
                                  }
                                } catch {}
                              }}
                            />
                          </label>
                        </div>
                        <input
                          value={img.caption || ""}
                          onChange={(e) => {
                            const next = [...images];
                            next[idx] = { ...next[idx], caption: e.target.value };
                            sync(next);
                          }}
                          placeholder="캡션 (선택)"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => sync(images.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </SortableRow>
              ))}
              {images.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">이미지를 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// 추가 컬럼 선택기 — 3/4/5/6 (LogoWall/IconCallouts/AwardsBadges용)
// ============================================================================

function ColumnsPickerWide({
  value,
  onChange,
}: {
  value: 3 | 4 | 5 | 6;
  onChange: (v: 3 | 4 | 5 | 6) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        컬럼 수
      </label>
      <div className="grid grid-cols-4 gap-1">
        {([3, 4, 5, 6] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`px-2 py-1.5 text-xs rounded border ${
              value === c
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {c}열
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// VideoHero 편집기
// ============================================================================

export function VideoHeroEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [buttons, setButtons] = useState<any[]>(
    (config.ctaButtons || []).map((b: any) => ({ _uid: genUid(), ...b }))
  );
  const heightPreset = config.heightPreset || "80vh";
  const overlay = typeof config.overlay === "number" ? config.overlay : 0.4;

  const sync = (
    nextButtons: any[],
    patch: Partial<{ heightPreset: string; videoUrl: string; posterUrl: string; overlay: number }> = {}
  ) => {
    onChange({
      ...config,
      ...patch,
      heightPreset: patch.heightPreset ?? heightPreset,
      ctaButtons: nextButtons.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          영상 URL (mp4 권장)
        </label>
        <TextInput
          value={config.videoUrl || ""}
          onChange={(v) => sync(buttons, { videoUrl: v })}
          placeholder="https://..../video.mp4"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          포스터 이미지 URL (선택)
        </label>
        <div className="flex gap-1.5">
          <TextInput
            value={config.posterUrl || ""}
            onChange={(v) => sync(buttons, { posterUrl: v })}
            placeholder="https://..."
          />
          <ImageUploadButton
            onUploaded={(url) => sync(buttons, { posterUrl: url })}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          높이
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(["60vh", "80vh", "100vh"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => sync(buttons, { heightPreset: h })}
              className={`px-2 py-1.5 text-xs rounded border ${
                heightPreset === h
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          어두운 오버레이: {(overlay * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={overlay}
          onChange={(e) => sync(buttons, { overlay: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">CTA 버튼 (최대 2개)</label>
          {buttons.length < 2 && (
            <button
              type="button"
              onClick={() => {
                const next = [...buttons, { _uid: genUid(), label: "", url: "", style: "primary" }];
                setButtons(next);
                sync(next);
              }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + 추가
            </button>
          )}
        </div>
        <div className="space-y-2">
          {buttons.map((btn, idx) => (
            <div key={btn._uid} className="flex gap-1.5 items-center p-2 bg-gray-50 rounded">
              <input
                value={btn.label || ""}
                onChange={(e) => {
                  const next = [...buttons];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setButtons(next);
                  sync(next);
                }}
                placeholder="라벨"
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <input
                value={btn.url || ""}
                onChange={(e) => {
                  const next = [...buttons];
                  next[idx] = { ...next[idx], url: e.target.value };
                  setButtons(next);
                  sync(next);
                }}
                placeholder="URL"
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <select
                value={btn.style || "primary"}
                onChange={(e) => {
                  const next = [...buttons];
                  next[idx] = { ...next[idx], style: e.target.value };
                  setButtons(next);
                  sync(next);
                }}
                className="px-1 py-1 border border-gray-200 rounded text-xs bg-white"
              >
                <option value="primary">기본</option>
                <option value="outline">아웃라인</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const next = buttons.filter((_, i) => i !== idx);
                  setButtons(next);
                  sync(next);
                }}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LogoWall 편집기
// ============================================================================

export function LogoWallEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [logos, setLogos] = useState<any[]>(
    (config.logos || []).map((l: any) => ({ _uid: genUid(), ...l }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const columns = (config.columns || 5) as 3 | 4 | 5 | 6;
  const grayscale = !!config.grayscale;

  const sync = (next: any[], opts: { columns?: 3 | 4 | 5 | 6; grayscale?: boolean } = {}) => {
    setLogos(next);
    onChange({
      ...config,
      columns: opts.columns ?? columns,
      grayscale: opts.grayscale ?? grayscale,
      logos: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <ColumnsPickerWide value={columns} onChange={(c) => sync(logos, { columns: c })} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">흑백 + hover 컬러</span>
        <button
          type="button"
          onClick={() => sync(logos, { grayscale: !grayscale })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            grayscale ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              grayscale ? "translate-x-[18px]" : "translate-x-[2px]"
            }`}
          />
        </button>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">로고</label>
          <button
            type="button"
            onClick={() =>
              sync([...logos, { _uid: genUid(), imageUrl: "", name: "", linkUrl: "" }])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = logos.findIndex((x) => x._uid === active.id);
              const newIdx = logos.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(logos, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={logos.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {logos.map((logo, idx) => (
                <SortableRow key={logo._uid} id={logo._uid}>
                  {({ dragHandleProps }) => (
                    <div className="flex gap-1.5 items-center p-2 bg-gray-50 rounded">
                      <button
                        type="button"
                        {...dragHandleProps}
                        className="cursor-grab text-gray-400"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div className="flex-shrink-0">
                        {logo.imageUrl ? (
                          <img
                            src={logo.imageUrl}
                            alt=""
                            className="w-12 h-8 object-contain bg-white border border-gray-200 rounded"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-gray-200 rounded" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          value={logo.name || ""}
                          onChange={(e) => {
                            const next = [...logos];
                            next[idx] = { ...next[idx], name: e.target.value };
                            sync(next);
                          }}
                          placeholder="이름 (예: Apple)"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <div className="flex gap-1">
                          <input
                            value={logo.imageUrl || ""}
                            onChange={(e) => {
                              const next = [...logos];
                              next[idx] = { ...next[idx], imageUrl: e.target.value };
                              sync(next);
                            }}
                            placeholder="이미지 URL"
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                          />
                          <ImageUploadButton
                            folder="logos"
                            onUploaded={(url) => {
                              const next = [...logos];
                              next[idx] = { ...next[idx], imageUrl: url };
                              sync(next);
                            }}
                          />
                        </div>
                        <input
                          value={logo.linkUrl || ""}
                          onChange={(e) => {
                            const next = [...logos];
                            next[idx] = { ...next[idx], linkUrl: e.target.value };
                            sync(next);
                          }}
                          placeholder="링크 URL (선택)"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => sync(logos.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </SortableRow>
              ))}
              {logos.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">로고를 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// FaqAccordion 편집기
// ============================================================================

export function FaqAccordionEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [items, setItems] = useState<any[]>(
    (config.items || []).map((i: any) => ({ _uid: genUid(), ...i }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const defaultOpenIndex =
    typeof config.defaultOpenIndex === "number" ? config.defaultOpenIndex : -1;

  const sync = (next: any[], opts: { defaultOpenIndex?: number } = {}) => {
    setItems(next);
    onChange({
      ...config,
      defaultOpenIndex: opts.defaultOpenIndex ?? defaultOpenIndex,
      items: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          처음에 펼칠 항목 (선택 안 함 = 모두 닫힘)
        </label>
        <select
          value={defaultOpenIndex}
          onChange={(e) => sync(items, { defaultOpenIndex: parseInt(e.target.value) })}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
        >
          <option value={-1}>모두 닫힘</option>
          {items.map((_, i) => (
            <option key={i} value={i}>
              {i + 1}번째 항목
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">FAQ 항목</label>
          <button
            type="button"
            onClick={() => sync([...items, { _uid: genUid(), question: "", answer: "" }])}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = items.findIndex((x) => x._uid === active.id);
              const newIdx = items.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(items, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={items.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <SortableRow key={item._uid} id={item._uid}>
                  {({ dragHandleProps }) => (
                    <div className="p-2 bg-gray-50 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          value={item.question || ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], question: e.target.value };
                            sync(next);
                          }}
                          placeholder="질문"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => sync(items.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={item.answer || ""}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], answer: e.target.value };
                          sync(next);
                        }}
                        placeholder="답변 (줄바꿈 보존)"
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                    </div>
                  )}
                </SortableRow>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">FAQ를 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// PriceTable 편집기
// ============================================================================

export function PriceTableEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [plans, setPlans] = useState<any[]>(
    (config.plans || []).map((p: any) => ({
      _uid: genUid(),
      ...p,
      features: p.features || [],
    }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const columns = (config.columns || 3) as 2 | 3 | 4;

  const sync = (next: any[], cols = columns) => {
    setPlans(next);
    onChange({
      ...config,
      columns: cols,
      plans: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <ColumnsPicker value={columns} onChange={(c) => sync(plans, c)} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">플랜</label>
          <button
            type="button"
            onClick={() =>
              sync([
                ...plans,
                {
                  _uid: genUid(),
                  name: "",
                  price: "",
                  priceUnit: "",
                  description: "",
                  features: [],
                  ctaLabel: "",
                  ctaUrl: "",
                  highlighted: false,
                },
              ])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = plans.findIndex((x) => x._uid === active.id);
              const newIdx = plans.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(plans, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={plans.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {plans.map((plan, idx) => (
                <SortableRow key={plan._uid} id={plan._uid}>
                  {({ dragHandleProps }) => (
                    <div className="p-2 bg-gray-50 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          value={plan.name || ""}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], name: e.target.value };
                            sync(next);
                          }}
                          placeholder="플랜명 (예: Pro)"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <label className="flex items-center gap-1 text-[10px] text-gray-600">
                          <input
                            type="checkbox"
                            checked={!!plan.highlighted}
                            onChange={(e) => {
                              const next = [...plans];
                              next[idx] = { ...next[idx], highlighted: e.target.checked };
                              sync(next);
                            }}
                          />
                          추천
                        </label>
                        <button
                          type="button"
                          onClick={() => sync(plans.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          value={plan.price || ""}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], price: e.target.value };
                            sync(next);
                          }}
                          placeholder="가격 (예: ₩99,000)"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          value={plan.priceUnit || ""}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], priceUnit: e.target.value };
                            sync(next);
                          }}
                          placeholder="단위 (예: /월)"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <input
                        value={plan.description || ""}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = { ...next[idx], description: e.target.value };
                          sync(next);
                        }}
                        placeholder="짧은 설명 (선택)"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <textarea
                        value={(plan.features || []).join("\n")}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = {
                            ...next[idx],
                            features: e.target.value.split("\n").filter((s) => s.trim()),
                          };
                          sync(next);
                        }}
                        rows={3}
                        placeholder={"기능 목록 (한 줄에 하나씩)\n예: 무제한 사용\n예: 24시간 지원"}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          value={plan.ctaLabel || ""}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], ctaLabel: e.target.value };
                            sync(next);
                          }}
                          placeholder="CTA 라벨 (선택)"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          value={plan.ctaUrl || ""}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], ctaUrl: e.target.value };
                            sync(next);
                          }}
                          placeholder="CTA URL"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}
                </SortableRow>
              ))}
              {plans.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">플랜을 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// Timeline 편집기
// ============================================================================

export function TimelineEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [events, setEvents] = useState<any[]>(
    (config.events || []).map((e: any) => ({ _uid: genUid(), ...e }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const lineColor = config.lineColor || "";

  const sync = (next: any[], opts: { lineColor?: string } = {}) => {
    setEvents(next);
    onChange({
      ...config,
      lineColor: opts.lineColor ?? lineColor,
      events: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          세로선 색상 (비우면 기본)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={lineColor || "#d2d2d7"}
            onChange={(e) => sync(events, { lineColor: e.target.value })}
            className="w-10 h-8 rounded border border-gray-200"
          />
          <input
            type="text"
            value={lineColor}
            onChange={(e) => sync(events, { lineColor: e.target.value })}
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs"
            placeholder="#d2d2d7"
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">이벤트</label>
          <button
            type="button"
            onClick={() =>
              sync([...events, { _uid: genUid(), year: "", title: "", description: "" }])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = events.findIndex((x) => x._uid === active.id);
              const newIdx = events.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(events, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={events.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {events.map((event, idx) => (
                <SortableRow key={event._uid} id={event._uid}>
                  {({ dragHandleProps }) => (
                    <div className="p-2 bg-gray-50 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          value={event.year || ""}
                          onChange={(e) => {
                            const next = [...events];
                            next[idx] = { ...next[idx], year: e.target.value };
                            sync(next);
                          }}
                          placeholder="연도 (예: 2004)"
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          value={event.title || ""}
                          onChange={(e) => {
                            const next = [...events];
                            next[idx] = { ...next[idx], title: e.target.value };
                            sync(next);
                          }}
                          placeholder="제목"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => sync(events.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        value={event.description || ""}
                        onChange={(e) => {
                          const next = [...events];
                          next[idx] = { ...next[idx], description: e.target.value };
                          sync(next);
                        }}
                        placeholder="설명 (선택)"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                    </div>
                  )}
                </SortableRow>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">이벤트를 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// ComparisonTable 편집기
// ============================================================================

export function ComparisonTableEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const headers = (config.headers || []) as string[];
  const [rows, setRows] = useState<any[]>(
    (config.rows || []).map((r: any) => ({ _uid: genUid(), ...r, values: r.values || [] }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const highlightCol =
    typeof config.highlightCol === "number" ? config.highlightCol : -1;

  const valueCount = Math.max(0, headers.length - 1);

  const sync = (
    nextRows: any[],
    opts: { headers?: string[]; highlightCol?: number } = {}
  ) => {
    setRows(nextRows);
    const nextHeaders = opts.headers ?? headers;
    const valCount = Math.max(0, nextHeaders.length - 1);
    onChange({
      ...config,
      headers: nextHeaders,
      highlightCol: opts.highlightCol ?? highlightCol,
      rows: nextRows.map(({ _uid, ...rest }) => ({
        ...rest,
        // 헤더 수에 맞춰 값 배열 길이 조정
        values: [...(rest.values || []), ...Array(valCount).fill("")].slice(0, valCount),
      })),
    });
  };

  const updateHeader = (i: number, v: string) => {
    const next = [...headers];
    next[i] = v;
    sync(rows, { headers: next });
  };
  const addHeader = () => sync(rows, { headers: [...headers, ""] });
  const removeHeader = (i: number) => {
    const next = headers.filter((_, idx) => idx !== i);
    // 헤더가 줄어들면 행의 values도 잘라야 함 (i=0 라벨은 제거 불가지만 안전하게 처리)
    const newRows = rows.map((r) => ({
      ...r,
      values: i === 0 ? r.values : r.values.filter((_: any, vi: number) => vi !== i - 1),
    }));
    sync(newRows, { headers: next });
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">
            헤더 (첫 컬럼은 라벨, 나머지는 비교 컬럼)
          </label>
          <button
            type="button"
            onClick={addHeader}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 컬럼
          </button>
        </div>
        <div className="space-y-1">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <span className="text-[10px] text-gray-500 w-8">
                {i === 0 ? "라벨" : `값${i}`}
              </span>
              <input
                value={h}
                onChange={(e) => updateHeader(i, e.target.value)}
                placeholder={i === 0 ? "구분 (보통 비움)" : `헤더 ${i}`}
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <label className="flex items-center gap-1 text-[10px] text-gray-600">
                <input
                  type="radio"
                  name="hl-col"
                  checked={highlightCol === i}
                  onChange={() => sync(rows, { highlightCol: i })}
                />
                강조
              </label>
              <button
                type="button"
                onClick={() => removeHeader(i)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {headers.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">헤더를 추가하세요</p>
          )}
          {highlightCol >= 0 && (
            <button
              type="button"
              onClick={() => sync(rows, { highlightCol: -1 })}
              className="text-[10px] text-gray-500 hover:text-gray-700"
            >
              강조 해제
            </button>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">행</label>
          <button
            type="button"
            onClick={() =>
              sync([
                ...rows,
                {
                  _uid: genUid(),
                  label: "",
                  values: Array(valueCount).fill(""),
                },
              ])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 행
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = rows.findIndex((x) => x._uid === active.id);
              const newIdx = rows.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(rows, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={rows.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rows.map((row, idx) => (
                <SortableRow key={row._uid} id={row._uid}>
                  {({ dragHandleProps }) => (
                    <div className="p-2 bg-gray-50 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          value={row.label || ""}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx] = { ...next[idx], label: e.target.value };
                            sync(next);
                          }}
                          placeholder="행 라벨"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => sync(rows.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {valueCount > 0 && (
                        <div
                          className="grid gap-1.5"
                          style={{ gridTemplateColumns: `repeat(${valueCount}, 1fr)` }}
                        >
                          {Array(valueCount)
                            .fill(0)
                            .map((_, vi) => (
                              <input
                                key={vi}
                                value={row.values?.[vi] || ""}
                                onChange={(e) => {
                                  const next = [...rows];
                                  const newValues = [...(next[idx].values || [])];
                                  while (newValues.length < valueCount) newValues.push("");
                                  newValues[vi] = e.target.value;
                                  next[idx] = { ...next[idx], values: newValues };
                                  sync(next);
                                }}
                                placeholder={headers[vi + 1] || `값 ${vi + 1}`}
                                className="px-2 py-1 border border-gray-200 rounded text-xs"
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </SortableRow>
              ))}
              {rows.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">행을 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// IconCallouts 편집기
// ============================================================================

export function IconCalloutsEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [items, setItems] = useState<any[]>(
    (config.items || []).map((i: any) => ({ _uid: genUid(), ...i }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const columns = (config.columns || 4) as 3 | 4 | 5 | 6;

  const sync = (next: any[], cols = columns) => {
    setItems(next);
    onChange({
      ...config,
      columns: cols,
      items: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <ColumnsPickerWide value={columns} onChange={(c) => sync(items, c)} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">콜아웃</label>
          <button
            type="button"
            onClick={() =>
              sync([...items, { _uid: genUid(), icon: "", title: "", description: "" }])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = items.findIndex((x) => x._uid === active.id);
              const newIdx = items.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(items, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={items.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <SortableRow key={item._uid} id={item._uid}>
                  {({ dragHandleProps }) => (
                    <div className="p-2 bg-gray-50 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          value={item.icon || ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], icon: e.target.value };
                            sync(next);
                          }}
                          placeholder="lucide 아이콘 (예: Shield)"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => sync(items.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        value={item.title || ""}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], title: e.target.value };
                          sync(next);
                        }}
                        placeholder="제목"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <input
                        value={item.description || ""}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], description: e.target.value };
                          sync(next);
                        }}
                        placeholder="설명 (선택)"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                    </div>
                  )}
                </SortableRow>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">콜아웃을 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// QuoteBlock 편집기
// ============================================================================

export function QuoteBlockEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const update = (patch: any) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          인용구 본문
        </label>
        <textarea
          value={config.quote || ""}
          onChange={(e) => update({ quote: e.target.value })}
          rows={4}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
          placeholder="큰 인용구 본문 (줄바꿈 보존)"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            작성자
          </label>
          <TextInput
            value={config.author || ""}
            onChange={(v) => update({ author: v })}
            placeholder="홍길동"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            직함/소속
          </label>
          <TextInput
            value={config.role || ""}
            onChange={(v) => update({ role: v })}
            placeholder="CEO, 보령항공"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          아바타 이미지 URL (선택)
        </label>
        <div className="flex gap-1.5">
          <TextInput
            value={config.avatarUrl || ""}
            onChange={(v) => update({ avatarUrl: v })}
            placeholder="https://..."
          />
          <ImageUploadButton
            folder="avatars"
            onUploaded={(url) => update({ avatarUrl: url })}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AwardsBadges 편집기
// ============================================================================

export function AwardsBadgesEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [badges, setBadges] = useState<any[]>(
    (config.badges || []).map((b: any) => ({ _uid: genUid(), ...b }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const columns = (config.columns || 4) as 3 | 4 | 5 | 6;

  const sync = (next: any[], cols = columns) => {
    setBadges(next);
    onChange({
      ...config,
      columns: cols,
      badges: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <ColumnsPickerWide value={columns} onChange={(c) => sync(badges, c)} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">배지</label>
          <button
            type="button"
            onClick={() =>
              sync([...badges, { _uid: genUid(), imageUrl: "", name: "", year: "" }])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = badges.findIndex((x) => x._uid === active.id);
              const newIdx = badges.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(badges, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={badges.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {badges.map((badge, idx) => (
                <SortableRow key={badge._uid} id={badge._uid}>
                  {({ dragHandleProps }) => (
                    <div className="flex gap-1.5 items-center p-2 bg-gray-50 rounded">
                      <button
                        type="button"
                        {...dragHandleProps}
                        className="cursor-grab text-gray-400"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div className="flex-shrink-0">
                        {badge.imageUrl ? (
                          <img
                            src={badge.imageUrl}
                            alt=""
                            className="w-12 h-12 object-contain bg-white border border-gray-200 rounded"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          value={badge.name || ""}
                          onChange={(e) => {
                            const next = [...badges];
                            next[idx] = { ...next[idx], name: e.target.value };
                            sync(next);
                          }}
                          placeholder="배지명"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <div className="flex gap-1">
                          <input
                            value={badge.imageUrl || ""}
                            onChange={(e) => {
                              const next = [...badges];
                              next[idx] = { ...next[idx], imageUrl: e.target.value };
                              sync(next);
                            }}
                            placeholder="이미지 URL"
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                          />
                          <ImageUploadButton
                            folder="awards"
                            onUploaded={(url) => {
                              const next = [...badges];
                              next[idx] = { ...next[idx], imageUrl: url };
                              sync(next);
                            }}
                          />
                        </div>
                        <input
                          value={badge.year || ""}
                          onChange={(e) => {
                            const next = [...badges];
                            next[idx] = { ...next[idx], year: e.target.value };
                            sync(next);
                          }}
                          placeholder="연도 (선택)"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => sync(badges.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </SortableRow>
              ))}
              {badges.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">배지를 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// FeatureAlternating 편집기
// ============================================================================

export function FeatureAlternatingEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const [blocks, setBlocks] = useState<any[]>(
    (config.blocks || []).map((b: any) => ({ _uid: genUid(), ...b }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const startSide = (config.startSide || "left") as "left" | "right";

  const sync = (next: any[], opts: { startSide?: "left" | "right" } = {}) => {
    setBlocks(next);
    onChange({
      ...config,
      startSide: opts.startSide ?? startSide,
      blocks: next.map(({ _uid, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          첫 블록의 이미지 위치
        </label>
        <div className="grid grid-cols-2 gap-1">
          {(["left", "right"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sync(blocks, { startSide: s })}
              className={`px-2 py-1.5 text-xs rounded border ${
                startSide === s
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s === "left" ? "← 왼쪽 시작" : "오른쪽 시작 →"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">블록</label>
          <button
            type="button"
            onClick={() =>
              sync([
                ...blocks,
                {
                  _uid: genUid(),
                  title: "",
                  description: "",
                  imageUrl: "",
                  ctaLabel: "",
                  ctaUrl: "",
                },
              ])
            }
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (over && active.id !== over.id) {
              const oldIdx = blocks.findIndex((x) => x._uid === active.id);
              const newIdx = blocks.findIndex((x) => x._uid === over.id);
              if (oldIdx >= 0 && newIdx >= 0) sync(arrayMove(blocks, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={blocks.map((c) => c._uid)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block, idx) => (
                <SortableRow key={block._uid} id={block._uid}>
                  {({ dragHandleProps }) => (
                    <div className="p-2 bg-gray-50 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          {...dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          value={block.title || ""}
                          onChange={(e) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], title: e.target.value };
                            sync(next);
                          }}
                          placeholder="제목"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => sync(blocks.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={block.description || ""}
                        onChange={(e) => {
                          const next = [...blocks];
                          next[idx] = { ...next[idx], description: e.target.value };
                          sync(next);
                        }}
                        rows={2}
                        placeholder="설명 (줄바꿈 보존)"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                      <div className="flex gap-1">
                        <input
                          value={block.imageUrl || ""}
                          onChange={(e) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], imageUrl: e.target.value };
                            sync(next);
                          }}
                          placeholder="이미지 URL"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <ImageUploadButton
                          folder="features"
                          onUploaded={(url) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], imageUrl: url };
                            sync(next);
                          }}
                        />
                      </div>
                      {block.imageUrl && (
                        <img
                          src={block.imageUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full max-h-24 object-cover rounded"
                        />
                      )}
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          value={block.ctaLabel || ""}
                          onChange={(e) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], ctaLabel: e.target.value };
                            sync(next);
                          }}
                          placeholder="CTA 라벨 (선택)"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          value={block.ctaUrl || ""}
                          onChange={(e) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], ctaUrl: e.target.value };
                            sync(next);
                          }}
                          placeholder="CTA URL"
                          className="px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}
                </SortableRow>
              ))}
              {blocks.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">블록을 추가하세요</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// RichText 편집기
// ============================================================================

export function RichTextEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const body = config.body || "";
  const maxWidth = config.maxWidth || "normal";

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          최대 폭
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(["narrow", "normal", "wide"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...config, maxWidth: m })}
              className={`px-2 py-1.5 text-xs rounded border ${
                maxWidth === m
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {m === "narrow" ? "좁게" : m === "normal" ? "보통" : "넓게"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          본문
        </label>
        <textarea
          value={body}
          onChange={(e) => onChange({ ...config, body: e.target.value })}
          rows={6}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs whitespace-pre-line"
          placeholder="자유 본문 입력 (줄바꿈 보존)"
        />
      </div>
    </div>
  );
}

// ============================================================================
// 신규 상품 섹션 (21~30) 데이터 편집기
// ============================================================================

/** 컬럼 선택 헬퍼 (재사용 - 임의 옵션 지원) */
function ColumnsPickerCustom<T extends number>({
  value,
  options,
  onChange,
  label = "컬럼 수",
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`px-2 py-1.5 text-xs rounded border ${
              value === c
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {c}열
          </button>
        ))}
      </div>
    </div>
  );
}

/** product_masonry — columns(2/3/4) */
export function ProductMasonryEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const columns = (config.columns || 3) as 2 | 3 | 4;
  return (
    <div className="space-y-3">
      <ColumnsPickerCustom<2 | 3 | 4>
        value={columns}
        options={[2, 3, 4]}
        onChange={(c) => onChange({ ...config, columns: c })}
      />
    </div>
  );
}

/** product_spotlight — heightPreset, overlay, ctaLabel */
export function ProductSpotlightEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const heightPreset = config.heightPreset || "80vh";
  const overlay = typeof config.overlay === "number" ? config.overlay : 0.4;
  const ctaLabel = config.ctaLabel || "";

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">높이</label>
        <div className="grid grid-cols-3 gap-1">
          {(["60vh", "80vh", "100vh"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onChange({ ...config, heightPreset: h })}
              className={`px-2 py-1.5 text-xs rounded border ${
                heightPreset === h
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          오버레이 강도 ({overlay.toFixed(2)})
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={overlay}
          onChange={(e) => onChange({ ...config, overlay: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">CTA 라벨</label>
        <input
          type="text"
          value={ctaLabel}
          onChange={(e) => onChange({ ...config, ctaLabel: e.target.value })}
          placeholder="자세히 보기"
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
        />
      </div>
    </div>
  );
}

/** product_split_carousel — ctaLabel */
export function ProductSplitCarouselEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const ctaLabel = config.ctaLabel || "";
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">CTA 라벨</label>
        <input
          type="text"
          value={ctaLabel}
          onChange={(e) => onChange({ ...config, ctaLabel: e.target.value })}
          placeholder="전체 보기"
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
        />
        <p className="text-[10px] text-gray-400 mt-1">URL은 "전체 보기 링크" 필드 사용</p>
      </div>
    </div>
  );
}

/** product_compact_list — columns(1/2) */
export function ProductCompactListEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const columns = (config.columns || 1) as 1 | 2;
  return (
    <div className="space-y-3">
      <ColumnsPickerCustom<1 | 2>
        value={columns}
        options={[1, 2]}
        onChange={(c) => onChange({ ...config, columns: c })}
      />
    </div>
  );
}

/** product_hero_banner — imagePosition, ctaLabel */
export function ProductHeroBannerEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const imagePosition = config.imagePosition || "left";
  const ctaLabel = config.ctaLabel || "";
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">이미지 위치</label>
        <div className="grid grid-cols-2 gap-1">
          {(["left", "right"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...config, imagePosition: p })}
              className={`px-2 py-1.5 text-xs rounded border ${
                imagePosition === p
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {p === "left" ? "← 왼쪽" : "오른쪽 →"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">CTA 라벨</label>
        <input
          type="text"
          value={ctaLabel}
          onChange={(e) => onChange({ ...config, ctaLabel: e.target.value })}
          placeholder="자세히 보기"
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
        />
      </div>
    </div>
  );
}

/** product_tabs_country — tabs(string[]) + columns */
export function ProductTabsCountryEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const tabs: string[] = config.tabs || [];
  const columns = (config.columns || 3) as 2 | 3 | 4;

  const updateTabs = (next: string[]) =>
    onChange({ ...config, tabs: next });

  return (
    <div className="space-y-3">
      <ColumnsPickerCustom<2 | 3 | 4>
        value={columns}
        options={[2, 3, 4]}
        onChange={(c) => onChange({ ...config, columns: c })}
      />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">탭 (첫 탭은 "전체"로)</label>
          <button
            type="button"
            onClick={() => updateTabs([...tabs, ""])}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 탭 추가
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mb-2">
          탭 이름이 상품의 destination에 포함되면 해당 탭에 표시됩니다
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-gray-50 border rounded-lg px-2 py-1"
            >
              <input
                type="text"
                value={tab}
                onChange={(e) => {
                  const next = [...tabs];
                  next[idx] = e.target.value;
                  updateTabs(next);
                }}
                className="w-20 px-1 py-0.5 border-0 bg-transparent text-xs focus:outline-none"
                placeholder="탭 이름"
              />
              <button
                type="button"
                onClick={() => updateTabs(tabs.filter((_, i) => i !== idx))}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {tabs.length === 0 && (
            <p className="text-xs text-gray-400">탭을 추가하세요 (예: 전체, 일본, 베트남)</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** product_deal_grid — columns(2/3/4) */
export function ProductDealGridEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const columns = (config.columns || 3) as 2 | 3 | 4;
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-500 bg-amber-50 px-2 py-1.5 rounded">
        원가(originalPrice)가 설정된 상품만 표시되며 할인율 높은 순으로 정렬됩니다.
      </p>
      <ColumnsPickerCustom<2 | 3 | 4>
        value={columns}
        options={[2, 3, 4]}
        onChange={(c) => onChange({ ...config, columns: c })}
      />
    </div>
  );
}

/** product_overlap_grid — columns(3/4) */
export function ProductOverlapGridEditor({
  config,
  onChange,
}: {
  config: any;
  onChange: (next: any) => void;
}) {
  const columns = (config.columns || 4) as 3 | 4;
  return (
    <div className="space-y-3">
      <ColumnsPickerCustom<3 | 4>
        value={columns}
        options={[3, 4]}
        onChange={(c) => onChange({ ...config, columns: c })}
      />
    </div>
  );
}
