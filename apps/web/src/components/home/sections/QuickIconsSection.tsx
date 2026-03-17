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

// 아이콘 크기: w-5 h-5 → w-[18px] h-[18px] (약간 작게)
const ICONS: Record<string, React.ReactNode> = {
  plane: <Plane className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  flag: <Flag className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  tag: <Tag className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  star: <Star className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  users: <Users className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  clock: <Clock className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  map: <MapPin className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  globe: <Globe className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  flame: <Flame className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  crown: <Crown className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  calendar: <CalendarDays className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  sun: <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  palmtree: <Palmtree className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  waves: <Waves className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  compass: <Compass className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  mountain: <Mountain className="w-[18px] h-[18px]" strokeWidth={1.5} />,
};

const DEFAULT_ICON = ICONS.globe;

// 국가명 기반 아이콘 폴백 (DB에서 iconName이 "globe"로 설정된 경우 국기 이모지로 대체)
const COUNTRY_ICONS: Record<string, React.ReactNode> = {
  "일본": <span className="text-base leading-none">🇯🇵</span>,
  "태국": <span className="text-base leading-none">🇹🇭</span>,
  "베트남": <span className="text-base leading-none">🇻🇳</span>,
  "대만": <span className="text-base leading-none">🇹🇼</span>,
  "괌사이판": <span className="text-base leading-none">🇬🇺</span>,
  "괌·사이판": <span className="text-base leading-none">🇬🇺</span>,
  "몽골": <span className="text-base leading-none">🇲🇳</span>,
  "국내·제주": <MapPin className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  "국내/제주": <MapPin className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  "국내제주": <MapPin className="w-[18px] h-[18px]" strokeWidth={1.5} />,
  "단체여행": <Users className="w-[18px] h-[18px]" strokeWidth={1.5} />,
};

export function QuickIconsSection(props: Extract<HomeSection, { type: "quickIcons" }>) {
  if (!props.isVisible) return null;

  return (
    // border-b 제거, 여백으로 구분 / py-6 → py-5
    <div className="w-full bg-white py-5">
      <div className="px-4 max-w-[1200px] mx-auto">
        {/* gap 축소: gap-y-4 gap-x-2 → gap-y-3 gap-x-1 */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-y-3 gap-x-1 md:gap-3">
          {props.items.map((item, idx) => (
            <Link
              key={idx}
              href={item.linkUrl || "#"}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              {/* 아이콘 컨테이너: 정사각형 → 원형, 더 미니멀 */}
              <div className="w-12 h-12 rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] flex items-center justify-center group-hover:bg-[color:var(--brand)]/8 group-hover:text-[color:var(--brand)] transition-colors duration-300">
                {ICONS[item.iconName]
                  ? ICONS[item.iconName]
                  : (COUNTRY_ICONS[item.label] || DEFAULT_ICON)}
              </div>
              {/* 라벨: font-medium 제거 → font-normal, 색상 고정 */}
              <span className="text-[11px] font-normal text-[color:var(--muted)] group-hover:text-[color:var(--fg)] transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
