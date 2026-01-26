import { PlusButton } from "@/components/common/PlusButton";

export function ProcessSection(props: {
  title: string;
  steps: { title: string; description: string }[];
}) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
                <h2 className="text-5xl font-semibold tracking-tight text-[color:var(--fg)] mb-4">{props.title}</h2>
                <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                    복잡한 여행 준비, 보령과 함께라면 단 3단계로 완벽해집니다.
                </p>
            </div>
            <div className="flex-shrink-0">
                <a href="#" className="text-[15px] font-medium text-[color:var(--brand)] hover:underline flex items-center gap-1">
                    프로세스 자세히 보기 <span className="text-xs">›</span>
                </a>
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {props.steps.map((s, idx) => (
            <div
              key={s.title}
              className="group relative flex flex-col justify-between h-[420px] overflow-hidden rounded-[2.5rem] bg-[color:var(--surface)] p-8 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl"
            >
              <div className="relative z-10">
                  <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-[color:var(--fg)] mb-3">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[color:var(--muted)]">
                    {s.description}
                  </p>
              </div>

               <div className="absolute bottom-0 left-0 right-0 flex h-1/2 items-end justify-center bg-gradient-to-t from-[color:var(--surface-3)]/50 to-transparent pb-8 opacity-50 transition-opacity group-hover:opacity-100">
                 <div
                   className={`h-32 w-32 rounded-full blur-2xl opacity-20
                    ${idx === 0 ? 'bg-[color:var(--brand)]' : ''}
                    ${idx === 1 ? 'bg-black' : ''}
                    ${idx === 2 ? 'bg-[color:var(--accent)]' : ''}
                 `}
                 />
               </div>

              <div className="absolute bottom-6 right-6 z-20">
                 <PlusButton label="자세히" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
