import { SiteHeader } from '@/components/common/SiteHeader';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <p className="text-sm text-gray-600 mb-4">
              보령항공여행사(이하 "회사")는 고객의 개인정보를 소중히 여기며, 
              「개인정보 보호법」을 준수하고 있습니다.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>여행 상품 예약 및 계약 이행</li>
              <li>여행 관련 안내 및 상담</li>
              <li>고객 문의사항 처리</li>
              <li>서비스 개선 및 신규 서비스 안내</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold mb-3">필수 항목</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>이름</li>
                <li>전화번호</li>
                <li>여권 정보 (해외여행 시)</li>
              </ul>
              
              <h3 className="font-bold mt-6 mb-3">선택 항목</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>이메일 주소</li>
                <li>생년월일</li>
                <li>추가 요청사항</li>
              </ul>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 
              동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 원칙적으로 고객의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>고객이 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>여행 서비스 제공을 위해 필요한 경우 (항공사, 호텔, 골프장 등)</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보 처리의 위탁</h2>
            <p>
              회사는 서비스 향상을 위해 아래와 같이 개인정보 처리업무를 위탁하고 있습니다:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mt-4">
              <ul className="space-y-2">
                <li><strong>수탁업체:</strong> 여행 관련 협력사</li>
                <li><strong>위탁업무 내용:</strong> 항공권 발권, 호텔 예약, 골프장 예약 등</li>
              </ul>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 정보주체의 권리·의무</h2>
            <p>고객은 다음과 같은 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-4">
              권리 행사는 회사에 대해 서면, 전화, 이메일 등을 통하여 하실 수 있으며,
              회사는 이에 대해 지체없이 조치하겠습니다.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 개인정보의 안전성 확보 조치</h2>
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 하고 있습니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
              <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화</li>
              <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보 보호책임자</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="mb-2"><strong>개인정보 보호책임자</strong></p>
              <ul className="space-y-1 text-sm">
                <li>성명: 이종양</li>
                <li>직책: 대표이사</li>
                <li>연락처: 1588-0320</li>
                <li>이메일: admin@boryoung.com</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              개인정보 침해로 인한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하실 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
              <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
              <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
              <li>대검찰청 사이버범죄수사단: (국번없이) 1301 (www.spo.go.kr)</li>
              <li>경찰청 사이버안전국: (국번없이) 182 (cyberbureau.police.go.kr)</li>
            </ul>
          </section>
          
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
            <p>본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.</p>
            <p className="mt-2 text-sm text-gray-600">
              본 방침은 법령, 정책 또는 보안기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있으며,
              변경 시에는 웹사이트를 통해 공지하겠습니다.
            </p>
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
