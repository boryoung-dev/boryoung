export type ProductBadgeMode = "AUTO" | "CUSTOM" | "HIDDEN";

export type ProductBadge = {
  text: string;
  kind: "featured" | "discount" | "custom";
};

type ProductBadgeSource = {
  badgeMode?: string | null;
  customBadges?: unknown;
  isFeatured?: boolean | null;
  basePrice?: number | string | null;
  originalPrice?: number | string | null;
};

function normalizeCustomBadges(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((badge): badge is string => typeof badge === "string")
        .map((badge) => badge.trim())
        .filter(Boolean)
    )
  ).slice(0, 3);
}

export function resolveProductBadges(
  product: ProductBadgeSource,
  context: "card" | "detail" = "card"
): ProductBadge[] {
  const mode: ProductBadgeMode =
    product.badgeMode === "CUSTOM" || product.badgeMode === "HIDDEN"
      ? product.badgeMode
      : "AUTO";

  if (mode === "HIDDEN") return [];

  if (mode === "CUSTOM") {
    return normalizeCustomBadges(product.customBadges).map((text) => ({
      text,
      kind: "custom",
    }));
  }

  const badges: ProductBadge[] = [];
  if (product.isFeatured) {
    badges.push({
      text: context === "detail" ? "베스트셀러" : "베스트",
      kind: "featured",
    });
  }

  const basePrice = Number(product.basePrice);
  const originalPrice = Number(product.originalPrice);
  if (
    Number.isFinite(basePrice) &&
    Number.isFinite(originalPrice) &&
    basePrice > 0 &&
    originalPrice > basePrice
  ) {
    const discountPercent = Math.round(
      ((originalPrice - basePrice) / originalPrice) * 100
    );
    badges.push({
      text:
        context === "detail"
          ? `얼리버드 -${discountPercent}%`
          : `-${discountPercent}%`,
      kind: "discount",
    });
  }

  return badges;
}
