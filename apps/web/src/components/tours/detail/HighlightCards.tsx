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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-[24px] p-6 flex flex-col gap-3"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-[color:var(--surface)]"
            >
              <Icon className="w-6 h-6 text-[color:var(--muted)]" />
            </div>
            <div>
              <div className="text-sm text-[color:var(--muted)] mb-1">{card.label}</div>
              <div className="text-xl font-semibold text-[color:var(--fg)]">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
