import sanitize from "sanitize-html";

/**
 * HTML 콘텐츠를 새니타이즈하여 XSS 공격을 방지합니다.
 * img 태그에 referrerPolicy="no-referrer"를 추가하여 외부 이미지 핫링크 문제도 해결합니다.
 */
export function sanitizeHtml(html: string): string {
  const clean = sanitize(html, {
    allowedTags: sanitize.defaults.allowedTags.concat([
      "img", "iframe", "video", "source", "figure", "figcaption",
      "h1", "h2", "details", "summary",
    ]),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading", "referrerpolicy", "class", "style"],
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
      a: ["href", "target", "rel", "class"],
      div: ["class", "style"],
      span: ["class", "style"],
      p: ["class", "style"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });
  // img 태그에 referrerPolicy 추가 (네이버 등 외부 이미지 핫링크 방지 우회)
  return clean.replace(/<img\s/g, '<img referrerPolicy="no-referrer" ');
}
