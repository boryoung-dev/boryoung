export interface ShowcaseProduct {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  destination: string;
  duration: string;
  departure: string | null;
  airline: string | null;
  totalHoles: number | null;
  minPeople: number | null;
  basePrice: number | null;
  originalPrice: number | null;
  imageUrl: string;
  categoryName: string;
  categorySlug: string;
  tags: string[];
  reviewCount: number;
  averageRating: number | null;
  isFeatured: boolean;
}

export interface ShowcaseCuration {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sectionType: string | null;
  products: ShowcaseProduct[];
}

export interface ShowcaseBanner {
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  ctaText: string | null;
}

export interface ShowcaseQuickIcon {
  label: string;
  iconName: string;
  linkUrl: string;
}

export interface ShowcaseDestination {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  leadImage: string;
  minPrice: number | null;
}

export interface ShowcasePost {
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  category: string | null;
}

export interface ShowcaseData {
  banners: ShowcaseBanner[];
  quickIcons: ShowcaseQuickIcon[];
  curations: ShowcaseCuration[];
  featuredProducts: ShowcaseProduct[];
  dealProducts: ShowcaseProduct[];
  destinations: ShowcaseDestination[];
  posts: ShowcasePost[];
  stats: {
    productCount: number;
    destinationCount: number;
    reviewCount: number;
    averageRating: number | null;
    minPrice: number | null;
  };
}
