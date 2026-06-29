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
  Sun,
  Palmtree,
  Waves,
  Compass,
  Mountain,
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  plane: <Plane className="w-6 h-6" strokeWidth={1.7} />,
  flag: <Flag className="w-6 h-6" strokeWidth={1.7} />,
  tag: <Tag className="w-6 h-6" strokeWidth={1.7} />,
  star: <Star className="w-6 h-6" strokeWidth={1.7} />,
  users: <Users className="w-6 h-6" strokeWidth={1.7} />,
  clock: <Clock className="w-6 h-6" strokeWidth={1.7} />,
  map: <MapPin className="w-6 h-6" strokeWidth={1.7} />,
  globe: <Globe className="w-6 h-6" strokeWidth={1.7} />,
  flame: <Flame className="w-6 h-6" strokeWidth={1.7} />,
  crown: <Crown className="w-6 h-6" strokeWidth={1.7} />,
  calendar: <CalendarDays className="w-6 h-6" strokeWidth={1.7} />,
  sun: <Sun className="w-6 h-6" strokeWidth={1.7} />,
  palmtree: <Palmtree className="w-6 h-6" strokeWidth={1.7} />,
  waves: <Waves className="w-6 h-6" strokeWidth={1.7} />,
  compass: <Compass className="w-6 h-6" strokeWidth={1.7} />,
  mountain: <Mountain className="w-6 h-6" strokeWidth={1.7} />,
};

const DEFAULT_ICON = ICONS.globe;

// 국가명 기반 아이콘 폴백 (DB에서 iconName이 "globe"로 설정된 경우 국기 이모지로 대체)
const COUNTRY_ICONS: Record<string, React.ReactNode> = {
  "일본": <span className="text-2xl leading-none">🇯🇵</span>,
  "태국": <span className="text-2xl leading-none">🇹🇭</span>,
  "베트남": <span className="text-2xl leading-none">🇻🇳</span>,
  "대만": <span className="text-2xl leading-none">🇹🇼</span>,
  "괌사이판": <span className="text-2xl leading-none">🇬🇺</span>,
  "괌·사이판": <span className="text-2xl leading-none">🇬🇺</span>,
  "몽골": <span className="text-2xl leading-none">🇲🇳</span>,
  "국내·제주": <MapPin className="w-6 h-6" strokeWidth={1.7} />,
  "국내/제주": <MapPin className="w-6 h-6" strokeWidth={1.7} />,
  "국내제주": <MapPin className="w-6 h-6" strokeWidth={1.7} />,
  "단체여행": <Users className="w-6 h-6" strokeWidth={1.7} />,
};

export function QuickIconsSection(props: Extract<HomeSection, { type: "quickIcons" }>) {
  if (!props.isVisible) return null;

  return (
    <div className="w-full bg-white py-7 md:py-8">
      <div className="px-5 md:px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-y-5 gap-x-2 md:gap-4">
          {props.items.map((item, idx) => (
            <Link
              key={idx}
              href={item.linkUrl || "#"}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] flex items-center justify-center group-hover:bg-[color:var(--brand)]/8 group-hover:text-[color:var(--brand)] transition-colors duration-300">
                {ICONS[item.iconName]
                  ? ICONS[item.iconName]
                  : (COUNTRY_ICONS[item.label] || DEFAULT_ICON)}
              </div>
              <span className="text-sm md:text-base font-medium text-[color:var(--muted)] group-hover:text-[color:var(--fg)] transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
