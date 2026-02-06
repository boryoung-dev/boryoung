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
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {dest.key}
            <span className="ml-2 text-sm opacity-75">({dest.count})</span>
          </button>
        ))}
      </div>

      {selected !== '전체' && (
        <div className="mt-6 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{selected}</span> 상품 {destinations.find(d => d.key === selected)?.count}개
        </div>
      )}
    </div>
  );
}
