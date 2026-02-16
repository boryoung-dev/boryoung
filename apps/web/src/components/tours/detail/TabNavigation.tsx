"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const tabs = [
  { id: "overview", label: "개요" },
  { id: "itinerary", label: "일정" },
  { id: "inclusions", label: "포함사항" },
  { id: "reviews", label: "리뷰" },
];

export function TabNavigation() {
  const activeSection = useIntersectionObserver(
    tabs.map((t) => t.id)
  );

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 140; // sticky 헤더 + 탭 높이
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-16 z-30 bg-[color:var(--bg)] border-b border-[color:var(--border)] shadow-sm">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === tab.id
                  ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                  : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--fg)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
