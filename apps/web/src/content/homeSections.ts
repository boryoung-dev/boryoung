import type { HomeSection } from "@/lib/home/types";

export const homeSections: HomeSection[] = [
  {
    type: "hero",
    isVisible: true,
    headline: "여행을 고르는 가장 빠른 방법",
    subhead: "지역·기간·테마로 한 번에 찾고, 카톡으로 바로 확정까지.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    quickChips: ["2박3일", "3박4일", "가성비", "프리미엄", "단체"],
    primaryCtaLabel: "상품 찾기",
    secondaryCtaLabel: "카톡 상담"
  },
  {
    type: "quickIcons",
    isVisible: true,
    items: [
      { label: "해외골프", iconName: "plane", linkUrl: "/tours?search=해외골프" },
      { label: "54홀", iconName: "flag", linkUrl: "/tours?search=54홀" },
      { label: "가성비", iconName: "tag", linkUrl: "/tours?search=가성비" },
      { label: "프리미엄", iconName: "star", linkUrl: "/tours?search=프리미엄" },
      { label: "단체", iconName: "users", linkUrl: "/tours?search=단체" },
      { label: "단기", iconName: "clock", linkUrl: "/tours?search=단기" },
      { label: "베트남", iconName: "map", linkUrl: "/tours?category=southeast-asia" },
      { label: "일본", iconName: "map", linkUrl: "/tours?category=japan-golf" }
    ]
  },
  {
    type: "ranking",
    isVisible: true,
    title: "이번 달 BEST 인기상품 🔥",
    items: [
      {
        id: "r1", rank: 1, title: "[다낭] 5성급 쉐라톤 풀빌라 3박5일", price: "899,000원~",
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
        badges: ["특가", "2인출발"]
      },
      {
        id: "r2", rank: 2, title: "[후쿠오카] 명문 골프장 2색 라운딩", price: "1,250,000원~",
        imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
        badges: ["예약폭주"]
      },
      {
        id: "r3", rank: 3, title: "[치앙마이] 가성비 무제한 골프", price: "650,000원~",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
        badges: ["노팁/노옵션"]
      },
      {
        id: "r4", rank: 4, title: "[사이판] 오션뷰 리조트 4박5일", price: "1,100,000원~",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
        badges: ["가족여행"]
      }
    ]
  },
  {
    type: "collection",
    isVisible: true,
    title: "MD 강력 추천 기획전",
    items: [
      {
        id: "c1", title: "일본 골프의 정석", subTitle: "규슈/오키나와/홋카이도 BEST",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        badges: ["시즌오픈", "D-5"]
      },
      {
        id: "c2", title: "동남아 럭셔리", subTitle: "5성급 호텔 + VIP 의전",
        imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
        badges: ["프리미엄"]
      },
      {
        id: "c3", title: "2인 출발 OK", subTitle: "조인 걱정 없는 프라이빗 라운드",
        imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80",
        badges: ["상시출발"]
      }
    ]
  },
  {
    type: "categoryTabs",
    isVisible: true,
    title: "카테고리별 인기 상품",
    tabs: [
      { key: "JAPAN", label: "일본" },
      { key: "SEA", label: "동남아" },
      { key: "TAIWAN", label: "대만" },
      { key: "JEJU", label: "제주" },
      { key: "DOMESTIC", label: "국내" }
    ],
    itemsPerTab: 16
  },
  {
    type: "magazine",
    isVisible: true,
    title: "알아두면 좋은 골프 팁 ⛳️",
    items: [
      {
        id: "m1", category: "준비물", title: "해외 골프여행, 캐디백 항공커버 필수일까?",
        description: "파손 걱정 없는 항공커버 고르는 법부터 패킹 노하우까지 한 번에 정리해드립니다.",
        imageUrl: "https://images.unsplash.com/photo-1591491653056-4e9d563a4b69?w=800&q=80"
      },
      {
        id: "m2", category: "코스공략", title: "베트남 다낭 CC 완벽 공략 가이드",
        description: "그렉 노먼이 설계한 명문 코스, 홀별 공략법과 주의할 점을 미리 확인하세요.",
        imageUrl: "https://images.unsplash.com/photo-1500932334442-8761ee4810a7?w=800&q=80"
      },
      {
        id: "m3", category: "여행팁", title: "골프 여행 후 피로 푸는 마사지 추천",
        description: "라운딩 후 뭉친 근육을 풀어주는 국가별 마사지 스타일과 추천 스파 리스트.",
        imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80"
      }
    ]
  },
  {
    type: "curations",
    isVisible: true,
    title: "추천 컬렉션",
    items: [
      {
        id: "cur_weekly",
        title: "이번주 인기",
        description: "가장 많이 찾는 구성만 모았어요",
        imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
      },
      {
        id: "cur_value",
        title: "가성비 BEST",
        description: "가격 대비 구성 좋은 상품",
        imageUrl: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80"
      },
      {
        id: "cur_short",
        title: "단기 2~3일",
        description: "짧게 다녀오는 빠른 일정",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80"
      },
      {
        id: "cur_premium",
        title: "프리미엄",
        description: "숙소/동선/구성 업그레이드",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
      }
    ]
  }
];
