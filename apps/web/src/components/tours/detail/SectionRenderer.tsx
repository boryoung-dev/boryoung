"use client";

import { useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import type {
  ContentSection,
  ContentSectionData,
  FeaturesSection,
  TableSection,
  ButtonGroupSection,
} from "@repo/database";

interface SectionRendererProps {
  sections: ContentSection[];
}

// YouTube/Vimeo URL -> embed URL 파싱
function parseVideoUrl(url: string): string | null {
  // YouTube: watch?v=ID
  const ytMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // YouTube: youtu.be/ID
  const ytShortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (ytShortMatch) return `https://www.youtube.com/embed/${ytShortMatch[1]}`;

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

// 각 섹션 타입별 렌더러
function renderSection(section: ContentSectionData, key: string): React.ReactNode {
  switch (section.type) {
    case "text":
      return (
        <div key={key} className="prose prose-gray max-w-none">
          <div
            className="text-base text-[color:var(--muted)] leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.html) }}
          />
        </div>
      );

    case "image": {
      const widthClass =
        section.width === "medium"
          ? "max-w-[60%]"
          : section.width === "large"
          ? "max-w-[80%]"
          : "max-w-full";
      return (
        <figure key={key} className={`mx-auto ${widthClass}`}>
          <img
            src={section.url}
            alt={section.alt ?? ""}
            className="w-full rounded-xl object-cover"
          />
          {section.caption && (
            <figcaption className="mt-2 text-center text-sm text-[color:var(--muted)]">
              {section.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "imageText": {
      const isLeft = section.imagePosition === "left";
      // imageRatio 비율 처리: "1:1" | "1:2" | "2:1"
      const ratio = section.imageRatio ?? "1:1";
      const [imgParts, txtParts] = ratio.split(":").map(Number);
      const total = imgParts + txtParts;
      const imgFlex = Math.round((imgParts / total) * 12);
      const txtFlex = 12 - imgFlex;
      const imgWidthClass = `md:w-${imgFlex}/12`;
      const txtWidthClass = `md:w-${txtFlex}/12`;

      const imageEl = (
        <div className={`w-full ${imgWidthClass} flex-shrink-0`}>
          <img
            src={section.imageUrl}
            alt={section.imageAlt ?? ""}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      );
      const textEl = (
        <div
          className={`w-full ${txtWidthClass} flex items-center`}
        >
          <div
            className="prose prose-gray max-w-none w-full text-base text-[color:var(--muted)] leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.html) }}
          />
        </div>
      );

      return (
        <div key={key} className="flex flex-col md:flex-row gap-6 items-start">
          {isLeft ? imageEl : textEl}
          {isLeft ? textEl : imageEl}
        </div>
      );
    }

    case "gallery": {
      const colClass =
        section.columns === 2
          ? "grid-cols-2"
          : section.columns === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-3";
      return (
        <div key={key} className={`grid ${colClass} gap-3`}>
          {section.images.map((img: { url: string; alt?: string; caption?: string }, i: number) => (
            <figure key={i} className="overflow-hidden rounded-xl">
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
              {img.caption && (
                <figcaption className="mt-1 text-center text-xs text-[color:var(--muted)]">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    case "video": {
      const embedUrl = parseVideoUrl(section.url);
      if (!embedUrl) return null;
      return (
        <figure key={key}>
          <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              title="동영상"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {section.caption && (
            <figcaption className="mt-2 text-center text-sm text-[color:var(--muted)]">
              {section.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-[color:var(--brand)] pl-5 py-2 my-2"
        >
          <p className="text-base italic text-[color:var(--fg)] leading-[1.7]">
            {section.text}
          </p>
          {section.author && (
            <cite className="block mt-2 text-sm text-[color:var(--muted)] not-italic">
              — {section.author}
            </cite>
          )}
        </blockquote>
      );

    case "callout": {
      const variantMap: Record<
        string,
        { bg: string; border: string; icon: string; iconColor: string }
      > = {
        info: {
          bg: "bg-blue-50",
          border: "border-blue-300",
          icon: "ℹ️",
          iconColor: "text-blue-600",
        },
        warning: {
          bg: "bg-yellow-50",
          border: "border-yellow-300",
          icon: "⚠️",
          iconColor: "text-yellow-600",
        },
        tip: {
          bg: "bg-green-50",
          border: "border-green-300",
          icon: "💡",
          iconColor: "text-green-600",
        },
        important: {
          bg: "bg-red-50",
          border: "border-red-300",
          icon: "🚨",
          iconColor: "text-red-600",
        },
      };
      const v = variantMap[section.variant] ?? variantMap.info;
      return (
        <div
          key={key}
          className={`${v.bg} border ${v.border} rounded-xl p-5`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5">{v.icon}</span>
            <div className="flex-1 min-w-0">
              {section.title && (
                <p className={`font-semibold mb-1 ${v.iconColor}`}>
                  {section.title}
                </p>
              )}
              <div
                className="text-sm text-[color:var(--fg)] leading-[1.6]"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.html) }}
              />
            </div>
          </div>
        </div>
      );
    }

    case "divider": {
      const styleClass =
        section.style === "dashed"
          ? "border-dashed"
          : section.style === "dotted"
          ? "border-dotted"
          : "border-solid";
      return (
        <hr
          key={key}
          className={`border-t ${styleClass} border-[color:var(--border)] my-2`}
        />
      );
    }

    case "faq":
      return <FaqBlock key={key} items={section.items} />;

    case "features": {
      const colClass =
        section.columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : section.columns === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-3";
      return (
        <div key={key} className={`grid ${colClass} gap-4`}>
          {section.items.map((item: FeaturesSection["items"][number], i: number) => (
            <div
              key={i}
              className="bg-[color:var(--surface)] rounded-xl p-5 flex flex-col gap-2"
            >
              {item.icon && (
                <span className="text-2xl leading-none">{item.icon}</span>
              )}
              <p className="font-semibold text-[color:var(--fg)]">
                {item.title}
              </p>
              <p className="text-sm text-[color:var(--muted)] leading-[1.6]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      );
    }

    case "banner": {
      const overlayClass =
        section.overlay === "light"
          ? "bg-white/50"
          : section.overlay === "none"
          ? ""
          : "bg-black/50";
      return (
        <div
          key={key}
          className="relative w-full rounded-2xl overflow-hidden min-h-[200px] flex items-center justify-center"
          style={{
            backgroundImage: `url(${section.backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className={`absolute inset-0 ${overlayClass}`}
            aria-hidden="true"
          />
          <div className="relative z-10 text-center px-6 py-12">
            <h3
              className={`text-2xl font-bold mb-2 ${
                section.overlay === "light"
                  ? "text-[color:var(--fg)]"
                  : "text-white"
              }`}
            >
              {section.title}
            </h3>
            {section.subtitle && (
              <p
                className={`text-base ${
                  section.overlay === "light"
                    ? "text-[color:var(--muted)]"
                    : "text-white/80"
                }`}
              >
                {section.subtitle}
              </p>
            )}
          </div>
        </div>
      );
    }

    case "table":
      return (
        <div key={key} className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[color:var(--surface)]">
                {section.headers.map((h: string, i: number) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left font-semibold text-[color:var(--fg)] whitespace-nowrap border-b border-[color:var(--border)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row: string[], ri: number) => (
                <tr
                  key={ri}
                  className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--surface)] transition-colors"
                >
                  {row.map((cell: string, ci: number) => (
                    <td
                      key={ci}
                      className="px-4 py-3 text-[color:var(--muted)] whitespace-nowrap"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "buttonGroup": {
      const alignClass =
        section.align === "right"
          ? "justify-end"
          : section.align === "center"
          ? "justify-center"
          : "justify-start";
      return (
        <div key={key} className={`flex flex-wrap gap-3 ${alignClass}`}>
          {section.buttons.map((btn: ButtonGroupSection["buttons"][number], i: number) => {
            const variantClass =
              btn.variant === "primary"
                ? "bg-[color:var(--brand)] text-white hover:opacity-90"
                : btn.variant === "secondary"
                ? "bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--border)]"
                : "border border-[color:var(--border)] text-[color:var(--fg)] hover:bg-[color:var(--surface)]";
            return (
              <a
                key={i}
                href={btn.url}
                className={`inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${variantClass}`}
              >
                {btn.label}
              </a>
            );
          })}
        </div>
      );
    }

    case "spacer": {
      const heightMap: Record<string, string> = {
        sm: "h-4",
        md: "h-8",
        lg: "h-12",
        xl: "h-16",
      };
      return (
        <div key={key} className={heightMap[section.height] ?? "h-8"} aria-hidden="true" />
      );
    }

    default:
      return null;
  }
}

// FAQ 아코디언 (내부 상태 사용)
function FaqBlock({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col divide-y divide-[color:var(--border)] rounded-xl border border-[color:var(--border)] overflow-hidden">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[color:var(--surface)] transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-[color:var(--fg)] text-sm leading-snug">
                {item.question}
              </span>
              <span
                className={`flex-shrink-0 text-[color:var(--muted)] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pt-1">
                <p className="text-sm text-[color:var(--muted)] leading-[1.7] whitespace-pre-wrap">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-6">
      {sorted.map((section) =>
        renderSection(section.data, section.id)
      )}
    </div>
  );
}
