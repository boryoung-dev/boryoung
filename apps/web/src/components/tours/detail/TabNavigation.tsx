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
    <div className="sticky top-16 z-30 bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
