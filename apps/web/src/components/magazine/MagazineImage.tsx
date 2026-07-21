"use client";

import { useState } from "react";

interface MagazineImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function MagazineImage({
  src,
  alt,
  className = "",
}: MagazineImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={`${alt} 이미지 준비 중`}
        className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 text-sm text-slate-400 ${className}`}
      >
        이미지 준비 중
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
