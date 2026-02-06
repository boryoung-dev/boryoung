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
      color: "text-blue-600 bg-blue-50",
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
      color: "text-green-600 bg-green-50",
    });
  }

  if (product.totalHoles) {
    cards.push({
      icon: Flag,
      label: "골프",
      value: `${product.totalHoles}홀`,
      color: "text-emerald-600 bg-emerald-50",
    });
  }

  if (product.airline) {
    cards.push({
      icon: Plane,
      label: "항공사",
      value: product.airline,
      color: "text-purple-600 bg-purple-50",
    });
  }

  if (product.departure) {
    cards.push({
      icon: MapPin,
      label: "출발지",
      value: product.departure,
      color: "text-orange-600 bg-orange-50",
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
      color: "text-red-600 bg-red-50",
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
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className={`p-2.5 rounded-lg ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">{card.label}</div>
              <div className="text-sm font-semibold text-gray-900">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
