"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  allowMultiple?: boolean;
}

export function Accordion({
  items,
  defaultOpen,
  allowMultiple = false,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    defaultOpen ? new Set([defaultOpen]) : new Set(),
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="divide-y divide-[color:var(--border)]">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between py-4 text-sm font-medium text-[color:var(--fg)] hover:text-[color:var(--fg)]/80 transition-colors text-left"
            >
              {item.title}
              <ChevronDown
                className={`w-4 h-4 text-[color:var(--muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] pb-4" : "max-h-0"}`}
            >
              <div className="text-sm text-[color:var(--muted)] leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
