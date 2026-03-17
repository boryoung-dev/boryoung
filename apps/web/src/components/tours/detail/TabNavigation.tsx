"use client";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

const tabs = [
  { id: "intro", label: "상품 소개" },
  { id: "itinerary", label: "일정표" },
  { id: "inclusions", label: "포함사항" },
  { id: "reviews", label: "후기" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex items-center gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative py-4 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "text-[color:var(--fg)] font-semibold"
              : "text-[color:var(--muted)] hover:text-[color:var(--fg)]"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[color:var(--fg)]" />
          )}
        </button>
      ))}
    </div>
  );
}
