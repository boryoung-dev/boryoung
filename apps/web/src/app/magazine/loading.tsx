export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[72px] bg-white" />
      <div className="max-w-[1200px] mx-auto px-4 pt-16 pb-8">
        <div className="h-6 w-24 bg-[color:var(--surface)] rounded mb-2 animate-pulse" />
        <div className="h-10 w-56 bg-[color:var(--surface)] rounded-lg mb-8 animate-pulse" />
        <div className="flex gap-2 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-[color:var(--surface)] rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[16/10] bg-[color:var(--surface)] rounded-xl mb-3 animate-pulse" />
              <div className="h-4 w-16 bg-[color:var(--surface)] rounded mb-2 animate-pulse" />
              <div className="h-5 w-full bg-[color:var(--surface)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
