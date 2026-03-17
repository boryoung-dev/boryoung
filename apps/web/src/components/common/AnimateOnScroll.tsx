"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeIn" | "fadeLeft" | "fadeRight" | "scaleIn" | "slideUp";
  delay?: number;
  duration?: number;
}

const animations = {
  fadeUp: { hidden: "opacity-0 translate-y-8", visible: "opacity-100 translate-y-0" },
  fadeIn: { hidden: "opacity-0", visible: "opacity-100" },
  fadeLeft: { hidden: "opacity-0 -translate-x-8", visible: "opacity-100 translate-x-0" },
  fadeRight: { hidden: "opacity-0 translate-x-8", visible: "opacity-100 translate-x-0" },
  scaleIn: { hidden: "opacity-0 scale-95", visible: "opacity-100 scale-100" },
  slideUp: { hidden: "opacity-0 translate-y-12", visible: "opacity-100 translate-y-0" },
};

export function AnimateOnScroll({
  children,
  className = "",
  animation = "fadeUp",
  delay = 0,
  duration = 700,
}: AnimateOnScrollProps) {
  const { ref, isVisible } = useScrollAnimation();
  const anim = animations[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${isVisible ? anim.visible : anim.hidden} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
