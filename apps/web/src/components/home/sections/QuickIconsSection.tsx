"use client";

import Link from "next/link";
import { HomeSection } from "@/lib/home/types";
import {
  Plane,
  Flag,
  Tag,
  Star,
  Users,
  Clock,
  MapPin,
  Globe,
  Flame,
  Crown,
  CalendarDays,
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  plane: <Plane className="w-5 h-5" strokeWidth={1.5} />,
  flag: <Flag className="w-5 h-5" strokeWidth={1.5} />,
  tag: <Tag className="w-5 h-5" strokeWidth={1.5} />,
  star: <Star className="w-5 h-5" strokeWidth={1.5} />,
  users: <Users className="w-5 h-5" strokeWidth={1.5} />,
  clock: <Clock className="w-5 h-5" strokeWidth={1.5} />,
  map: <MapPin className="w-5 h-5" strokeWidth={1.5} />,
  globe: <Globe className="w-5 h-5" strokeWidth={1.5} />,
  flame: <Flame className="w-5 h-5" strokeWidth={1.5} />,
  crown: <Crown className="w-5 h-5" strokeWidth={1.5} />,
  calendar: <CalendarDays className="w-5 h-5" strokeWidth={1.5} />,
};

const DEFAULT_ICON = ICONS.globe;

export function QuickIconsSection(props: Extract<HomeSection, { type: "quickIcons" }>) {
  if (!props.isVisible) return null;

  return (
    <div className="w-full bg-white py-6 border-b border-[color:var(--border)]">
      <div className="px-4 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-y-4 gap-x-2 md:gap-4">
          {props.items.map((item, idx) => (
            <Link
              key={idx}
              href={item.linkUrl || "#"}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[color:var(--surface)] text-[color:var(--muted)] flex items-center justify-center group-hover:bg-[color:var(--brand)]/5 group-hover:text-[color:var(--brand)] transition-all duration-200">
                {ICONS[item.iconName] || DEFAULT_ICON}
              </div>
              <span className="text-[11px] md:text-xs font-medium text-[color:var(--muted)] group-hover:text-[color:var(--fg)] transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
