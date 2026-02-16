"use client";

import { Calendar, Users, Plane, MapPin, Flag, CircleDot } from "lucide-react";

interface HighlightCardsProps {
  product: any;
}

export function HighlightCards({ product }: HighlightCardsProps) {
  const cards = [];

  if (product.durationText) {
    cards.push({
      icon: Calendar,
      label: "여행 기간",
      value: product.durationText,
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
      label: "인원",
      value: people,
    });
  }

  if (product.totalHoles) {
    cards.push({
      icon: Flag,
      label: "골프",
      value: `${product.totalHoles}홀`,
    });
  }

  if (product.airline) {
    cards.push({
      icon: Plane,
      label: "항공사",
      value: product.airline,
    });
  }

  if (product.departure) {
    cards.push({
      icon: MapPin,
      label: "출발지",
      value: product.departure,
    });
  }

  if (product.difficulty) {
    const diffLabels: Record<string, string> = {
      BEGINNER: "초급",
      INTERMEDIATE: "중급",
      ADVANCED: "상급",
      ALL: "전체",
    };
    cards.push({
      icon: CircleDot,
      label: "난이도",
      value: diffLabels[product.difficulty] || product.difficulty,
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-4 bg-[color:var(--surface)] rounded-2xl"
          >
            <div className="p-2.5 rounded-lg text-[color:var(--brand)] bg-[color:var(--brand)]/10">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[color:var(--muted)]">{card.label}</div>
              <div className="text-sm font-semibold text-[color:var(--fg)]">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
