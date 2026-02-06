import { supabase } from '@/lib/supabase';
import { TourCard } from '@/components/tours/TourCard';
import { TourFilters } from '@/components/tours/TourFilters';
import { SiteHeader } from '@/components/common/SiteHeader';

async function getProducts() {
  const { data, error } = await supabase
    .from('tour_products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Supabase 오류:', error);
    return [];
  }

  return data || [];
}

export default async function ToursPage() {
  const products = await getProducts();

  // 목적지별 카테고리
  const destinationMap: Record<string, string> = {
    'JAPAN': '일본',
    'SOUTHEAST_ASIA': '동남아',
    'KOREA': '국내',
    'TAIWAN': '대만',
    'CHINA': '중국',
    'AMERICAS': '미주',
    'OTHER': '기타'
  };

  const destinations = [
    { key: '전체', count: products.length },
    ...Object.entries(destinationMap).map(([key, label]) => ({
      key: label,
      count: products.filter(p => p.destination === key).length
    }))
  ].filter(d => d.count > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            골프 여행 상품
          </h1>
          <p className="text-lg text-gray-600">
            {products.length}개의 엄선된 골프 여행 상품을 만나보세요
          </p>
        </div>

        {/* 필터 */}
        <TourFilters destinations={destinations} />

        {/* 상품 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <TourCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

// 동적 렌더링 (DB 데이터이므로)
export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60초마다 재검증
