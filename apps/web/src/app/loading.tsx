export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[color:var(--border)] border-t-[color:var(--fg)]" />
        <span className="text-sm text-[color:var(--muted)]">로딩 중...</span>
      </div>
    </div>
  );
}
