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
    <div className="py-1">
      <div className="bg-[color:var(--surface)] rounded-[28px] h-14 p-1 flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 h-full rounded-[24px] text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-[color:var(--brand)] shadow-md font-semibold"
                : "bg-transparent text-[color:var(--muted)] font-medium hover:text-[color:var(--fg)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
