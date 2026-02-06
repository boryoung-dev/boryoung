"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: any[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [currentIndex]);

  const prev = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  };

  const next = () => {
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* 닫기 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 카운터 */}
      <div className="absolute top-4 left-4 text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* 이전 */}
      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 p-2 text-white/70 hover:text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* 이미지 */}
      <div className="max-w-[90vw] max-h-[90vh]">
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.alt || ""}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>

      {/* 다음 */}
      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 p-2 text-white/70 hover:text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* 썸네일 바 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] px-4">
          {images.map((img: any, idx: number) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden ${
                idx === currentIndex
                  ? "ring-2 ring-white"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={img.url}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
