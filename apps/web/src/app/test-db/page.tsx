import { prisma } from '@/lib/prisma';

export default async function TestDbPage() {
  console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL);
  console.log('🔍 DIRECT_URL:', process.env.DIRECT_URL);

  try {
    const count = await prisma.tourProduct.count();
    const samples = await prisma.tourProduct.findMany({ take: 3 });

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">DB 연결 테스트</h1>
        <p>✅ 전체 상품: {count}개</p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">샘플:</h2>
          <ul className="list-disc pl-6">
            {samples.map((s) => (
              <li key={s.id}>{s.title}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">에러 발생</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {error.message}
        </pre>
      </div>
    );
  }
}
