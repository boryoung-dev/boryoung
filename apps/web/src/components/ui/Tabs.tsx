"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabsProps) {
  return (
    <div
      className={`flex gap-6 border-b border-[color:var(--border)] ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "text-[color:var(--fg)]"
              : "text-[color:var(--muted)] hover:text-[color:var(--fg)]"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[color:var(--fg)] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
