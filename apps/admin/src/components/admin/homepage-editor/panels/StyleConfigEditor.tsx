"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Upload } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export interface SectionStyleConfig {
  background?: {
    type: "transparent" | "color" | "gradient" | "image";
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: "to-r" | "to-br" | "to-b" | "to-bl";
    imageUrl?: string;
    imageOverlay?: number;
  };
  fullWidth?: boolean;
  verticalPadding?: "sm" | "md" | "lg" | "xl";
  textTheme?: "light" | "dark";
  textAlign?: "left" | "center" | "right";
  edgeFade?: boolean;
  fontSize?: {
    eyebrow?: "xs" | "sm" | "base";
    title?: "sm" | "md" | "lg" | "xl" | "2xl";
    description?: "sm" | "base" | "lg";
  };
}

interface StyleConfigEditorProps {
  value: SectionStyleConfig;
  onChange: (next: SectionStyleConfig) => void;
}

/** 공용 섹션 스타일 편집 아코디언 */
export function StyleConfigEditor({ value, onChange }: StyleConfigEditorProps) {
  const [open, setOpen] = useState(false);
  const { token } = useAdminAuth();
  const bg = value.background || { type: "transparent" as const };
  const fontSize = value.fontSize || {};

  const update = (patch: Partial<SectionStyleConfig>) => {
    onChange({ ...value, ...patch });
  };
  const updateBg = (patch: Partial<NonNullable<SectionStyleConfig["background"]>>) => {
    onChange({ ...value, background: { ...bg, ...patch } });
  };
  const updateFontSize = (patch: Partial<NonNullable<SectionStyleConfig["fontSize"]>>) => {
    onChange({ ...value, fontSize: { ...fontSize, ...patch } });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <span className="text-sm font-semibold text-gray-700">스타일 설정</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && (
        <div className="p-3 space-y-3 bg-white">
          {/* 배경 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              배경
            </label>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {(["transparent", "color", "gradient", "image"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateBg({ type: t })}
                  className={`px-2 py-1.5 text-xs rounded border ${
                    bg.type === t
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t === "transparent" && "투명"}
                  {t === "color" && "단색"}
                  {t === "gradient" && "그라디언트"}
                  {t === "image" && "이미지"}
                </button>
              ))}
            </div>
            {bg.type === "color" && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bg.color || "#ffffff"}
                  onChange={(e) => updateBg({ color: e.target.value })}
                  className="w-10 h-9 rounded border border-gray-200"
                />
                <input
                  type="text"
                  value={bg.color || ""}
                  onChange={(e) => updateBg({ color: e.target.value })}
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs"
                  placeholder="#ffffff"
                />
              </div>
            )}
            {bg.type === "gradient" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bg.gradientFrom || "#3b82f6"}
                    onChange={(e) => updateBg({ gradientFrom: e.target.value })}
                    className="w-9 h-8 rounded border border-gray-200"
                  />
                  <span className="text-xs text-gray-500">→</span>
                  <input
                    type="color"
                    value={bg.gradientTo || "#1e40af"}
                    onChange={(e) => updateBg({ gradientTo: e.target.value })}
                    className="w-9 h-8 rounded border border-gray-200"
                  />
                  <select
                    value={bg.gradientDirection || "to-br"}
                    onChange={(e) =>
                      updateBg({
                        gradientDirection: e.target.value as any,
                      })
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
                  >
                    <option value="to-r">→ 오른쪽</option>
                    <option value="to-br">↘ 우하단</option>
                    <option value="to-b">↓ 아래</option>
                    <option value="to-bl">↙ 좌하단</option>
                  </select>
                </div>
              </div>
            )}
            {bg.type === "image" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bg.imageUrl || ""}
                    onChange={(e) => updateBg({ imageUrl: e.target.value })}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs"
                    placeholder="이미지 URL"
                  />
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
                        fd.append("folder", "homepage");
                        try {
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` },
                            body: fd,
                          });
                          const data = await res.json();
                          if (data.success) updateBg({ imageUrl: data.url });
                        } catch {}
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    검정 오버레이: {((bg.imageOverlay || 0) * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={bg.imageOverlay || 0}
                    onChange={(e) =>
                      updateBg({ imageOverlay: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 풀와이드 */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">풀와이드 (좌우 끝까지)</span>
            <button
              type="button"
              onClick={() => update({ fullWidth: !value.fullWidth })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                value.fullWidth ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  value.fullWidth ? "translate-x-[18px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>

          {/* 엣지 페이드 */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">엣지 페이드</span>
            <button
              type="button"
              onClick={() => update({ edgeFade: !value.edgeFade })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                value.edgeFade ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  value.edgeFade ? "translate-x-[18px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>

          {/* 수직 패딩 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              수직 패딩
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(["sm", "md", "lg", "xl"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update({ verticalPadding: p })}
                  className={`px-2 py-1.5 text-xs rounded border ${
                    (value.verticalPadding || "lg") === p
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 텍스트 테마 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              텍스트 테마
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update({ textTheme: t })}
                  className={`px-2 py-1.5 text-xs rounded border ${
                    (value.textTheme || "dark") === t
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t === "dark" ? "어두움 (밝은 배경)" : "밝음 (어두운 배경)"}
                </button>
              ))}
            </div>
          </div>

          {/* 텍스트 정렬 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              텍스트 정렬
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => update({ textAlign: a })}
                  className={`px-2 py-1.5 text-xs rounded border ${
                    (value.textAlign || "left") === a
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {a === "left" ? "왼쪽" : a === "center" ? "중앙" : "오른쪽"}
                </button>
              ))}
            </div>
          </div>

          {/* 폰트 크기 */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                eyebrow
              </label>
              <select
                value={fontSize.eyebrow || "xs"}
                onChange={(e) => updateFontSize({ eyebrow: e.target.value as any })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
              >
                <option value="xs">XS</option>
                <option value="sm">SM</option>
                <option value="base">BASE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                타이틀
              </label>
              <select
                value={fontSize.title || "md"}
                onChange={(e) => updateFontSize({ title: e.target.value as any })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
              >
                <option value="sm">SM</option>
                <option value="md">MD</option>
                <option value="lg">LG</option>
                <option value="xl">XL</option>
                <option value="2xl">2XL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                설명
              </label>
              <select
                value={fontSize.description || "base"}
                onChange={(e) => updateFontSize({ description: e.target.value as any })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
              >
                <option value="sm">SM</option>
                <option value="base">BASE</option>
                <option value="lg">LG</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
