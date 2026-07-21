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

const SECTION_TYPES = new Set<BlogSection["type"]>([
  "intro",
  "content",
  "highlight",
  "tips",
  "comparison",
  "cta",
]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isBlogSection(value: unknown): value is BlogSection {
  if (!value || typeof value !== "object") return false;

  const section = value as Record<string, unknown>;
  if (
    typeof section.type !== "string" ||
    !SECTION_TYPES.has(section.type as BlogSection["type"])
  ) {
    return false;
  }

  const stringFields = ["heading", "subheading", "text", "image", "imageAlt"];
  if (
    stringFields.some(
      (field) => section[field] !== undefined && typeof section[field] !== "string",
    )
  ) {
    return false;
  }

  if (section.items !== undefined && !isStringArray(section.items)) return false;

  if (section.columns !== undefined) {
    if (!Array.isArray(section.columns)) return false;
    const validColumns = section.columns.every((column) => {
      if (!column || typeof column !== "object") return false;
      const item = column as Record<string, unknown>;
      return typeof item.title === "string" && isStringArray(item.items);
    });
    if (!validColumns) return false;
  }

  return true;
}

export function parseStructuredBlogContent(content: string): BlogSection[] | null {
  try {
    const parsed = JSON.parse(content) as { sections?: unknown };
    if (!Array.isArray(parsed.sections)) return null;

    const validSections = parsed.sections.filter(isBlogSection);
    return validSections.length > 0 ? validSections : null;
  } catch {
    return null;
  }
}
