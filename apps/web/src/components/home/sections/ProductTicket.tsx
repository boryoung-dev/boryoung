import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductTicketConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 티켓 좌우 원형 홈 마스크 (mask-image radial-gradient 합성) */
const TICKET_MASK =
  "radial-gradient(circle at 0% 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)";

/** 항공권 티켓 — 좌우 원형 홈 + 점선 절취선 + monospace */
export function ProductTicket({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductTicketConfig;
  const style = cfg.style || {};
  const products = curation.products;

  if (products.length === 0) return null;

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="group block relative hover:-translate-y-1 transition-transform"
            style={{ fontFamily: "'Menlo', 'Consolas', monospace" }}
          >
            <div
              className="relative flex bg-[#fdfaf2] shadow-xl"
              style={{
                WebkitMaskImage: TICKET_MASK,
                maskImage: TICKET_MASK,
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }}
            >
              {/* 좌측 — 이미지 + BR 로고 */}
              <div className="w-2/5 relative bg-[#1a3a5c] text-white flex-shrink-0">
                <div className="aspect-square overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : null}
                </div>
                <div className="px-3 py-2 text-[10px] tracking-widest uppercase font-bold flex items-center justify-between">
                  <span>✈ BORYOUNG</span>
                  <span>AIR</span>
                </div>
              </div>

              {/* 점선 절취선 */}
              <div className="border-l-2 border-dashed border-[#1a3a5c]/30" />

              {/* 우측 — 티켓 정보 */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-[#1a3a5c]/70">
                    <span>BOARDING PASS</span>
                    <span>No. {String(i + 1).padStart(3, "0")}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[9px] uppercase text-gray-500">FROM</p>
                      <p className="text-xl font-bold text-[#1a3a5c] leading-none">ICN</p>
                    </div>
                    <div className="text-[#1a3a5c] text-lg">→</div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase text-gray-500">TO</p>
                      <p className="text-xl font-bold text-[#1a3a5c] leading-none">
                        {(p.destination || "???").slice(0, 3).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-[#1a3a5c] line-clamp-2 leading-snug">
                    {p.title}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-[#1a3a5c]/30 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase text-gray-500">DURATION</p>
                    <p className="text-xs font-bold text-[#1a3a5c]">
                      {p.duration || "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase text-gray-500">PRICE</p>
                    <p className="text-base font-bold text-[#c9302c]">
                      {p.basePrice ? `₩${p.basePrice.toLocaleString()}` : "문의"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
