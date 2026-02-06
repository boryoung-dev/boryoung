# 프로젝트 아키텍처 레퍼런스

> 새 프로젝트 생성 시 참고용 - 아키텍처 + 전체 컴포넌트 + 유틸리티

---

## 1. 모노레포 구조

```
project/
├── apps/
│   ├── web/              # 사용자 대면 프론트엔드
│   └── admin/            # 관리자 대시보드
├── packages/
│   └── ui/               # 공유 UI 컴포넌트 (@repo/ui)
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── .gitignore
```

### 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 패키지 매니저 | pnpm | 10.12.4 |
| 모노레포 | Turborepo | ^2.7.5 |
| 프레임워크 | Next.js (App Router) | 16.1.4 |
| UI | React | 19.2.3 |
| 언어 | TypeScript | ^5.9.3 |
| CSS | Tailwind CSS | v4 |
| 아이콘 | lucide-react | ^0.563.0 |
| 스타일 유틸 | CVA + clsx + tailwind-merge | - |
| Lint | ESLint (flat config) | ^9 |

---

## 2. 루트 설정 파일

### package.json

```json
{
  "private": true,
  "packageManager": "pnpm@10.12.4",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "turbo": "^2.7.5",
    "typescript": "^5.9.3"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "dev": { "cache": false, "persistent": true },
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": { "dependsOn": ["^lint"] },
    "typecheck": { "dependsOn": ["^typecheck"] }
  }
}
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### .gitignore

```
node_modules
.turbo
.next
dist
.env
.env.*
.DS_Store
```

---

## 3. apps 설정 (web / admin 공통)

### package.json 의존성

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "lucide-react": "^0.563.0",
    "next": "16.1.4",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.4",
    "tailwindcss": "^4",
    "typescript": "^5.9.3"
  }
}
```

### next.config.ts

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui"],
};
export default nextConfig;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### eslint.config.mjs

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals.map((c) => ({ ...c, files: ["**/*.{ts,tsx,js,jsx}"] })),
  ...nextTs.map((c) => ({ ...c, files: ["**/*.{ts,tsx,js,jsx}"] })),
  globalIgnores([".next/"]),
]);
```

### postcss.config.mjs

```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

### globals.css

```css
@import "@repo/ui/styles.css";
@import "tailwindcss";

@source "../../../../packages/ui/src/**/*.{ts,tsx}";

:root {
  --background: var(--bg);
  --foreground: var(--fg);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .animate-in {
    animation-duration: 0.5s;
    animation-fill-mode: both;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  .fade-in { animation-name: fade-in; }
  .slide-in-from-bottom-4 {
    --tw-enter-translate-y: 1rem;
    animation-name: slide-in-from-bottom;
  }
  .slide-in-from-bottom-8 {
    --tw-enter-translate-y: 2rem;
    animation-name: slide-in-from-bottom;
  }
  .fill-mode-backwards { animation-fill-mode: backwards; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(var(--tw-enter-translate-y, 100%)); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### layout.tsx (공통)

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My App",
  description: "My App Description",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

## 4. packages/ui (@repo/ui) - 전체 소스

### package.json

```json
{
  "name": "@repo/ui",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./styles.css": "./src/styles.css"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "paths": { "@repo/ui/*": ["./src/*"] }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### src/index.ts

```ts
export * from "./lib/cn";

export * from "./components/badge";
export * from "./components/button";
export * from "./components/card";
export * from "./components/tabs";
```

### src/lib/cn.ts

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### src/styles.css

```css
:root {
  --bg: #ffffff;
  --fg: #1d1d1f;
  --muted: #86868b;

  --surface: #f5f5f7;
  --surface-2: #ffffff;
  --surface-3: #e8e8ed;
  --border: #d2d2d7;

  --brand: #0071e3;
  --brand-foreground: #ffffff;

  --accent: #bf4800;
  --accent-foreground: #ffffff;

  --ring: rgba(0, 113, 227, 0.5);
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-elevated: 0 20px 30px -10px rgba(0, 0, 0, 0.1);
}
```

### src/components/button.tsx

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        brand:
          "bg-[color:var(--brand)] text-[color:var(--brand-foreground)] hover:opacity-90 active:scale-95",
        accent:
          "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90 active:scale-95",
        secondary:
          "bg-[color:var(--surface-2)] text-[color:var(--brand)] hover:bg-[color:var(--surface-3)] active:scale-95",
        ghost:
          "bg-transparent text-[color:var(--fg)] hover:bg-[color:var(--surface-2)]",
        link: "bg-transparent text-[color:var(--brand)] hover:underline",
      },
      size: {
        sm: "h-7 px-3 text-xs",
        md: "h-9 px-4 text-[13px]",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

### src/components/badge.tsx

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-[color:var(--surface-3)] text-[color:var(--fg)]",
        best: "bg-[color:var(--brand)] text-[color:var(--brand-foreground)]",
        new: "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]",
        closing: "bg-[color:var(--fg)] text-[color:var(--bg)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

### src/components/card.tsx

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
```

### src/components/tabs.tsx

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export type TabsItem = { key: string; label: string };

export type TabsProps = {
  value: string;
  onValueChange: (next: string) => void;
  items: TabsItem[];
  className?: string;
};

export function Tabs({ value, onValueChange, items, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-1",
        className
      )}
    >
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onValueChange(it.key)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[color:var(--surface-2)] text-[color:var(--fg)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--fg)]"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
```

---

## 5. 웹 앱 컴포넌트 - 전체 소스

### components/common/SiteHeader.tsx

```tsx
import { Button } from "@repo/ui";
import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      {/* 상단 배너 */}
      <div className="bg-[#f5f5f7] px-4 py-2.5 text-center text-xs text-[color:var(--fg)]">
        <span className="inline-block">
          신규 회원 가입 시 5% 즉시 할인 쿠폰 증정.{" "}
          <Link href="#" className="text-[color:var(--brand)] hover:underline font-medium">
            지금 가입하기 ›
          </Link>
        </span>
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b border-[color:var(--border)] bg-[color:var(--bg)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-xl font-bold tracking-tight text-[color:var(--fg)]">
              Brand
            </span>
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden gap-8 text-sm font-medium text-[color:var(--fg)] md:flex">
            {["카테고리1", "카테고리2", "카테고리3"].map((item) => (
              <Link key={item} href="#" className="hover:text-[color:var(--brand)] transition-colors">
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {/* 검색 버튼 */}
            <button className="text-[color:var(--fg)] hover:text-[color:var(--brand)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {/* CTA 버튼 */}
            <Button variant="brand" size="sm" className="hidden sm:inline-flex h-9 px-5 text-sm font-medium">
              문의하기
            </Button>

            {/* 모바일 햄버거 */}
            <button className="md:hidden text-[color:var(--fg)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
```

### components/common/KakaoFloating.tsx

```tsx
export function KakaoFloating() {
  return (
    <button
      className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAE100] text-[#371D1E] shadow-lg transition-transform hover:scale-105 active:scale-95 border border-black/5"
      aria-label="KakaoTalk"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.48-1.708 3.48-2.392.52.076 1.054.117 1.654.117 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z" />
      </svg>
    </button>
  );
}
```

### components/common/PlusButton.tsx

```tsx
import { cn } from "@repo/ui";
import type React from "react";

interface PlusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "light" | "dark";
}

export function PlusButton({ className, label = "더 알아보기", variant = "dark", ...props }: PlusButtonProps) {
  return (
    <button
      className={cn(
        "group flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2",
        variant === "dark"
          ? "bg-[color:var(--fg)] text-[color:var(--bg)] hover:bg-[color:var(--fg)]/90"
          : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30",
        className
      )}
      aria-label={label}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:rotate-90">
        <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
```

### sections/HeroSection.tsx (자동 슬라이드 배너)

```tsx
"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { Button } from "@repo/ui";

interface Slide {
  headline: string;
  subhead: string;
  bg?: string;
  cta: string;
}

export function HeroSection(props: {
  slides: Slide[];
  autoPlayMs?: number;
}) {
  const { slides, autoPlayMs = 5000 } = props;
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [slides.length, autoPlayMs]);

  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  const handleTouchStart = (e: TouchEvent) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: TouchEvent) => { touchEnd.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const dist = touchStart.current - touchEnd.current;
    if (dist > 50) next();
    if (dist < -50) prev();
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div className="w-full bg-white pb-8">
      <div className="pt-4 px-4 md:px-6 max-w-[1200px] mx-auto">
        <div
          className="relative w-full aspect-[4/5] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-sm group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              {slide.bg && <img src={slide.bg} alt={slide.headline} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <div className="max-w-xl animate-in slide-in-from-bottom-4 fade-in duration-700">
                  <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-2 md:mb-4 drop-shadow-sm">{slide.headline}</h2>
                  <p className="text-white/90 text-lg md:text-xl font-medium mb-6 drop-shadow-sm line-clamp-2">{slide.subhead}</p>
                  <Button variant="brand" className="rounded-full px-6 h-10 md:h-12 bg-white text-black hover:bg-white/90 border-none font-bold">
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* 카운터 */}
          <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-20 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-xs font-medium text-white/90 border border-white/10">
            {current + 1} / {slides.length}
          </div>

          {/* 좌우 화살표 (데스크톱) */}
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:flex" aria-label="이전">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:flex" aria-label="다음">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

### sections/QuickIconsSection.tsx (퀵 아이콘 그리드)

```tsx
"use client";

import { Plane, Flag, Tag, Star, Users, Clock, MapPin, Globe } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  plane: <Plane className="w-6 h-6" strokeWidth={1.5} />,
  flag: <Flag className="w-6 h-6" strokeWidth={1.5} />,
  tag: <Tag className="w-6 h-6" strokeWidth={1.5} />,
  star: <Star className="w-6 h-6" strokeWidth={1.5} />,
  users: <Users className="w-6 h-6" strokeWidth={1.5} />,
  clock: <Clock className="w-6 h-6" strokeWidth={1.5} />,
  map: <MapPin className="w-6 h-6" strokeWidth={1.5} />,
  globe: <Globe className="w-6 h-6" strokeWidth={1.5} />,
};

export function QuickIconsSection(props: {
  items: { label: string; iconName: string; linkUrl?: string }[];
}) {
  return (
    <div className="w-full bg-white py-10">
      <div className="px-4 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-y-6 gap-x-2 md:gap-6">
          {props.items.map((item, idx) => (
            <a key={idx} href={item.linkUrl || "#"} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                {ICONS[item.iconName] || <Globe className="w-6 h-6" strokeWidth={1.5} />}
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### sections/RankingSection.tsx (랭킹 그리드)

```tsx
"use client";

export function RankingSection(props: {
  title: string;
  items: { id: string; rank: number; title: string; price: string; imageUrl: string; badges?: string[] }[];
}) {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{props.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {props.items.map((item) => (
            <div key={item.id} className="group relative flex flex-col gap-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                <span className="absolute top-0 left-0 bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-lg z-10 rounded-br-xl">
                  {item.rank}
                </span>
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 flex-wrap">
                  {item.badges?.map((b) => (
                    <span key={b} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm font-medium">{b}</span>
                  ))}
                </div>
                <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
                <p className="font-bold text-lg text-[color:var(--brand)]">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### sections/CollectionSection.tsx (수평 스크롤 컬렉션)

```tsx
"use client";

export function CollectionSection(props: {
  title: string;
  items: { id: string; title: string; subTitle: string; imageUrl: string; badges?: string[] }[];
}) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{props.title}</h2>
        <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6 snap-x snap-mandatory scrollbar-hide">
          {props.items.map((item) => (
            <div key={item.id} className="relative flex-none w-[280px] md:w-[320px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer snap-start shadow-md">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {item.badges && item.badges.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {item.badges.map((b) => (
                      <span key={b} className="text-[10px] font-bold px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">{b}</span>
                    ))}
                  </div>
                )}
                <h3 className="text-xl md:text-2xl font-bold leading-tight mb-1">{item.title}</h3>
                <p className="text-sm md:text-base text-white/80 font-medium line-clamp-1">{item.subTitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### sections/CategoryTabsSection.client.tsx (탭 + 수평 스크롤 카드)

```tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@repo/ui";

export function CategoryTabsSection<TKey extends string>(props: {
  title: string;
  tabs: { key: TKey; label: string }[];
  productsByTab: Record<TKey, { id: string; title: string; thumbnailUrl?: string; badge?: string; duration?: string; priceText?: string; highlight1?: string; highlight2?: string }[]>;
  renderCard?: (item: any) => React.ReactNode;
}) {
  const [active, setActive] = useState<TKey>(props.tabs[0]?.key as TKey);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const products = props.productsByTab[active] ?? [];
  const tabItems = useMemo(() => props.tabs, [props.tabs]);

  function scrollByAmount(dir: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: dir * 440, behavior: "smooth" });
  }

  return (
    <section className="bg-[#111113] py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{props.title}</h2>
          <div className="-mx-2 overflow-x-auto px-2 scrollbar-hide">
            <div className="inline-flex items-center gap-2">
              {tabItems.map((tab) => (
                <button key={tab.key} onClick={() => setActive(tab.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition",
                    active === tab.key
                      ? "bg-white text-[#111113]"
                      : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15"
                  )}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-black/30 py-10">
          <div className="mb-6 flex items-center justify-between px-6">
            <div className="text-sm font-semibold tracking-tight text-white/90">
              {tabItems.find((t) => t.key === active)?.label}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button onClick={() => scrollByAmount(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15" aria-label="이전">‹</button>
              <button onClick={() => scrollByAmount(1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15" aria-label="다음">›</button>
            </div>
          </div>

          <div ref={scrollerRef} className="flex gap-6 overflow-x-auto px-6 pb-2 scrollbar-hide snap-x snap-mandatory">
            {products.map((p) => (
              <div key={p.id} className="w-[80vw] min-w-[80vw] snap-start sm:w-[420px] sm:min-w-[420px]">
                {props.renderCard ? props.renderCard(p) : (
                  <div className="rounded-[28px] bg-[#0b0b0c] shadow-lg overflow-hidden">
                    <div className="relative aspect-[4/5]">
                      {p.thumbnailUrl && <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/0" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="line-clamp-2 text-[22px] font-semibold leading-tight text-white">{p.title}</h3>
                        {p.priceText && <div className="mt-4 text-[15px] font-semibold text-white">{p.priceText}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

### sections/CurationsSection.tsx (추천 컬렉션 카드)

```tsx
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
          <div className="hidden text-[15px] font-medium text-[color:var(--brand)] sm:block cursor-pointer hover:underline">전체 보기</div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 pt-4 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {props.items.map((it, idx) => (
            <div key={it.id} className="snap-center group relative flex h-[480px] min-w-[320px] sm:min-w-[380px] cursor-pointer flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.01]">
              {it.imageUrl ? (
                <>
                  <img src={it.imageUrl} alt={it.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/90" />
              )}

              <div className="relative z-10 flex flex-col h-full justify-between">
                <span className={`text-[11px] font-bold tracking-wider uppercase ${it.imageUrl ? "text-white/80" : "text-[color:var(--muted)]"}`}>
                  COLLECTION 0{idx + 1}
                </span>
                <div className="mb-4">
                  <h3 className={`text-3xl font-bold leading-tight tracking-tight break-keep ${it.imageUrl ? "text-white" : "text-[color:var(--fg)]"}`}>{it.title}</h3>
                  <p className={`mt-4 text-[15px] font-medium line-clamp-2 leading-relaxed ${it.imageUrl ? "text-white/80" : "text-[color:var(--muted)]"}`}>{it.description}</p>
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
```

### sections/MagazineSection.tsx (매거진/블로그 그리드)

```tsx
"use client";

export function MagazineSection(props: {
  title: string;
  items: { id: string; title: string; description: string; imageUrl: string; category: string }[];
}) {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{props.title}</h2>
          <a href="#" className="text-sm text-gray-500 font-medium hover:text-black">전체보기</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.items.map((item) => (
            <div key={item.id} className="group cursor-pointer flex gap-4 md:flex-col">
              <div className="relative w-32 md:w-full aspect-video rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-[color:var(--brand)] mb-1">{item.category}</span>
                <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug mb-1 group-hover:underline decoration-1 underline-offset-4">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### sections/ProcessSection.tsx (단계별 프로세스)

```tsx
import { PlusButton } from "@/components/common/PlusButton";

export function ProcessSection(props: {
  title: string;
  subtitle: string;
  steps: { title: string; description: string }[];
}) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-5xl font-semibold tracking-tight text-[color:var(--fg)] mb-4">{props.title}</h2>
            <p className="text-lg text-[color:var(--muted)] leading-relaxed">{props.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {props.steps.map((s, idx) => (
            <div key={s.title} className="group relative flex flex-col justify-between h-[420px] overflow-hidden rounded-[2.5rem] bg-[color:var(--surface)] p-8 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl">
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-bold">{idx + 1}</div>
                <h3 className="text-2xl font-bold tracking-tight text-[color:var(--fg)] mb-3">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-[color:var(--muted)]">{s.description}</p>
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
```

---

## 6. 핵심 패턴 요약

| 패턴 | 설명 |
|------|------|
| pnpm workspaces + Turborepo | 의존 그래프 기반 병렬 빌드 |
| `workspace:*` | 로컬 패키지 항상 최신 참조 |
| `transpilePackages` | 공유 패키지 TS 빌드 없이 직접 사용 |
| CVA | variant 기반 컴포넌트 스타일 관리 |
| cn() | 조건부 클래스 합성 + Tailwind 충돌 해결 |
| CSS 변수 테마 | `:root`에 디자인 토큰 |
| Discriminated Union | `type` 필드로 섹션 타입 구분 |
| 서버/클라이언트 분리 | 인터랙션 필요 시만 `"use client"` |

### 파일 네이밍 규칙

- 컴포넌트: **PascalCase** (`SiteHeader.tsx`)
- 클라이언트 구분: `*.client.tsx`
- 데이터/유틸리티: **camelCase** (`cn.ts`, `seed.ts`)
- 타입: `types.ts`
- 디렉토리: **camelCase** (`common/`, `sections/`)

---

## 7. 새 프로젝트 셋업 가이드

```bash
mkdir my-project && cd my-project && git init && pnpm init

# pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .gitignore 생성

pnpm add -Dw turbo typescript class-variance-authority clsx tailwind-merge

cd apps
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir
npx create-next-app@latest admin --typescript --tailwind --eslint --app --src-dir
cd ..

mkdir -p packages/ui/src/{components,lib}
# package.json, tsconfig.json, index.ts, styles.css, cn.ts 생성
# apps/*/next.config.ts에 transpilePackages 추가
# apps/*/globals.css에 @import "@repo/ui/styles.css" 추가
```

### 체크리스트

- [ ] `turbo.json` - 파이프라인
- [ ] `tsconfig.base.json` - strict, noUncheckedIndexedAccess
- [ ] `apps/*/next.config.ts` - transpilePackages
- [ ] `apps/*/postcss.config.mjs` - @tailwindcss/postcss
- [ ] `apps/*/eslint.config.mjs` - flat config
- [ ] `packages/ui/package.json` - type:module, exports, peerDependencies
- [ ] `packages/ui/tsconfig.json` - 루트 extends
- [ ] `packages/ui/src/styles.css` - CSS 변수
- [ ] `packages/ui/src/lib/cn.ts` - clsx + tailwind-merge
- [ ] `packages/ui/src/index.ts` - 배럴 export
