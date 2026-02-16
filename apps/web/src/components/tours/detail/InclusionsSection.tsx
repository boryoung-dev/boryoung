"use client";

import { Check, X } from "lucide-react";

interface InclusionsSectionProps {
  inclusions: string[] | null;
  exclusions: string[] | null;
}

export function InclusionsSection({ inclusions, exclusions }: InclusionsSectionProps) {
  if ((!inclusions || inclusions.length === 0) && (!exclusions || exclusions.length === 0)) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-6">포함/불포함 사항</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 포함사항 */}
        {inclusions && inclusions.length > 0 && (
          <div className="bg-[color:var(--surface)] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[color:var(--fg)] mb-4">포함사항</h3>
            <ul className="space-y-3">
              {inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-[color:var(--fg)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 불포함사항 */}
        {exclusions && exclusions.length > 0 && (
          <div className="bg-[color:var(--surface)] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[color:var(--fg)] mb-4">불포함사항</h3>
            <ul className="space-y-3">
              {exclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-400 rounded-full flex items-center justify-center mt-0.5">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-[color:var(--fg)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
