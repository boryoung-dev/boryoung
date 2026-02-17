export type ProductBadge = "BEST" | "NEW" | "CLOSING";

export type ProductCardDTO = {
  id: string;
  slug?: string;
  title: string;
  duration: string;
  priceText: string;
  highlight1: string;
  highlight2: string;
  badge?: ProductBadge;
  thumbnailUrl?: string;
};

export type HomeTabKey = "JAPAN" | "THAILAND" | "VIETNAM" | "TAIWAN" | "LAOS" | "GUAM_SAIPAN" | "EUROPE_HAWAII" | "MONGOLIA" | "OTHER" | "GROUP" | "DOMESTIC";

export type HomeTab = {
  key: HomeTabKey;
  label: string;
};

export type HeroSection = {
  type: "hero";
  isVisible: boolean;
  headline: string;
  subhead: string;
  backgroundImageUrl?: string;
  quickChips: string[];
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
};

export type CategoryTabsSection = {
  type: "categoryTabs";
  isVisible: boolean;
  title: string;
  tabs: HomeTab[];
  itemsPerTab: number;
};

export type CurationsSection = {
  type: "curations";
  isVisible: boolean;
  title: string;
  items: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
  }[];
};

export type QuickIconItem = {
  label: string;
  iconName: string;
  linkUrl?: string;
};

export type QuickIconsSection = {
  type: "quickIcons";
  isVisible: boolean;
  items: QuickIconItem[];
};

export type RankingItem = {
  id: string;
  slug?: string;
  rank: number;
  title: string;
  price: string;
  imageUrl: string;
  badges?: string[];
};

export type RankingSection = {
  type: "ranking";
  isVisible: boolean;
  title: string;
  items: RankingItem[];
};

export type CollectionItem = {
  id: string;
  slug?: string;
  title: string;
  subTitle: string;
  imageUrl: string;
  badges?: string[];
  linkUrl?: string;
};

export type CollectionSection = {
  type: "collection";
  isVisible: boolean;
  title: string;
  items: CollectionItem[];
};

export type MagazineItem = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
};

export type MagazineSection = {
  type: "magazine";
  isVisible: boolean;
  title: string;
  items: MagazineItem[];
};

export type ProcessSection = {
  type: "process";
  isVisible: boolean;
  title: string;
  steps: { title: string; description: string }[];
};

export type HomeSection = HeroSection | CategoryTabsSection | CurationsSection | ProcessSection | QuickIconsSection | RankingSection | CollectionSection | MagazineSection;
