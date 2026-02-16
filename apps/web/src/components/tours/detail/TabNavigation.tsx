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
      <div className="bg-[#F4F4F5] rounded-[28px] h-14 p-1 flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 h-full rounded-[24px] text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#8B5CF6] shadow-md font-semibold"
                : "bg-transparent text-[#71717A] font-medium hover:text-[#18181B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
