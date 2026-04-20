import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { GradientBannerConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 그라디언트 풀와이드 배너 */
export function GradientBanner({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as GradientBannerConfig;
  // 기본 스타일: 풀와이드 + 그라디언트 배경 + 라이트 텍스트 + 중앙 정렬
  const style = {
    fullWidth: true,
    textTheme: "light" as const,
    textAlign: "center" as const,
    background: {
      type: "gradient" as const,
      gradientFrom: "#3b82f6",
      gradientTo: "#1e40af",
      gradientDirection: "to-br" as const,
    },
    fontSize: { title: "xl" as const },
    ...(cfg.style || {}),
  };

  if (!curation.title && !curation.subtitle && !curation.description) {
    return null;
  }

  return (
    <SectionContainer style={style}>
      <div className="max-w-[900px] mx-auto px-4 md:px-6">
        <SectionHeading
          eyebrow={curation.subtitle}
          title={curation.title}
          description={curation.description}
          style={style}
        />
      </div>
    </SectionContainer>
  );
}
