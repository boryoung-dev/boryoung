interface YouTubeVideoProps {
  videoId: string;
  title: string;
  variant?: "fullWidth" | "background";
  className?: string;
}

function getEmbedUrl(videoId: string, isBackground: boolean) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    controls: isBackground ? "0" : "1",
    disablekb: isBackground ? "1" : "0",
    fs: isBackground ? "0" : "1",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * 전체 폭 영상과 히어로 배경 영상을 함께 지원하는 공용 YouTube 컴포넌트.
 * 브라우저 자동재생 정책에 맞춰 음소거 상태로 자동재생합니다.
 */
export function YouTubeVideo({
  videoId,
  title,
  variant = "fullWidth",
  className = "",
}: YouTubeVideoProps) {
  const isBackground = variant === "background";
  const embedUrl = getEmbedUrl(videoId, isBackground);

  if (isBackground) {
    return (
      <div
        className={`absolute inset-0 overflow-hidden bg-black ${className}`}
        aria-hidden="true"
      >
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.7778vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
      </div>
    );
  }

  return (
    <section
      className={`relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#f4f1ea] ${className}`}
    >
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
              Boryoung Film
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              여행의 설렘을 먼저 만나보세요
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
            보령항공여행이 전하는 골프여행의 특별한 순간을 영상으로
            확인해 보세요.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-white/80 bg-black shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)] sm:rounded-[32px] lg:mt-10">
          <div className="relative aspect-video w-full">
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-neutral-950 px-5 py-4 text-white sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_5px_rgba(239,68,68,0.14)]" />
              <span className="text-sm font-semibold">보령항공여행 공식 영상</span>
            </div>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-white/45 sm:block">
              Golf Travel Story
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
