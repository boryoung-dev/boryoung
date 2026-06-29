"use client";

import { Copy, CheckCircle2 } from "lucide-react";

const GUIDE_ITEMS = [
  "상품명에서 ‘(복사본)’을 새 상품명으로 변경",
  "국가/지역이 새 상품에 맞는지 확인",
  "판매가와 할인 표시 확인",
  "출발일정과 일정표 날짜 확인",
  "대표 이미지와 상세 이미지 확인",
  "바로 공개할 상품인지 비공개로 둘지 확인",
];

export function DuplicateProductGuide() {
  return (
    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white text-blue-600 shadow-sm">
          <Copy className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-blue-900">기존 상품을 복제해서 새 상품을 등록합니다</h2>
          <p className="text-xs text-blue-700 mt-1">
            원본의 이미지, 일정, 가격 옵션이 함께 들어왔습니다. 등록 전 아래 항목만 확인하면 실수를 줄일 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-3">
            {GUIDE_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
