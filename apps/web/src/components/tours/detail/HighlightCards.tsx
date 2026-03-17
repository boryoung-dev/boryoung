"use client";

import { Calendar, Users, Plane, MapPin } from "lucide-react";
import type { TourProductDetail, HighlightCard } from "@/lib/types";

interface HighlightCardsProps {
  product: TourProductDetail;
}

export function HighlightCards({ product }: HighlightCardsProps) {
  const cards: HighlightCard[] = [];

  if (product.durationText) {
    cards.push({
      icon: Calendar,
      iconColor: "var(--muted)",
      iconBg: "var(--surface)",
      label: "여행 기간",
      value: product.durationText,
    });
  }

  if (product.destination) {
    cards.push({
      icon: MapPin,
      iconColor: "var(--muted)",
      iconBg: "var(--surface)",
      label: "여행지",
      value: product.destination,
    });
  }

  if (product.minPeople || product.maxPeople) {
    const people = product.minPeople && product.maxPeople
      ? `${product.minPeople}~${product.maxPeople}명`
      : product.minPeople
      ? `${product.minPeople}명 이상`
      : `최대 ${product.maxPeople}명`;
    cards.push({
      icon: Users,
      iconColor: "var(--muted)",
      iconBg: "var(--surface)",
      label: "최소 인원",
      value: people,
    });
  }

  if (product.airline) {
    cards.push({
      icon: Plane,
      iconColor: "var(--muted)",
      iconBg: "var(--surface)",
      label: "항공편",
      value: product.airline,
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-[color:var(--border)] px-5 py-4 flex items-center gap-3"
          >
            <Icon className="w-5 h-5 text-[color:var(--muted)] shrink-0" />
            <div className="min-w-0">
              <div className="text-[12px] text-[color:var(--muted)]">{card.label}</div>
              <div className="text-[15px] font-semibold text-[color:var(--fg)] truncate">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
