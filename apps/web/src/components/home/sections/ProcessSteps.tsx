import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProcessStepsConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  if (!Icon || typeof Icon !== "function") return null;
  return <Icon className={className} />;
}

/** 프로세스 단계 섹션 */
export function ProcessSteps({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProcessStepsConfig;
  const style = cfg.style || {};
  const steps = cfg.steps || [];

  if (steps.length === 0 && !curation.title) return null;

  const textLight = style.textTheme === "light";
  const numColor = textLight ? "text-white/40" : "text-[color:var(--muted,#86868b)]";
  const titleColor = textLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const descColor = textLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]";
  const cardBorder = textLight
    ? "border-white/15"
    : "border-[color:var(--border,#d2d2d7)]";
  const arrowColor = textLight ? "text-white/30" : "text-[color:var(--muted,#86868b)]";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-10">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      {steps.length > 0 && (
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-1 items-center gap-3">
              <div
                className={`flex-1 p-5 rounded-2xl border ${cardBorder} h-full`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-3xl font-bold ${numColor}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step.icon && (
                    <DynamicIcon
                      name={step.icon}
                      className={`w-6 h-6 ${titleColor} opacity-70`}
                    />
                  )}
                </div>
                <h3 className={`text-base font-semibold ${titleColor}`}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className={`mt-1 text-sm leading-relaxed ${descColor}`}>
                    {step.description}
                  </p>
                )}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight
                  className={`hidden md:block w-5 h-5 flex-shrink-0 ${arrowColor}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
