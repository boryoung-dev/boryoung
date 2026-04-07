"use client";

interface Curation {
  title: string;
  description?: string | null;
  linkUrl?: string | null;
  displayConfig?: any;
}

/** 문자열의 리터럴 \n과 실제 개행을 모두 줄바꿈으로 변환 */
function splitLines(text: string): string[] {
  return text.replace(/\\n/g, "\n").split("\n");
}

/** 신뢰 CTA 섹션 미리보기 */
export function TrustCtaPreview({ curation }: { curation: Curation }) {
  const phone = curation.displayConfig?.phone || "1588-0320";
  const titleLines = splitLines(curation.title);
  const descLines = curation.description ? splitLines(curation.description) : [];

  return (
    <section className="py-14">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2
          style={{ color: "var(--fg, #1d1d1f)" }}
          className="text-2xl font-semibold tracking-tight leading-[1.15] mb-4"
        >
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h2>
        {curation.description && (
          <p
            style={{ color: "var(--muted, #86868b)" }}
            className="text-sm mb-8 max-w-md mx-auto leading-relaxed"
          >
            {descLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < descLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <span
            style={{ background: "var(--fg, #1d1d1f)" }}
            className="inline-flex items-center justify-center h-9 px-6 text-white rounded-full text-xs font-medium"
          >
            상담 문의하기
          </span>
          <span
            style={{
              borderColor: "var(--border, #d2d2d7)",
              color: "var(--fg, #1d1d1f)",
            }}
            className="inline-flex items-center justify-center h-9 px-6 border rounded-full text-xs font-medium"
          >
            {phone}
          </span>
        </div>
      </div>
    </section>
  );
}
