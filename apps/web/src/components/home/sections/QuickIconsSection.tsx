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
  plane: <Plane className="w-6 h-6" strokeWidth={1.5} />,
  flag: <Flag className="w-6 h-6" strokeWidth={1.5} />,
  tag: <Tag className="w-6 h-6" strokeWidth={1.5} />,
  star: <Star className="w-6 h-6" strokeWidth={1.5} />,
  users: <Users className="w-6 h-6" strokeWidth={1.5} />,
  clock: <Clock className="w-6 h-6" strokeWidth={1.5} />,
  map: <MapPin className="w-6 h-6" strokeWidth={1.5} />,
  globe: <Globe className="w-6 h-6" strokeWidth={1.5} />,
  flame: <Flame className="w-6 h-6" strokeWidth={1.5} />,
  crown: <Crown className="w-6 h-6" strokeWidth={1.5} />,
  calendar: <CalendarDays className="w-6 h-6" strokeWidth={1.5} />,
};

const DEFAULT_ICON = ICONS.globe;

export function QuickIconsSection(props: Extract<HomeSection, { type: "quickIcons" }>) {
  if (!props.isVisible) return null;

  return (
    <div className="w-full bg-white py-10">
      <div className="px-4 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-y-6 gap-x-2 md:gap-6">
          {props.items.map((item, idx) => (
            <Link
              key={idx}
              href={item.linkUrl || "#"}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                {ICONS[item.iconName] || DEFAULT_ICON}
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
