"use client";

import { Images } from "lucide-react";

interface ImageGalleryProps {
  images: any[];
  onImageClick: (index: number) => void;
}

export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
  if (!images || images.length === 0) return null;

  // 최대 6개까지 그리드 표시
  const displayImages = images.slice(0, 6);
  const remaining = images.length - 6;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">사진</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {displayImages.map((img: any, idx: number) => (
          <button
            key={img.id}
            onClick={() => onImageClick(idx)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group"
          >
            <img
              src={img.url}
              alt={img.alt || ""}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

            {/* 마지막 이미지에 "+N 더보기" 표시 */}
            {idx === 5 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Images className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-lg font-bold">+{remaining}</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <button
          onClick={() => onImageClick(0)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          모든 사진 보기 ({images.length}장)
        </button>
      )}
    </div>
  );
}
