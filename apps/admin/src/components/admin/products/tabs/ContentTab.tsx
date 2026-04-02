"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Pencil,
  Eye,
  Type,
  Quote,
  AlertCircle,
  HelpCircle,
  Image,
  Columns,
  Grid3x3,
  Play,
  ImagePlus,
  Minus,
  MoveVertical,
  MousePointerClick,
  LayoutGrid,
  Table,
} from "lucide-react";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  ContentSection,
  SECTION_PALETTE,
  createDefaultSectionData,
  type ContentSectionData,
  type SectionType,
  type TextSection,
  type ImageSection,
  type ImageTextSection,
  type GallerySection,
  type VideoSection,
  type QuoteSection,
  type CalloutSection,
  type DividerSection,
  type FaqSection,
  type FeaturesSection,
  type BannerSection,
  type TableSection,
  type ButtonGroupSection,
  type SpacerSection,
} from "@repo/database";

// ─── 아이콘 맵 ───────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  Type: <Type className="w-4 h-4" />,
  Quote: <Quote className="w-4 h-4" />,
  AlertCircle: <AlertCircle className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  Columns: <Columns className="w-4 h-4" />,
  Grid3x3: <Grid3x3 className="w-4 h-4" />,
  Play: <Play className="w-4 h-4" />,
  ImagePlus: <ImagePlus className="w-4 h-4" />,
  Minus: <Minus className="w-4 h-4" />,
  MoveVertical: <MoveVertical className="w-4 h-4" />,
  MousePointerClick: <MousePointerClick className="w-4 h-4" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" />,
  Table: <Table className="w-4 h-4" />,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

// ─── SortableSection 래퍼 ─────────────────────────────────────────────────────
function SortableSection({
  section,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: {
  section: ContentSection;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          title="드래그하여 순서 변경"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-gray-500 flex-1">
          {SECTION_PALETTE.find((p) => p.type === section.data.type)?.label ?? section.data.type}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
            title="위로"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
            title="아래로"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded text-gray-400 hover:text-red-600"
            title="삭제"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── 이미지 업로드 인풋 ────────────────────────────────────────────────────────
function ImageUploadField({
  url,
  onChange,
  label = "이미지",
  uploadImage,
}: {
  url: string;
  onChange: (url: string) => void;
  label?: string;
  uploadImage: (file: File) => Promise<string | null>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const result = await uploadImage(file);
    if (result) onChange(result);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="이미지 URL 또는 업로드"
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
        >
          업로드
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="preview" className="h-24 rounded object-cover border border-gray-200" />
      )}
    </div>
  );
}

// ─── SectionEditor ─────────────────────────────────────────────────────────────
function SectionEditor({
  section,
  onChange,
  uploadImage,
}: {
  section: ContentSection;
  onChange: (data: ContentSectionData) => void;
  uploadImage: (file: File) => Promise<string | null>;
}) {
  const data = section.data;

  // ── text ──
  if (data.type === "text") {
    const d = data as TextSection;
    return (
      <TiptapEditor
        content={d.html}
        onChange={(html) => onChange({ ...d, html })}
        placeholder="텍스트를 입력하세요..."
        minHeight="120px"
        compact
      />
    );
  }

  // ── image ──
  if (data.type === "image") {
    const d = data as ImageSection;
    return (
      <div className="space-y-3">
        <ImageUploadField
          url={d.url}
          onChange={(url) => onChange({ ...d, url })}
          uploadImage={uploadImage}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Alt 텍스트</label>
            <input
              type="text"
              value={d.alt ?? ""}
              onChange={(e) => onChange({ ...d, alt: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
              placeholder="이미지 설명"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">너비</label>
            <select
              value={d.width ?? "full"}
              onChange={(e) => onChange({ ...d, width: e.target.value as ImageSection["width"] })}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="full">전체 (100%)</option>
              <option value="large">크게 (80%)</option>
              <option value="medium">중간 (60%)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">캡션</label>
          <input
            type="text"
            value={d.caption ?? ""}
            onChange={(e) => onChange({ ...d, caption: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="이미지 아래 설명"
          />
        </div>
      </div>
    );
  }

  // ── imageText ──
  if (data.type === "imageText") {
    const d = data as ImageTextSection;
    return (
      <div className="space-y-3">
        <ImageUploadField
          url={d.imageUrl}
          onChange={(imageUrl) => onChange({ ...d, imageUrl })}
          label="이미지"
          uploadImage={uploadImage}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">이미지 위치</label>
            <select
              value={d.imagePosition}
              onChange={(e) =>
                onChange({ ...d, imagePosition: e.target.value as ImageTextSection["imagePosition"] })
              }
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="left">왼쪽</option>
              <option value="right">오른쪽</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">비율 (이미지:텍스트)</label>
            <select
              value={d.imageRatio ?? "1:1"}
              onChange={(e) =>
                onChange({ ...d, imageRatio: e.target.value as ImageTextSection["imageRatio"] })
              }
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="1:1">1:1</option>
              <option value="1:2">1:2</option>
              <option value="2:1">2:1</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">텍스트</label>
          <TiptapEditor
            content={d.html}
            onChange={(html) => onChange({ ...d, html })}
            placeholder="텍스트를 입력하세요..."
            minHeight="100px"
            compact
          />
        </div>
      </div>
    );
  }

  // ── gallery ──
  if (data.type === "gallery") {
    const d = data as GallerySection;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">열 수</label>
          <select
            value={d.columns}
            onChange={(e) => onChange({ ...d, columns: Number(e.target.value) as 2 | 3 | 4 })}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value={2}>2열</option>
            <option value={3}>3열</option>
            <option value={4}>4열</option>
          </select>
        </div>
        <div className={`grid gap-2 grid-cols-${d.columns}`}>
          {d.images.map((img: { url: string; alt?: string; caption?: string }, idx: number) => (
            <div key={idx} className="relative group/img border border-gray-200 rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? ""} className="w-full h-20 object-cover" />
              <button
                type="button"
                onClick={() => {
                  const imgs = [...d.images];
                  imgs.splice(idx, 1);
                  onChange({ ...d, images: imgs });
                }}
                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded opacity-0 group-hover/img:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 text-gray-400 hover:text-blue-400 text-xs">
            <Plus className="w-5 h-5 mb-1" />
            추가
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                let updated = [...d.images];
                for (const f of files) {
                  const url = await uploadImage(f);
                  if (url) updated = [...updated, { url, alt: "" }];
                }
                onChange({ ...d, images: updated });
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  // ── video ──
  if (data.type === "video") {
    const d = data as VideoSection;
    const getYtThumbnail = (url: string) => {
      const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
      return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
    };
    const thumb = d.url ? getYtThumbnail(d.url) : null;
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600">YouTube / Vimeo URL</label>
          <input
            type="text"
            value={d.url}
            onChange={(e) => onChange({ ...d, url: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="YouTube thumbnail" className="h-28 rounded border border-gray-200 object-cover" />
        )}
        <div>
          <label className="text-xs font-medium text-gray-600">캡션</label>
          <input
            type="text"
            value={d.caption ?? ""}
            onChange={(e) => onChange({ ...d, caption: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
    );
  }

  // ── quote ──
  if (data.type === "quote") {
    const d = data as QuoteSection;
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600">인용 텍스트</label>
          <textarea
            value={d.text}
            onChange={(e) => onChange({ ...d, text: e.target.value })}
            rows={3}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="인용 내용을 입력하세요"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">작성자</label>
          <input
            type="text"
            value={d.author ?? ""}
            onChange={(e) => onChange({ ...d, author: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="홍길동"
          />
        </div>
      </div>
    );
  }

  // ── callout ──
  if (data.type === "callout") {
    const d = data as CalloutSection;
    const variantLabels: Record<CalloutSection["variant"], string> = {
      info: "정보",
      warning: "주의",
      tip: "팁",
      important: "중요",
    };
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">유형</label>
            <select
              value={d.variant}
              onChange={(e) =>
                onChange({ ...d, variant: e.target.value as CalloutSection["variant"] })
              }
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              {(Object.keys(variantLabels) as CalloutSection["variant"][]).map((v) => (
                <option key={v} value={v}>{variantLabels[v]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">제목</label>
            <input
              type="text"
              value={d.title ?? ""}
              onChange={(e) => onChange({ ...d, title: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
              placeholder="강조 제목"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">내용</label>
          <TiptapEditor
            content={d.html}
            onChange={(html) => onChange({ ...d, html })}
            placeholder="내용을 입력하세요..."
            minHeight="80px"
            compact
          />
        </div>
      </div>
    );
  }

  // ── divider ──
  if (data.type === "divider") {
    const d = data as DividerSection;
    return (
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-600">스타일</label>
        <select
          value={d.style ?? "solid"}
          onChange={(e) => onChange({ ...d, style: e.target.value as DividerSection["style"] })}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm"
        >
          <option value="solid">실선</option>
          <option value="dashed">점선</option>
          <option value="dotted">점점선</option>
        </select>
        <div className="flex-1">
          <hr style={{ borderStyle: d.style ?? "solid", borderColor: "#d1d5db" }} />
        </div>
      </div>
    );
  }

  // ── faq ──
  if (data.type === "faq") {
    const d = data as FaqSection;
    return (
      <div className="space-y-3">
        {d.items.map((item: { question: string; answer: string }, idx: number) => (
          <div key={idx} className="border border-gray-200 rounded p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium w-5">Q{idx + 1}</span>
              <input
                type="text"
                value={item.question}
                onChange={(e) => {
                  const items = d.items.map(
                    (it: { question: string; answer: string }, i: number) =>
                      i === idx ? { ...it, question: e.target.value } : it
                  );
                  onChange({ ...d, items });
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="질문"
              />
              <button
                type="button"
                onClick={() => {
                  const items = d.items.filter(
                    (_: { question: string; answer: string }, i: number) => i !== idx
                  );
                  onChange({ ...d, items });
                }}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 font-medium w-5 pt-2">A</span>
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const items = d.items.map(
                    (it: { question: string; answer: string }, i: number) =>
                      i === idx ? { ...it, answer: e.target.value } : it
                  );
                  onChange({ ...d, items });
                }}
                rows={2}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="답변"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...d, items: [...d.items, { question: "", answer: "" }] })}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" /> Q&A 추가
        </button>
      </div>
    );
  }

  // ── features ──
  if (data.type === "features") {
    const d = data as FeaturesSection;
    type FeatureItem = { icon?: string; title: string; description: string };
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600">열 수</label>
          <select
            value={d.columns}
            onChange={(e) => onChange({ ...d, columns: Number(e.target.value) as 2 | 3 | 4 })}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value={2}>2열</option>
            <option value={3}>3열</option>
            <option value={4}>4열</option>
          </select>
        </div>
        <div className="space-y-2">
          {d.items.map((item: FeatureItem, idx: number) => (
            <div key={idx} className="flex items-center gap-2 border border-gray-200 rounded p-2">
              <input
                type="text"
                value={item.icon ?? ""}
                onChange={(e) => {
                  const items = d.items.map((it: FeatureItem, i: number) =>
                    i === idx ? { ...it, icon: e.target.value } : it
                  );
                  onChange({ ...d, items });
                }}
                className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                placeholder="✨"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => {
                  const items = d.items.map((it: FeatureItem, i: number) =>
                    i === idx ? { ...it, title: e.target.value } : it
                  );
                  onChange({ ...d, items });
                }}
                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="제목"
              />
              <input
                type="text"
                value={item.description}
                onChange={(e) => {
                  const items = d.items.map((it: FeatureItem, i: number) =>
                    i === idx ? { ...it, description: e.target.value } : it
                  );
                  onChange({ ...d, items });
                }}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="설명"
              />
              <button
                type="button"
                onClick={() => {
                  const items = d.items.filter((_: FeatureItem, i: number) => i !== idx);
                  onChange({ ...d, items });
                }}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({ ...d, items: [...d.items, { icon: "✨", title: "", description: "" }] })
          }
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" /> 카드 추가
        </button>
      </div>
    );
  }

  // ── banner ──
  if (data.type === "banner") {
    const d = data as BannerSection;
    return (
      <div className="space-y-3">
        <ImageUploadField
          url={d.backgroundUrl}
          onChange={(backgroundUrl) => onChange({ ...d, backgroundUrl })}
          label="배경 이미지"
          uploadImage={uploadImage}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">제목</label>
            <input
              type="text"
              value={d.title}
              onChange={(e) => onChange({ ...d, title: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
              placeholder="배너 제목"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">오버레이</label>
            <select
              value={d.overlay ?? "dark"}
              onChange={(e) => onChange({ ...d, overlay: e.target.value as BannerSection["overlay"] })}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="none">없음</option>
              <option value="light">밝게</option>
              <option value="dark">어둡게</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">부제목</label>
          <input
            type="text"
            value={d.subtitle ?? ""}
            onChange={(e) => onChange({ ...d, subtitle: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="배너 부제목"
          />
        </div>
      </div>
    );
  }

  // ── table ──
  if (data.type === "table") {
    const d = data as TableSection;
    const setHeaders = (headers: string[]) => onChange({ ...d, headers });
    const setRows = (rows: string[][]) => onChange({ ...d, rows });

    const addCol = () => {
      setHeaders([...d.headers, `열${d.headers.length + 1}`]);
      setRows(d.rows.map((row: string[]) => [...row, ""]));
    };
    const removeCol = (ci: number) => {
      setHeaders(d.headers.filter((_: string, i: number) => i !== ci));
      setRows(d.rows.map((row: string[]) => row.filter((_: string, i: number) => i !== ci)));
    };
    const addRow = () => setRows([...d.rows, Array(d.headers.length).fill("")]);
    const removeRow = (ri: number) =>
      setRows(d.rows.filter((_: string[], i: number) => i !== ri));

    return (
      <div className="space-y-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {d.headers.map((h: string, ci: number) => (
                <th key={ci} className="border border-gray-300 bg-gray-50 p-0">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => {
                        const hs = [...d.headers];
                        hs[ci] = e.target.value;
                        setHeaders(hs);
                      }}
                      className="flex-1 px-2 py-1.5 bg-transparent font-medium text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeCol(ci)}
                      className="px-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="border border-gray-300 bg-gray-50 w-8">
                <button
                  type="button"
                  onClick={addCol}
                  className="w-full h-full flex items-center justify-center text-gray-400 hover:text-blue-600 py-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((row: string[], ri: number) => (
              <tr key={ri}>
                {row.map((cell: string, ci: number) => (
                  <td key={ci} className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => {
                        const rows = d.rows.map((r: string[], rIdx: number) =>
                          rIdx === ri
                            ? r.map((c: string, cIdx: number) =>
                                cIdx === ci ? e.target.value : c
                              )
                            : r
                        );
                        setRows(rows);
                      }}
                      className="w-full px-2 py-1.5 bg-transparent"
                    />
                  </td>
                ))}
                <td className="border border-gray-300 w-8">
                  <button
                    type="button"
                    onClick={() => removeRow(ri)}
                    className="w-full flex items-center justify-center text-gray-400 hover:text-red-500 py-1.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" /> 행 추가
        </button>
      </div>
    );
  }

  // ── buttonGroup ──
  if (data.type === "buttonGroup") {
    const d = data as ButtonGroupSection;
    type BtnItem = { label: string; url: string; variant: "primary" | "secondary" | "outline" };
    const alignLabels: Record<ButtonGroupSection["align"], string> = {
      left: "왼쪽",
      center: "가운데",
      right: "오른쪽",
    };
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600">정렬</label>
          <select
            value={d.align}
            onChange={(e) => onChange({ ...d, align: e.target.value as ButtonGroupSection["align"] })}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            {(Object.keys(alignLabels) as ButtonGroupSection["align"][]).map((a) => (
              <option key={a} value={a}>{alignLabels[a]}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          {d.buttons.map((btn: BtnItem, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={btn.label}
                onChange={(e) => {
                  const buttons = d.buttons.map((b: BtnItem, i: number) =>
                    i === idx ? { ...b, label: e.target.value } : b
                  );
                  onChange({ ...d, buttons });
                }}
                className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="버튼 텍스트"
              />
              <input
                type="text"
                value={btn.url}
                onChange={(e) => {
                  const buttons = d.buttons.map((b: BtnItem, i: number) =>
                    i === idx ? { ...b, url: e.target.value } : b
                  );
                  onChange({ ...d, buttons });
                }}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="https://..."
              />
              <select
                value={btn.variant}
                onChange={(e) => {
                  const buttons = d.buttons.map((b: BtnItem, i: number) =>
                    i === idx ? { ...b, variant: e.target.value as BtnItem["variant"] } : b
                  );
                  onChange({ ...d, buttons });
                }}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm"
              >
                <option value="primary">기본</option>
                <option value="secondary">보조</option>
                <option value="outline">아웃라인</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const buttons = d.buttons.filter((_: BtnItem, i: number) => i !== idx);
                  onChange({ ...d, buttons });
                }}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...d,
              buttons: [...d.buttons, { label: "버튼", url: "", variant: "primary" }],
            })
          }
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" /> 버튼 추가
        </button>
      </div>
    );
  }

  // ── spacer ──
  if (data.type === "spacer") {
    const d = data as SpacerSection;
    const heightLabels: Record<SpacerSection["height"], string> = {
      sm: "작게 (16px)",
      md: "보통 (32px)",
      lg: "크게 (48px)",
      xl: "아주 크게 (64px)",
    };
    return (
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-600">높이</label>
        <select
          value={d.height}
          onChange={(e) => onChange({ ...d, height: e.target.value as SpacerSection["height"] })}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm"
        >
          {(Object.keys(heightLabels) as SpacerSection["height"][]).map((h) => (
            <option key={h} value={h}>{heightLabels[h]}</option>
          ))}
        </select>
        <div
          className="flex-1 bg-gray-100 rounded border border-dashed border-gray-300"
          style={{
            height:
              d.height === "sm" ? 16 : d.height === "md" ? 32 : d.height === "lg" ? 48 : 64,
          }}
        />
      </div>
    );
  }

  return <p className="text-sm text-gray-400">알 수 없는 섹션 타입: {(data as any).type}</p>;
}

// ─── 팔레트 그룹 ──────────────────────────────────────────────────────────────
// ─── SectionPreview (미리보기 렌더러) ──────────────────────────────────────────
function SectionPreview({ sections }: { sections: ContentSection[] }) {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Eye className="w-8 h-8 mb-3 opacity-40" />
        <p className="text-sm">표시할 섹션이 없습니다. 편집 모드에서 섹션을 추가하세요.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl p-8 space-y-6"
      style={{
        // 웹 CSS 변수 시뮬레이션
        "--fg": "#1a1a1a",
        "--muted": "#6b7280",
        "--brand": "#2563eb",
        "--border": "#e5e7eb",
        "--surface": "#f9fafb",
      } as React.CSSProperties}
    >
      {sorted.map((section) => (
        <PreviewBlock key={section.id} data={section.data} />
      ))}
    </div>
  );
}

function PreviewBlock({ data }: { data: ContentSectionData }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  switch (data.type) {
    case "text":
      return (
        <div className="prose prose-gray max-w-none">
          <div
            className="text-base text-[color:var(--muted)] leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        </div>
      );

    case "image": {
      if (!data.url) return <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">이미지 없음</div>;
      const wClass = data.width === "medium" ? "max-w-[60%]" : data.width === "large" ? "max-w-[80%]" : "max-w-full";
      return (
        <figure className={`mx-auto ${wClass}`}>
          <img src={data.url} alt={data.alt ?? ""} className="w-full rounded-xl object-cover" />
          {data.caption && <figcaption className="mt-2 text-center text-sm text-[color:var(--muted)]">{data.caption}</figcaption>}
        </figure>
      );
    }

    case "imageText": {
      const isLeft = data.imagePosition === "left";
      const imgEl = (
        <div className="w-full md:w-1/2 flex-shrink-0">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.imageAlt ?? ""} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">이미지 없음</div>
          )}
        </div>
      );
      const txtEl = (
        <div className="w-full md:w-1/2 flex items-center">
          <div className="prose prose-gray max-w-none text-base text-[color:var(--muted)] leading-[1.6]" dangerouslySetInnerHTML={{ __html: data.html }} />
        </div>
      );
      return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {isLeft ? imgEl : txtEl}
          {isLeft ? txtEl : imgEl}
        </div>
      );
    }

    case "gallery": {
      const colClass = data.columns === 2 ? "grid-cols-2" : data.columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3";
      return (
        <div className={`grid ${colClass} gap-3`}>
          {data.images.length === 0 ? (
            <div className="col-span-full bg-gray-100 rounded-xl h-32 flex items-center justify-center text-gray-400 text-sm">이미지를 추가하세요</div>
          ) : (
            data.images.map((img, i) => (
              <figure key={i} className="overflow-hidden rounded-xl">
                <img src={img.url} alt={img.alt ?? ""} className="w-full h-48 object-cover" />
                {img.caption && <figcaption className="mt-1 text-center text-xs text-[color:var(--muted)]">{img.caption}</figcaption>}
              </figure>
            ))
          )}
        </div>
      );
    }

    case "video": {
      const parseVideoUrl = (url: string) => {
        const yt = url.match(/youtube\.com\/watch\?v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
        if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
        const vim = url.match(/vimeo\.com\/(\d+)/);
        if (vim) return `https://player.vimeo.com/video/${vim[1]}`;
        return null;
      };
      const embedUrl = data.url ? parseVideoUrl(data.url) : null;
      if (!embedUrl) return <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">동영상 URL을 입력하세요</div>;
      return (
        <figure>
          <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden bg-black">
            <iframe src={embedUrl} title="동영상" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
          </div>
          {data.caption && <figcaption className="mt-2 text-center text-sm text-[color:var(--muted)]">{data.caption}</figcaption>}
        </figure>
      );
    }

    case "quote":
      return (
        <blockquote className="border-l-4 border-[color:var(--brand)] pl-5 py-2">
          <p className="text-base italic text-[color:var(--fg)] leading-[1.7]">{data.text || "인용문을 입력하세요..."}</p>
          {data.author && <cite className="block mt-2 text-sm text-[color:var(--muted)] not-italic">— {data.author}</cite>}
        </blockquote>
      );

    case "callout": {
      const vMap: Record<string, { bg: string; border: string; icon: string; color: string }> = {
        info: { bg: "bg-blue-50", border: "border-blue-300", icon: "ℹ️", color: "text-blue-600" },
        warning: { bg: "bg-yellow-50", border: "border-yellow-300", icon: "⚠️", color: "text-yellow-600" },
        tip: { bg: "bg-green-50", border: "border-green-300", icon: "💡", color: "text-green-600" },
        important: { bg: "bg-red-50", border: "border-red-300", icon: "🚨", color: "text-red-600" },
      };
      const v = vMap[data.variant] ?? vMap.info;
      return (
        <div className={`${v.bg} border ${v.border} rounded-xl p-5`}>
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5">{v.icon}</span>
            <div className="flex-1 min-w-0">
              {data.title && <p className={`font-semibold mb-1 ${v.color}`}>{data.title}</p>}
              <div className="text-sm text-[color:var(--fg)] leading-[1.6]" dangerouslySetInnerHTML={{ __html: data.html }} />
            </div>
          </div>
        </div>
      );
    }

    case "divider": {
      const sClass = data.style === "dashed" ? "border-dashed" : data.style === "dotted" ? "border-dotted" : "border-solid";
      return <hr className={`border-t ${sClass} border-[color:var(--border)]`} />;
    }

    case "faq":
      return (
        <div className="flex flex-col divide-y divide-[color:var(--border)] rounded-xl border border-[color:var(--border)] overflow-hidden">
          {data.items.map((item, i) => {
            const isOpen = faqOpen === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[color:var(--surface)] transition-colors"
                >
                  <span className="font-medium text-[color:var(--fg)] text-sm">{item.question || "질문을 입력하세요..."}</span>
                  <span className={`text-[color:var(--muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1">
                    <p className="text-sm text-[color:var(--muted)] leading-[1.7] whitespace-pre-wrap">{item.answer || "답변을 입력하세요..."}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );

    case "features": {
      const colClass = data.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : data.columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3";
      return (
        <div className={`grid ${colClass} gap-4`}>
          {data.items.map((item, i) => (
            <div key={i} className="bg-[color:var(--surface)] rounded-xl p-5 flex flex-col gap-2">
              {item.icon && <span className="text-2xl leading-none">{item.icon}</span>}
              <p className="font-semibold text-[color:var(--fg)]">{item.title || "제목"}</p>
              <p className="text-sm text-[color:var(--muted)] leading-[1.6]">{item.description || "설명"}</p>
            </div>
          ))}
        </div>
      );
    }

    case "banner": {
      const overlayClass = data.overlay === "light" ? "bg-white/50" : data.overlay === "none" ? "" : "bg-black/50";
      const textColor = data.overlay === "light" ? "text-gray-900" : "text-white";
      return (
        <div
          className="relative w-full rounded-2xl overflow-hidden min-h-[200px] flex items-center justify-center"
          style={data.backgroundUrl ? { backgroundImage: `url(${data.backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundColor: "#e5e7eb" }}
        >
          <div className={`absolute inset-0 ${overlayClass}`} />
          <div className="relative z-10 text-center px-6 py-12">
            <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>{data.title || "배너 제목"}</h3>
            {data.subtitle && <p className={`text-base ${data.overlay === "light" ? "text-gray-600" : "text-white/80"}`}>{data.subtitle}</p>}
          </div>
        </div>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[color:var(--surface)]">
                {data.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-[color:var(--fg)] border-b border-[color:var(--border)]">{h || "헤더"}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[color:var(--border)] last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-[color:var(--muted)]">{cell || "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "buttonGroup": {
      const alignClass = data.align === "right" ? "justify-end" : data.align === "center" ? "justify-center" : "justify-start";
      return (
        <div className={`flex flex-wrap gap-3 ${alignClass}`}>
          {data.buttons.map((btn, i) => {
            const variantClass = btn.variant === "primary"
              ? "bg-[color:var(--brand)] text-white"
              : btn.variant === "secondary"
              ? "bg-[color:var(--surface)] text-[color:var(--fg)]"
              : "border border-[color:var(--border)] text-[color:var(--fg)]";
            return (
              <span key={i} className={`inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium ${variantClass}`}>
                {btn.label || "버튼"}
              </span>
            );
          })}
        </div>
      );
    }

    case "spacer": {
      const hMap: Record<string, string> = { sm: "h-4", md: "h-8", lg: "h-12", xl: "h-16" };
      return <div className={`${hMap[data.height] ?? "h-8"} bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-300`}>여백 ({data.height})</div>;
    }

    default:
      return null;
  }
}

const GROUPS = ["기본", "미디어", "레이아웃", "고급"] as const;

// ─── ContentTab ───────────────────────────────────────────────────────────────
export function ContentTab({ formData, updateField }: Props) {
  const { authHeaders } = useAdminAuth();
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "products/content");
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: authHeaders as any,
          body: fd,
        });
        const data = await res.json();
        return data.success ? data.url : null;
      } catch {
        return null;
      }
    },
    [authHeaders]
  );

  const sections: ContentSection[] = formData.contentSections ?? [];

  const setSections = (next: ContentSection[]) => {
    updateField(
      "contentSections",
      next.map((s, i) => ({ ...s, sortOrder: i }))
    );
  };

  const addSection = (type: SectionType) => {
    const newSection: ContentSection = {
      id: crypto.randomUUID(),
      sortOrder: sections.length,
      data: createDefaultSectionData(type),
    };
    setSections([...sections, newSection]);
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, data: ContentSectionData) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, data } : s)));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...sections];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSections(next);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const next = [...sections];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSections(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 포함/불포함사항 헬퍼
  const addItem = (field: string) =>
    updateField(field, [...(formData[field] || []), ""]);
  const updateItem = (field: string, index: number, value: string) => {
    const items = [...(formData[field] || [])];
    items[index] = value;
    updateField(field, items);
  };
  const removeItem = (field: string, index: number) => {
    const items = [...(formData[field] || [])];
    items.splice(index, 1);
    updateField(field, items);
  };

  return (
    <div className="space-y-6">
      {/* 상품 요약 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상품 요약</label>
        <textarea
          value={formData.excerpt || ""}
          onChange={(e) => updateField("excerpt", e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="상품 목록에 표시될 짧은 소개"
        />
      </div>

      {/* 섹션 빌더 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">상품 소개 (섹션 빌더)</label>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "editor"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              편집
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              미리보기
            </button>
          </div>
        </div>

        {viewMode === "preview" ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-[11px] text-gray-400 ml-2">웹사이트 미리보기</span>
            </div>
            <div className="bg-[#FAFAFA] p-6">
              <SectionPreview sections={sections} />
            </div>
          </div>
        ) : (
        <div className="flex gap-4">
          {/* 캔버스 */}
          <div className="flex-[3] min-w-0">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-16 text-gray-400">
                <Pencil className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm">우측에서 섹션을 클릭하여 추가하세요</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        index={index}
                        total={sections.length}
                        onMoveUp={() => moveUp(index)}
                        onMoveDown={() => moveDown(index)}
                        onDelete={() => deleteSection(section.id)}
                      >
                        <SectionEditor
                          section={section}
                          onChange={(data) => updateSection(section.id, data)}
                          uploadImage={uploadImage}
                        />
                      </SortableSection>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* 팔레트 */}
          <div className="flex-1 min-w-0">
            <div className="sticky top-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">섹션 추가</p>
              </div>
              <div className="p-2 space-y-3 max-h-[600px] overflow-y-auto">
                {GROUPS.map((group) => {
                  const items = SECTION_PALETTE.filter(
                    (p: { group: string }) => p.group === group
                  );
                  return (
                    <div key={group}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">
                        {group}
                      </p>
                      <div className="space-y-1">
                        {items.map((item: { type: SectionType; label: string; icon: string; description: string }) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => addSection(item.type)}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 text-left transition-colors group/item"
                          >
                            <span className="text-gray-400 group-hover/item:text-blue-500 flex-shrink-0">
                              {ICON_MAP[item.icon] ?? <Plus className="w-4 h-4" />}
                            </span>
                            <span>
                              <span className="block text-xs font-medium text-gray-700 group-hover/item:text-blue-700">
                                {item.label}
                              </span>
                              <span className="block text-[10px] text-gray-400 leading-tight">
                                {item.description}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* 포함사항 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">포함사항</label>
          <button
            onClick={() => addItem("inclusions")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> 추가
          </button>
        </div>
        <div className="space-y-2">
          {(formData.inclusions || []).map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem("inclusions", idx, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="왕복 항공료"
              />
              <button
                onClick={() => removeItem("inclusions", idx)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!formData.inclusions || formData.inclusions.length === 0) && (
            <p className="text-sm text-gray-400">포함사항을 추가해주세요</p>
          )}
        </div>
      </div>

      {/* 불포함사항 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">불포함사항</label>
          <button
            onClick={() => addItem("exclusions")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> 추가
          </button>
        </div>
        <div className="space-y-2">
          {(formData.exclusions || []).map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem("exclusions", idx, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="여행자보험"
              />
              <button
                onClick={() => removeItem("exclusions", idx)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!formData.exclusions || formData.exclusions.length === 0) && (
            <p className="text-sm text-gray-400">불포함사항을 추가해주세요</p>
          )}
        </div>
      </div>
    </div>
  );
}
