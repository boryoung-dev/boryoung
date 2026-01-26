"use client";

import { HomeSection } from "@/lib/home/types";

export function MagazineSection(props: Extract<HomeSection, { type: "magazine" }>) {
  if (!props.isVisible) return null;

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">{props.title}</h2>
            <a href="#" className="text-sm text-gray-500 font-medium hover:text-black">전체보기</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.items.map((item) => (
            <div key={item.id} className="group cursor-pointer flex gap-4 md:flex-col">
              <div className="relative w-32 md:w-full aspect-video rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-[color:var(--brand)] mb-1">
                    {item.category}
                </span>
                <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug mb-1 group-hover:underline decoration-1 underline-offset-4">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
