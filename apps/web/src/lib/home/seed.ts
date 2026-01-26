import type { HomeTabKey, ProductCardDTO } from "./types";

type Seed = Omit<ProductCardDTO, "id">;

const japanSeed: Seed[] = [
  {
    title: "가고시마 케도인G.C 2박3일 (수·금 출발)",
    duration: "2박3일",
    priceText: "840,000원",
    highlight1: "골프",
    highlight2: "리조트",
    badge: "BEST",
    thumbnailUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80"
  },
  {
    title: "가고시마 케도인G.G 3박4일 (일 출발)",
    duration: "3박4일",
    priceText: "1,090,000원",
    highlight1: "골프",
    highlight2: "리조트",
    thumbnailUrl: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&q=80"
  },
  {
    title: "가고시마 사츠마 골프리조트 교세라 2박3일",
    duration: "2박3일",
    priceText: "849,000원",
    highlight1: "골프",
    highlight2: "온천",
    thumbnailUrl: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800&q=80"
  },
  {
    title: "후쿠오카 유아이 골프클럽 2박3일",
    duration: "2박3일",
    priceText: "1,190,000원",
    highlight1: "골프",
    highlight2: "도심 접근",
    thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80"
  }
];

const seaSeed: Seed[] = [
  {
    title: "치앙마이 완전실속 3박5일",
    duration: "3박5일",
    priceText: "699,000원~",
    highlight1: "핵심 일정",
    highlight2: "자유 시간",
    thumbnailUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80"
  },
  {
    title: "비엔티엔·방비엥 4박6일",
    duration: "4박6일",
    priceText: "799,000원~",
    highlight1: "도시+자연",
    highlight2: "현지 체험",
    thumbnailUrl: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80"
  },
  {
    title: "싱가폴·말라카·쿠알라 3박5일",
    duration: "3박5일",
    priceText: "899,000원~",
    highlight1: "2개국",
    highlight2: "미식·야경",
    thumbnailUrl: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80"
  }
];

const taiwanSeed: Seed[] = [
  {
    title: "대만 가오슝 남부 3박4일",
    duration: "3박4일",
    priceText: "899,000원~",
    highlight1: "남부 핵심",
    highlight2: "야시장",
    thumbnailUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80"
  },
  {
    title: "타이페이·야류·화련 3박4일",
    duration: "3박4일",
    priceText: "949,000원~",
    highlight1: "동부 포함",
    highlight2: "자연 명소",
    thumbnailUrl: "https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80"
  }
];

const jejuSeed: Seed[] = [
  {
    title: "제주 2박3일 BEST (우도8경·잠수함)",
    duration: "2박3일",
    priceText: "599,000원~",
    highlight1: "우도8경",
    highlight2: "잠수함",
    badge: "BEST",
    thumbnailUrl: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80"
  },
  {
    title: "제주 시내 특급호텔 골프 2박3일 54홀",
    duration: "2박3일",
    priceText: "699,000원~",
    highlight1: "54홀",
    highlight2: "호텔 숙박",
    thumbnailUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80"
  },
  {
    title: "제주 한라산 정상 힐링 2박3일",
    duration: "2박3일",
    priceText: "499,000원~",
    highlight1: "한라산",
    highlight2: "동부 관광",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
  }
];

const domesticSeed: Seed[] = [
  {
    title: "울릉도 2박3일 (독도 선택)",
    duration: "2박3일",
    priceText: "649,000원~",
    highlight1: "울릉",
    highlight2: "해안 코스",
    thumbnailUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80"
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
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&q=80",
    "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800&q=80",
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80"
  ],
  SEA: [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80",
    "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80",
    "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80"
  ],
  TAIWAN: [
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    "https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800&q=80",
    "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=800&q=80"
  ],
  JEJU: [
    "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80",
    "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
  ],
  DOMESTIC: [
    "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80"
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
