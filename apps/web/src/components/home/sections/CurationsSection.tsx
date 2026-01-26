import { PlusButton } from "@/components/common/PlusButton";

export function CurationsSection(props: {
  title: string;
  items: { id: string; title: string; description: string; imageUrl?: string }[];
}) {
  return (
    <section className="bg-[color:var(--surface)] py-24 overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl font-semibold tracking-tight text-[color:var(--fg)]">{props.title}</h2>
            <div className="hidden text-[15px] font-medium text-[color:var(--brand)] sm:block cursor-pointer hover:underline transition-all">
                전체 컬렉션 보기
            </div>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-10 pt-4 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {props.items.map((it, idx) => (
            <div 
                key={it.id} 
                className="snap-center group relative flex h-[480px] min-w-[320px] sm:min-w-[380px] cursor-pointer flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.01]"
            >
              {it.imageUrl ? (
                <>
                  <img
                    src={it.imageUrl}
                    alt={it.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
                </>
              ) : (
                <>
                  <div 
                    className={`absolute inset-0 transition-transform duration-700 group-hover:scale-110 opacity-30
                        ${idx === 0 ? 'bg-[radial-gradient(circle_at_top_right,#f97316_0%,transparent_60%)]' : ''}
                        ${idx === 1 ? 'bg-[radial-gradient(circle_at_top_right,#0f766e_0%,transparent_60%)]' : ''}
                        ${idx === 2 ? 'bg-[radial-gradient(circle_at_top_right,#3b82f6_0%,transparent_60%)]' : ''}
                        ${idx === 3 ? 'bg-[radial-gradient(circle_at_top_right,#ef4444_0%,transparent_60%)]' : ''}
                    `}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/90" />
                </>
              )}
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-bold tracking-wider uppercase ${it.imageUrl ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                        COLLECTION 0{idx + 1}
                    </span>
                  </div>

                  <div className="mb-4">
                      <h3 className={`text-3xl font-bold leading-tight tracking-tight break-keep ${it.imageUrl ? 'text-white' : 'text-[color:var(--fg)]'}`}>
                        {it.title}
                      </h3>
                      <p className={`mt-4 text-[15px] font-medium line-clamp-2 leading-relaxed ${it.imageUrl ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                        {it.description}
                      </p>
                  </div>
              </div>

              <div className="absolute bottom-6 right-6 z-20">
                  <PlusButton label="자세히 보기" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
