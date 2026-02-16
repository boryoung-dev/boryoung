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
    <div className="space-y-6">
      {/* 포함사항 */}
      {inclusions && inclusions.length > 0 && (
        <div className="bg-white rounded-[32px] p-8">
          <h3 className="text-2xl font-bold text-[#18181B] mb-6">포함 사항</h3>
          <ul className="space-y-4">
            {inclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-base text-[#18181B]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 불포함사항 */}
      {exclusions && exclusions.length > 0 && (
        <div className="bg-[#FAFAFA] rounded-[32px] p-8">
          <h3 className="text-2xl font-bold text-[#18181B] mb-6">미포함 사항</h3>
          <ul className="space-y-4">
            {exclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center mt-0.5">
                  <X className="w-4 h-4 text-white" />
                </div>
                <span className="text-base text-[#18181B]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
