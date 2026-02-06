import { SiteHeader } from '@/components/common/SiteHeader';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
            <p>
              본 약관은 보령항공여행사(이하 "회사")가 제공하는 여행 서비스의 이용과 관련하여 
              회사와 고객 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>"여행 서비스"란 회사가 제공하는 골프 여행 패키지 및 관련 서비스를 말합니다.</li>
              <li>"고객"이란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li>"예약"이란 고객이 특정 여행 상품에 대해 이용 의사를 표시하고 회사가 이를 승낙하는 것을 말합니다.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 명시 및 변경)</h2>
            <p>
              회사는 본 약관의 내용을 고객이 쉽게 알 수 있도록 웹사이트에 게시합니다.
              회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며,
              변경된 약관은 웹사이트에 공지함으로써 효력이 발생합니다.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (여행 계약의 체결)</h2>
            <p>
              여행 계약은 고객이 예약 신청을 하고 회사가 이를 승낙함으로써 체결됩니다.
              회사는 다음의 경우 예약 신청을 승낙하지 않을 수 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>신청 내용에 허위 사실이 있는 경우</li>
              <li>예약 가능 인원이 초과된 경우</li>
              <li>기타 회사가 정한 이용 조건에 맞지 않는 경우</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (예약금 및 잔금)</h2>
            <p>
              고객은 여행 계약 체결 시 회사가 정한 예약금을 지불해야 하며,
              여행 출발 전 회사가 정한 기일까지 잔금을 완납해야 합니다.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (계약의 해제 및 환불)</h2>
            <p>
              고객 또는 회사는 여행 출발 전 계약을 해제할 수 있으며,
              이 경우 '국외여행표준약관'에 따라 환불이 이루어집니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>여행 출발일 30일 전까지: 계약금 환급</li>
              <li>여행 출발일 20일 전까지: 여행요금의 10% 배상</li>
              <li>여행 출발일 10일 전까지: 여행요금의 15% 배상</li>
              <li>여행 출발일 8일 전까지: 여행요금의 20% 배상</li>
              <li>여행 출발일 1일 전까지: 여행요금의 30% 배상</li>
              <li>여행 당일: 여행요금의 50% 배상</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (회사의 책임)</h2>
            <p>
              회사는 여행 서비스 제공과 관련하여 고의 또는 과실로 고객에게 손해를 입힌 경우
              관련 법령에 따라 손해를 배상할 책임이 있습니다.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (고객의 의무)</h2>
            <p>고객은 다음의 의무를 준수해야 합니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>여행 관련 법규 및 현지 규정 준수</li>
              <li>여권, 비자 등 여행에 필요한 서류 준비</li>
              <li>회사 또는 인솔자의 정당한 안내 및 지시 준수</li>
              <li>타인에게 피해를 주는 행위 금지</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (분쟁 해결)</h2>
            <p>
              본 약관과 관련한 분쟁은 대한민국 법률을 준거법으로 하며,
              소송이 필요한 경우 회사의 주소지를 관할하는 법원을 전속 관할법원으로 합니다.
            </p>
          </section>
          
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
            <p>본 약관은 2024년 1월 1일부터 시행됩니다.</p>
          </section>
        </div>
        
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
