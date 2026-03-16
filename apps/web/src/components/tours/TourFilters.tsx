'use client';

import { useState } from 'react';

interface TourFiltersProps {
  destinations: Array<{ key: string; count: number }>;
}

export function TourFilters({ destinations }: TourFiltersProps) {
  const [selected, setSelected] = useState('전체');

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        {destinations.map((dest) => (
          <button
            key={dest.key}
            onClick={() => setSelected(dest.key)}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              selected === dest.key
                ? 'bg-[color:var(--brand)] text-white shadow-lg scale-105'
                : 'bg-white text-[color:var(--fg)] border border-[color:var(--border)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]'
            }`}
          >
            {dest.key}
            <span className="ml-2 text-sm opacity-75">({dest.count})</span>
          </button>
        ))}
      </div>

      {selected !== '전체' && (
        <div className="mt-6 text-sm text-[color:var(--muted)]">
          <span className="font-semibold text-[color:var(--fg)]">{selected}</span> 상품 {destinations.find(d => d.key === selected)?.count}개
        </div>
      )}
    </div>
  );
}
