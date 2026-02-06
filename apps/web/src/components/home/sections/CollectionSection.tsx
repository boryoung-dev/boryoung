"use client";

import Link from "next/link";
import { HomeSection, CollectionItem } from "@/lib/home/types";

export function CollectionSection(props: Extract<HomeSection, { type: "collection" }> & { items: CollectionItem[] }) {
  if (!props.isVisible) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{props.title}</h2>
        
        <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6 snap-x snap-mandatory scrollbar-hide">
          {props.items.map((item) => (
            <Link 
                key={item.id}
                href={item.slug ? `/tours/${item.slug}` : `/tours`}
                className="relative flex-none w-[280px] md:w-[320px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer snap-start shadow-md"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {item.badges && item.badges.length > 0 && (
                    <div className="flex gap-1 mb-2">
                        {item.badges.map(b => (
                            <span key={b} className="text-[10px] font-bold px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                                {b}
                            </span>
                        ))}
                    </div>
                )}
                <h3 className="text-xl md:text-2xl font-bold leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-white/80 font-medium line-clamp-1">
                  {item.subTitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
