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
    <section className={`relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black ${className}`}>
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
    </section>
  );
}
