"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Upload, X, Loader2, Save } from "lucide-react";
import Select from "@/components/ui/Select";

const IMAGE_TYPES = [
  { value: "THUMBNAIL", label: "썸네일" },
  { value: "DETAIL", label: "상세" },
  { value: "GOLF_COURSE", label: "골프장" },
  { value: "HOTEL", label: "호텔" },
  { value: "FOOD", label: "식사" },
];

interface Props {
  productId?: string;
  images: any[];
}

export function ImagesTab({ productId, images: initialImages }: Props) {
  const { authHeaders } = useAdminAuth();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = () => setHasChanges(true);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: authHeaders as any,
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          setImages((prev) => [
            ...prev,
            {
              id: `temp-${Date.now()}`,
              url: data.url,
              type: "DETAIL",
              sortOrder: prev.length,
              isThumbnail: prev.length === 0,
            },
          ]);
          markChanged();
        }
      }
    } catch (error) {
      alert("이미지 업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    markChanged();
  };

  const setThumbnail = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isThumbnail: i === index }))
    );
    markChanged();
  };

  const handleSave = async () => {
    if (!productId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({
          images: images.map((img, idx) => ({
            url: img.url,
            alt: img.alt || null,
            type: img.type || "DETAIL",
            isThumbnail: img.isThumbnail || false,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
        setHasChanges(false);
        alert("이미지가 저장되었습니다");
      } else {
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("이미지 저장 중 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>이미지를 관리하려면 먼저 상품을 저장해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 업로드 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" /> 업로드 중...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Upload className="w-8 h-8" />
              <span className="text-sm">이미지를 선택하거나 드래그하세요</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP (최대 10MB)</span>
            </div>
          )}
        </label>
      </div>

      {/* 이미지 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={img.id} className="relative group rounded-lg overflow-hidden border">
            <img src={img.url} alt="" referrerPolicy="no-referrer" className="w-full aspect-[4/3] object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-2 bg-white">
              <div className="flex items-center justify-between">
                {/* 이미지 타입 선택 */}
                <Select
                  value={img.type || "DETAIL"}
                  onChange={(val) => {
                    setImages((prev) =>
                      prev.map((i, j) => (j === idx ? { ...i, type: val } : i))
                    );
                    markChanged();
                  }}
                  options={IMAGE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                  className="w-28"
                />
                <button
                  onClick={() => setThumbnail(idx)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    img.isThumbnail
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {img.isThumbnail ? "대표" : "대표설정"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      {images.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
            ) : (
              <><Save className="w-4 h-4" /> 이미지 저장</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
