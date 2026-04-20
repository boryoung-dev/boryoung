import { ImageIcon } from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ImageGalleryConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** 이미지 갤러리 섹션 */
export function ImageGallery({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ImageGalleryConfig;
  const style = cfg.style || {};
  const images = cfg.images || [];
  const columns = (cfg.columns || 3) as 2 | 3 | 4;

  if (images.length === 0 && !curation.title) return null;

  const captionColor =
    style.textTheme === "light"
      ? "text-white/80"
      : "text-[color:var(--muted,#86868b)]";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      {images.length > 0 && (
        <div className={`grid grid-cols-2 ${COL_MAP[columns]} gap-3 md:gap-4`}>
          {images.map((img, i) => (
            <figure key={i} className="space-y-1.5">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[color:var(--surface,#f5f5f7)]">
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.caption || ""}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[color:var(--muted,#86868b)] opacity-40" />
                  </div>
                )}
              </div>
              {img.caption && (
                <figcaption className={`text-xs ${captionColor}`}>
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
