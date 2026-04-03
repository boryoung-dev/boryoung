"use client";

import { ImageIcon } from "lucide-react";

interface Curation {
  title: string;
  subtitle?: string | null;
}

/** 배너 히어로 (2x2 그리드) 미리보기 */
export function BannerHeroPreview({ curation }: { curation: Curation }) {
  return (
    <section className="py-6">
      <div className="max-w-[1200px] mx-auto px-4">
        {curation.title && (
          <h2
            style={{ color: "var(--fg, #1d1d1f)" }}
            className="text-xl font-semibold tracking-tight mb-4"
          >
            {curation.title}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="relative aspect-[2/1] rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: "var(--surface, #f5f5f7)" }}
            >
              <div className="text-center">
                <ImageIcon
                  className="w-8 h-8 mx-auto mb-1"
                  style={{ color: "var(--muted, #86868b)", opacity: 0.4 }}
                />
                <p
                  style={{ color: "var(--muted, #86868b)" }}
                  className="text-[10px]"
                >
                  배너 {n}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          ))}
        </div>
        <p
          style={{ color: "var(--muted, #86868b)" }}
          className="text-[10px] mt-2 text-center"
        >
          배너는 별도 배너 관리에서 설정됩니다
        </p>
      </div>
    </section>
  );
}
