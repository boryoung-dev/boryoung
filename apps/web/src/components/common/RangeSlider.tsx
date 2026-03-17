"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  formatLabel?: (value: number) => string;
  className?: string;
}

export function RangeSlider({
  min, max, step = 1, minValue, maxValue, onChange,
  formatLabel = (v) => v.toLocaleString(),
  className = ""
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + percent * (max - min);
    return Math.round(raw / step) * step;
  }, [min, max, step]);

  const handlePointerDown = (type: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(type);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging) return;
    const val = getValueFromPosition(e.clientX);
    if (dragging === "min") {
      onChange(Math.min(val, maxValue - step), maxValue);
    } else {
      onChange(minValue, Math.max(val, minValue + step));
    }
  }, [dragging, getValueFromPosition, minValue, maxValue, onChange, step]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [dragging, handlePointerMove, handlePointerUp]);

  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(maxValue);

  return (
    <div className={className}>
      {/* 라벨 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[color:var(--fg)]">{formatLabel(minValue)}</span>
        <span className="text-[12px] text-[color:var(--muted)]">~</span>
        <span className="text-sm font-medium text-[color:var(--fg)]">{formatLabel(maxValue)}</span>
      </div>

      {/* 트랙 */}
      <div ref={trackRef} className="relative h-10 flex items-center cursor-pointer">
        {/* 배경 트랙 */}
        <div className="absolute w-full h-[3px] bg-[color:var(--border)] rounded-full" />

        {/* 활성 트랙 */}
        <div
          className="absolute h-[3px] bg-[color:var(--fg)] rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* 최소값 핸들 */}
        <div
          onPointerDown={handlePointerDown("min")}
          className={`absolute w-5 h-5 rounded-full bg-white border-2 border-[color:var(--fg)] shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md -translate-x-1/2 ${
            dragging === "min" ? "scale-110 shadow-md" : ""
          }`}
          style={{ left: `${minPercent}%` }}
        />

        {/* 최대값 핸들 */}
        <div
          onPointerDown={handlePointerDown("max")}
          className={`absolute w-5 h-5 rounded-full bg-white border-2 border-[color:var(--fg)] shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md -translate-x-1/2 ${
            dragging === "max" ? "scale-110 shadow-md" : ""
          }`}
          style={{ left: `${maxPercent}%` }}
        />
      </div>
    </div>
  );
}
