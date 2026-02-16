"use client";

import { Calendar, Users, Plane, MapPin } from "lucide-react";

interface HighlightCardsProps {
  product: any;
}

interface HighlightCard {
  icon: any;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}

export function HighlightCards({ product }: HighlightCardsProps) {
  const cards: HighlightCard[] = [];

  if (product.durationText) {
    cards.push({
      icon: Calendar,
      iconColor: "#8B5CF6",
      iconBg: "rgba(139, 92, 246, 0.125)",
      label: "여행 기간",
      value: product.durationText,
    });
  }

  if (product.destination) {
    cards.push({
      icon: MapPin,
      iconColor: "#14B8A6",
      iconBg: "rgba(20, 184, 166, 0.125)",
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
      iconColor: "#F472B6",
      iconBg: "rgba(244, 114, 182, 0.125)",
      label: "최소 인원",
      value: people,
    });
  }

  if (product.airline) {
    cards.push({
      icon: Plane,
      iconColor: "#F59E0B",
      iconBg: "rgba(253, 176, 34, 0.125)",
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
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: card.iconBg }}
            >
              <Icon className="w-6 h-6" style={{ color: card.iconColor }} />
            </div>
            <div>
              <div className="text-sm text-[#71717A] mb-1">{card.label}</div>
              <div className="text-xl font-semibold text-[#18181B]">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
