import type { HomeTabKey, ProductCardDTO } from "./types";

type Seed = Omit<ProductCardDTO, "id">;

const japanSeed: Seed[] = [
  {
    title: "가고시마 케도인G.C 2박3일 (수·금 출발)",
    duration: "2박3일",
    priceText: "840,000원",
    highlight1: "골프",
    highlight2: "리조트",
    badge: "BEST"
  },
  {
    title: "가고시마 케도인G.G 3박4일 (일 출발)",
    duration: "3박4일",
    priceText: "1,090,000원",
    highlight1: "골프",
    highlight2: "리조트"
  },
  {
    title: "가고시마 사츠마 골프리조트 교세라 2박3일",
    duration: "2박3일",
    priceText: "849,000원",
    highlight1: "골프",
    highlight2: "온천"
  },
  {
    title: "후쿠오카 유아이 골프클럽 2박3일",
    duration: "2박3일",
    priceText: "1,190,000원",
    highlight1: "골프",
    highlight2: "도심 접근"
  }
];

const seaSeed: Seed[] = [
  {
    title: "치앙마이 완전실속 3박5일",
    duration: "3박5일",
    priceText: "699,000원~",
    highlight1: "핵심 일정",
    highlight2: "자유 시간"
  },
  {
    title: "비엔티엔·방비엥 4박6일",
    duration: "4박6일",
    priceText: "799,000원~",
    highlight1: "도시+자연",
    highlight2: "현지 체험"
  },
  {
    title: "싱가폴·말라카·쿠알라 3박5일",
    duration: "3박5일",
    priceText: "899,000원~",
    highlight1: "2개국",
    highlight2: "미식·야경"
  }
];

const taiwanSeed: Seed[] = [
  {
    title: "대만 가오슝 남부 3박4일",
    duration: "3박4일",
    priceText: "899,000원~",
    highlight1: "남부 핵심",
    highlight2: "야시장"
  },
  {
    title: "타이페이·야류·화련 3박4일",
    duration: "3박4일",
    priceText: "949,000원~",
    highlight1: "동부 포함",
    highlight2: "자연 명소"
  }
];

const jejuSeed: Seed[] = [
  {
    title: "제주 2박3일 BEST (우도8경·잠수함)",
    duration: "2박3일",
    priceText: "599,000원~",
    highlight1: "우도8경",
    highlight2: "잠수함",
    badge: "BEST"
  },
  {
    title: "제주 시내 특급호텔 골프 2박3일 54홀",
    duration: "2박3일",
    priceText: "699,000원~",
    highlight1: "54홀",
    highlight2: "호텔 숙박"
  },
  {
    title: "제주 한라산 정상 힐링 2박3일",
    duration: "2박3일",
    priceText: "499,000원~",
    highlight1: "한라산",
    highlight2: "동부 관광"
  }
];

const domesticSeed: Seed[] = [
  {
    title: "울릉도 2박3일 (독도 선택)",
    duration: "2박3일",
    priceText: "649,000원~",
    highlight1: "울릉",
    highlight2: "해안 코스"
  }
];

const seedByTab: Record<HomeTabKey, Seed[]> = {
  JAPAN: japanSeed,
  SEA: seaSeed,
  TAIWAN: taiwanSeed,
  JEJU: jejuSeed,
  DOMESTIC: domesticSeed
};


const IMAGES: Record<HomeTabKey, string[]> = {
  JAPAN: [
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542640244-7e672d6bd4e8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503428593586-e225b476b52c?q=80&w=800&auto=format&fit=crop"
  ],
  SEA: [
    "https://images.unsplash.com/photo-1593111774240-d529f12db4bb?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548545644-b0d500416972?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535131749050-ba4337461e0d?q=80&w=800&auto=format&fit=crop"
  ],
  TAIWAN: [
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470076892663-af684e5e15af?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop"
  ],
  JEJU: [
    "https://images.unsplash.com/photo-1572295727871-7638149ea3d7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1623567341691-1f1915907409?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581458784534-70653526f634?q=80&w=800&auto=format&fit=crop"
  ],
  DOMESTIC: [
    "https://images.unsplash.com/photo-1629248457639-5eb891104337?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565538466669-e56592237517?q=80&w=800&auto=format&fit=crop"
  ]
};

function makeId(tab: HomeTabKey, i: number) {
  return `${tab.toLowerCase()}_${i.toString().padStart(3, "0")}`;
}

function fillerFor(tab: HomeTabKey, i: number): Seed {
  const baseTitle: Record<HomeTabKey, string[]> = {
    JAPAN: ["규슈 골프", "오카야마 골프", "구마모토 골프"],
    SEA: ["동남아", "리조트", "자유여행"],
    TAIWAN: ["타이중", "타이페이", "가오슝"],
    JEJU: ["제주", "서귀포", "동부"],
    DOMESTIC: ["국내", "강원", "남해"]
  };

  const durationPool = ["2박3일", "3박4일", "3박5일", "4박6일"];
  const pricePool = [
    "699,000원~",
    "799,000원~",
    "899,000원~",
    "990,000원~",
    "1,090,000원~"
  ];
  const d = durationPool[i % durationPool.length] ?? "2박3일";
  const p = pricePool[i % pricePool.length] ?? "699,000원~";

  const t = baseTitle[tab][i % baseTitle[tab].length] ?? "추천";
  const badge = i % 9 === 0 ? ("NEW" as const) : undefined;
  
  // Deterministic image selection
  const imagePool = IMAGES[tab];
  const thumbnailUrl = imagePool[i % imagePool.length];

  return {
    title: `${t} 패키지 ${d}`,
    duration: d,
    priceText: p,
    highlight1: tab === "JAPAN" ? "골프" : "핵심 일정",
    highlight2: tab === "JAPAN" ? "숙박" : "자유 시간",
    badge,
    thumbnailUrl
  };
}

export function getHomeProductsByTab(itemsPerTab: number): Record<HomeTabKey, ProductCardDTO[]> {
  const out = {} as Record<HomeTabKey, ProductCardDTO[]>;

  (Object.keys(seedByTab) as HomeTabKey[]).forEach((tab) => {
    const seed = seedByTab[tab];
    const items: ProductCardDTO[] = [];

    for (let i = 0; i < itemsPerTab; i += 1) {
      const s = seed[i] ?? fillerFor(tab, i);
      items.push({ id: makeId(tab, i), ...s });
    }

    out[tab] = items;
  });

  return out;
}
