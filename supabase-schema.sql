-- 보령항공여행사 여행 상품 테이블
-- 생성 일시: 2026-02-04
-- 총 456개 상품 임포트 예정

-- 테이블 생성
CREATE TABLE IF NOT EXISTS tour_products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  category TEXT,
  nights INTEGER,
  days INTEGER,
  duration TEXT,
  price INTEGER,
  excerpt TEXT,
  content TEXT,
  content_html TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  published_at TIMESTAMPTZ,
  naver_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_tour_products_destination ON tour_products(destination);
CREATE INDEX IF NOT EXISTS idx_tour_products_is_active ON tour_products(is_active);
CREATE INDEX IF NOT EXISTS idx_tour_products_is_featured ON tour_products(is_featured);
CREATE INDEX IF NOT EXISTS idx_tour_products_price ON tour_products(price);
CREATE INDEX IF NOT EXISTS idx_tour_products_sort_order ON tour_products(sort_order);

-- 전문 검색 인덱스 (한글 검색)
CREATE INDEX IF NOT EXISTS idx_tour_products_title_search ON tour_products 
USING gin(to_tsvector('english', title));

-- RLS (Row Level Security) 설정
ALTER TABLE tour_products ENABLE ROW LEVEL SECURITY;

-- Public 읽기 허용 (활성 상품만)
DROP POLICY IF EXISTS "Anyone can view active products" ON tour_products;
CREATE POLICY "Anyone can view active products"
ON tour_products FOR SELECT
USING (is_active = true);

-- Service role은 모든 작업 가능
DROP POLICY IF EXISTS "Service role can do everything" ON tour_products;
CREATE POLICY "Service role can do everything"
ON tour_products FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 완료 메시지
SELECT 'tour_products 테이블 생성 완료!' as message;
