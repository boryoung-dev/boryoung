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
      { label: "일본", iconName: "plane", linkUrl: "/tours?category=japan" },
      { label: "태국", iconName: "sun", linkUrl: "/tours?category=thailand" },
      { label: "베트남", iconName: "palmtree", linkUrl: "/tours?category=vietnam" },
      { label: "대만", iconName: "mountain", linkUrl: "/tours?category=taiwan" },
      { label: "괌·사이판", iconName: "waves", linkUrl: "/tours?category=guam-saipan" },
      { label: "몽골", iconName: "compass", linkUrl: "/tours?category=mongolia" },
      { label: "국내·제주", iconName: "map", linkUrl: "/tours?category=domestic-jeju" },
      { label: "단체여행", iconName: "users", linkUrl: "/tours?category=group-travel" }
    ]
  },
  {
    type: "ranking",
    isVisible: true,
    title: "MD추천 및 베스트상품",
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
    title: "국가별 추천 골프여행",
    items: [
      {
        id: "c1", title: "일본 골프여행", subTitle: "규슈·오키나와·홋카이도 명문 코스",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        badges: ["인기", "시내+골프텔"]
      },
      {
        id: "c2", title: "베트남 골프여행", subTitle: "다낭·호치민·하노이 리조트 골프",
        imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
        badges: ["가성비"]
      },
      {
        id: "c3", title: "태국 골프여행", subTitle: "방콕·치앙마이·파타야 무제한 라운딩",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
        badges: ["노팁·노옵션"]
      },
      {
        id: "c4", title: "대만 골프여행", subTitle: "타이베이 근교 명문 골프장",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        badges: ["단기일정"]
      },
      {
        id: "c5", title: "괌·사이판 골프여행", subTitle: "오션뷰 리조트 + 골프 패키지",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
        badges: ["가족추천"]
      }
    ]
  },
  {
    type: "categoryTabs",
    isVisible: true,
    title: "국가별 골프여행 상품",
    tabs: [
      { key: "JAPAN", label: "일본" },
      { key: "THAILAND", label: "태국" },
      { key: "VIETNAM", label: "베트남" },
      { key: "TAIWAN", label: "대만" },
      { key: "LAOS", label: "라오스" },
      { key: "GUAM_SAIPAN", label: "괌·사이판" },
      { key: "EUROPE_HAWAII", label: "유럽·하와이" },
      { key: "MONGOLIA", label: "몽골" },
      { key: "GROUP", label: "단체여행" },
      { key: "DOMESTIC", label: "국내·제주" },
    ],
    itemsPerTab: 16
  },
  {
    type: "magazine",
    isVisible: false,
    title: "알아두면 좋은 골프 팁",
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
    isVisible: false,
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
