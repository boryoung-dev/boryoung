export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 스켈레톤 */}
      <div className="h-[72px] bg-white" />

      {/* 히어로 스켈레톤 */}
      <section className="pt-16 pb-8 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <div className="h-12 w-64 bg-[color:var(--surface)] rounded-lg mx-auto mb-6 animate-pulse" />
          <div className="h-12 w-full max-w-xl bg-[color:var(--surface)] rounded-xl mx-auto animate-pulse" />
        </div>
      </section>

      {/* 상품 그리드 스켈레톤 */}
      <div className="max-w-[1440px] mx-auto px-[60px] py-[40px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[28px] bg-[color:var(--surface)] aspect-[4/5] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
