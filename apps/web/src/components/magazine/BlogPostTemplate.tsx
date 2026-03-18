"use client";

import { useState } from "react";

export interface BlogSection {
  type: "intro" | "content" | "highlight" | "tips" | "comparison" | "cta";
  heading?: string;
  subheading?: string;
  text?: string;
  items?: string[];
  image?: string;
  imageAlt?: string;
  columns?: { title: string; items: string[] }[];
}

export interface StructuredBlogContent {
  version: 2;
  sections: BlogSection[];
}

// ─── 섹션별 렌더러 ───────────────────────────────────────────────

function SectionImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  if (error) return null;
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`rounded-xl shadow-md object-cover w-full ${className}`}
    />
  );
}

function IntroSection({ section }: { section: BlogSection }) {
  return (
    <section className="py-8 border-b border-[color:var(--border)]">
      {section.heading && (
        <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--brand)] mb-3">
          {section.heading}
        </p>
      )}
      {section.text && (
        <p className="text-xl md:text-2xl text-[color:var(--muted)] leading-relaxed font-light">
          {section.text}
        </p>
      )}
    </section>
  );
}

function ContentSection({
  section,
  index,
}: {
  section: BlogSection;
  index: number;
}) {
  const hasImage = Boolean(section.image);
  const isEven = index % 2 === 0;

  return (
    <section className="py-10">
      {section.heading && (
        <h2 className="text-2xl md:text-3xl font-bold text-[color:var(--fg)] mb-4 leading-snug">
          {section.heading}
        </h2>
      )}
      {section.subheading && (
        <p className="text-base font-semibold text-[color:var(--brand)] mb-3">
          {section.subheading}
        </p>
      )}

      {hasImage && !isEven ? (
        /* 홀수: 이미지 상단 전체폭 → 텍스트 아래 */
        <div className="space-y-5">
          <SectionImage
            src={section.image!}
            alt={section.imageAlt ?? section.heading ?? ""}
            className="max-h-[420px]"
          />
          {section.text && (
            <p className="text-base text-[color:var(--fg)] leading-[1.85] max-w-prose">
              {section.text}
            </p>
          )}
        </div>
      ) : hasImage && isEven ? (
        /* 짝수: 텍스트 왼쪽 / 이미지 오른쪽 그리드 */
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            {section.text && (
              <p className="text-base text-[color:var(--fg)] leading-[1.85]">
                {section.text}
              </p>
            )}
          </div>
          <SectionImage
            src={section.image!}
            alt={section.imageAlt ?? section.heading ?? ""}
            className="max-h-[360px]"
          />
        </div>
      ) : (
        /* 이미지 없음 */
        section.text && (
          <p className="text-base text-[color:var(--fg)] leading-[1.85] max-w-prose">
            {section.text}
          </p>
        )
      )}
    </section>
  );
}

function HighlightSection({ section }: { section: BlogSection }) {
  return (
    <section className="py-6">
      <div className="border-l-4 border-[color:var(--brand)] bg-[color:var(--surface)] rounded-r-xl px-6 py-5">
        {section.heading && (
          <h3 className="text-lg font-bold text-[color:var(--fg)] mb-2">
            {section.heading}
          </h3>
        )}
        {section.text && (
          <p className="text-base text-[color:var(--fg)] leading-[1.85]">
            {section.text}
          </p>
        )}
        {section.items && section.items.length > 0 && (
          <ul className="mt-3 space-y-1">
            {section.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[color:var(--fg)]"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[color:var(--brand)]" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TipsSection({ section }: { section: BlogSection }) {
  return (
    <section className="py-10">
      {section.heading && (
        <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-6">
          {section.heading}
        </h2>
      )}
      {section.subheading && (
        <p className="text-sm text-[color:var(--muted)] mb-5">
          {section.subheading}
        </p>
      )}
      {section.items && section.items.length > 0 && (
        <ul className="space-y-3">
          {section.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-[color:var(--surface)] rounded-xl px-5 py-4"
            >
              <span className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full bg-[color:var(--brand)] text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-base text-[color:var(--fg)] leading-relaxed">
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
      {section.text && (
        <p className="mt-5 text-base text-[color:var(--fg)] leading-[1.85]">
          {section.text}
        </p>
      )}
    </section>
  );
}

function ComparisonSection({ section }: { section: BlogSection }) {
  if (!section.columns || section.columns.length === 0) return null;

  return (
    <section className="py-10">
      {section.heading && (
        <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-6">
          {section.heading}
        </h2>
      )}
      {section.text && (
        <p className="text-base text-[color:var(--muted)] mb-6 leading-relaxed">
          {section.text}
        </p>
      )}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(section.columns.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {section.columns.map((col, ci) => (
          <div
            key={ci}
            className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl overflow-hidden"
          >
            <div className="bg-[color:var(--brand)] px-5 py-3">
              <h3 className="font-bold text-white text-base">{col.title}</h3>
            </div>
            <ul className="px-5 py-4 space-y-2">
              {col.items.map((item, ii) => (
                <li
                  key={ii}
                  className="flex items-start gap-2 text-sm text-[color:var(--fg)]"
                >
                  <svg
                    className="flex-shrink-0 mt-0.5 h-4 w-4 text-[color:var(--brand)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection({ section }: { section: BlogSection }) {
  return (
    <section className="py-10">
      <div className="relative overflow-hidden rounded-2xl bg-[color:var(--brand)] px-8 py-10 text-white">
        {/* 배경 장식 */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10" />

        <div className="relative z-10 max-w-xl">
          {section.heading && (
            <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">
              {section.heading}
            </h2>
          )}
          {section.subheading && (
            <p className="text-white/80 text-base mb-4">{section.subheading}</p>
          )}
          {section.text && (
            <p className="text-white/90 text-base leading-relaxed mb-5">
              {section.text}
            </p>
          )}
          {section.items && section.items.length > 0 && (
            <ul className="space-y-2 mb-5">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-white/90 text-sm">
                  <svg
                    className="flex-shrink-0 h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────

interface BlogPostTemplateProps {
  sections: BlogSection[];
}

export default function BlogPostTemplate({ sections }: BlogPostTemplateProps) {
  if (!sections || sections.length === 0) return null;

  // content 섹션 인덱스 카운터 (이미지 레이아웃 교번용)
  let contentIndex = 0;

  return (
    <article className="mx-auto max-w-3xl divide-y divide-[color:var(--border)]">
      {sections.map((section, i) => {
        switch (section.type) {
          case "intro":
            return <IntroSection key={i} section={section} />;

          case "content": {
            const idx = contentIndex++;
            return <ContentSection key={i} section={section} index={idx} />;
          }

          case "highlight":
            return <HighlightSection key={i} section={section} />;

          case "tips":
            return <TipsSection key={i} section={section} />;

          case "comparison":
            return <ComparisonSection key={i} section={section} />;

          case "cta":
            return <CtaSection key={i} section={section} />;

          default:
            return null;
        }
      })}
    </article>
  );
}
