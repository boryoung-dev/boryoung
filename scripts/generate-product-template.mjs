/**
 * 상품등록 엑셀 템플릿 생성 스크립트
 * DB 스키마와 정확히 매칭되는 값 사용 (한글 + DB값 병기)
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const ExcelJS = require("/tmp/node_modules/exceljs");

const wb = new ExcelJS.Workbook();
wb.creator = "보령골프투어";
wb.created = new Date();

// ============================================
// DB 상수값 정의 (seed.ts 및 schema.prisma 기반)
// ============================================
const DB = {
  categories: [
    "일본(japan)", "태국(thailand)", "베트남(vietnam)", "대만(taiwan)",
    "라오스(laos)", "괌 및 사이판(guam-saipan)", "유럽 및 하와이(europe-hawaii)",
    "몽골(mongolia)", "기타(other)", "단체여행(group-travel)", "국내 및 제주도(domestic-jeju)",
  ],
  difficulty: ["초급(BEGINNER)", "중급(INTERMEDIATE)", "상급(ADVANCED)", "전체(ALL)"],
  priceType: ["1인당(PER_PERSON)", "1실당(PER_ROOM)", "추가비용(ADDITIONAL)"],
  season: ["성수기(PEAK)", "일반(REGULAR)", "비수기(OFF)"],
  tags: [
    "가성비(value)", "프리미엄(premium)", "54홀(54-holes)",
    "단기(short)", "장기(long)", "2인출발(2-people)",
    "단체(group)", "5성급호텔(5-star)",
  ],
  imageType: ["대표(THUMBNAIL)", "상세(DETAIL)", "골프장(GOLF_COURSE)", "호텔(HOTEL)", "식사(FOOD)"],
  scheduleStatus: ["예약가능(available)", "마감임박(few_left)", "마감(sold_out)"],
};

// ============================================
// 공통 스타일
// ============================================
const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5496" } };
const requiredFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC00000" } };
const exampleFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
const whiteFont = { name: "맑은 고딕", bold: true, size: 11, color: { argb: "FFFFFFFF" } };
const exampleFont = { name: "맑은 고딕", size: 10, color: { argb: "FF666666" } };
const descFont = { name: "맑은 고딕", size: 8, color: { argb: "FF808080" }, italic: true };
const thinBorder = {
  top: { style: "thin", color: { argb: "FFD9D9D9" } },
  left: { style: "thin", color: { argb: "FFD9D9D9" } },
  bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
  right: { style: "thin", color: { argb: "FFD9D9D9" } },
};

/** 시트에 공통 구조 적용하는 헬퍼 */
function setupSheet(ws, cols, notice, maxDataRow) {
  ws.columns = cols.map((c) => ({ width: c.width }));

  // Row 1: 안내
  const lastCol = String.fromCharCode(64 + cols.length);
  ws.mergeCells(`A1:${lastCol}1`);
  const cell1 = ws.getCell("A1");
  cell1.value = notice;
  cell1.font = { name: "맑은 고딕", size: 10, bold: true, color: { argb: "FFC00000" } };
  cell1.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 25;

  // Row 2: 설명
  const descRow = ws.getRow(2);
  cols.forEach((col, i) => {
    const cell = descRow.getCell(i + 1);
    cell.value = col.desc;
    cell.font = descFont;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });
  descRow.height = 35;

  // Row 3: 헤더
  const headerRow = ws.getRow(3);
  cols.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.required ? `★ ${col.header}` : col.header;
    cell.font = whiteFont;
    cell.fill = col.required ? requiredFill : headerFill;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });
  headerRow.height = 30;

  return ws;
}

/** 예시 데이터 행 추가 */
function addExampleRows(ws, examples, startRow, rowHeight) {
  examples.forEach((data, rowIdx) => {
    const row = ws.getRow(startRow + rowIdx);
    data.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = exampleFont;
      cell.fill = exampleFill;
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = thinBorder;
    });
    row.height = rowHeight;
  });
}

/** 빈 입력행에 테두리 */
function addEmptyRows(ws, startRow, endRow, colCount, rowHeight) {
  for (let r = startRow; r <= endRow; r++) {
    const row = ws.getRow(r);
    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.alignment = { vertical: "middle", wrapText: true };
    }
    if (rowHeight) row.height = rowHeight;
  }
}

// ============================================
// Sheet 1: 상품 기본정보
// ============================================
const ws1 = wb.addWorksheet("상품 기본정보", { views: [{ state: "frozen", ySplit: 3 }] });

const cols1 = [
  { header: "상품명", width: 35, required: true, desc: "상품 제목 (예: 베트남 다낭 3박5일 골프투어)" },
  { header: "부제목", width: 30, required: false, desc: "부제목 (예: 프리미엄 3색 라운딩)" },
  { header: "카테고리", width: 22, required: true, desc: `드롭다운 선택. 괄호 안 = DB slug` },
  { header: "목적지", width: 15, required: true, desc: "여행 목적지 (예: 베트남 다낭)" },
  { header: "출발지", width: 12, required: false, desc: "인천 / 김포 / 부산 / 대구 등" },
  { header: "항공사", width: 15, required: false, desc: "항공사명 (예: 대한항공)" },
  { header: "숙박(박)", width: 10, required: true, desc: "숫자만 입력" },
  { header: "여행(일)", width: 10, required: true, desc: "숫자만 입력" },
  { header: "기간텍스트", width: 14, required: false, desc: "표시용. 비우면 자동생성" },
  { header: "골프코스명", width: 28, required: false, desc: "여러개면 쉼표로 구분" },
  { header: "총 홀수", width: 10, required: false, desc: "숫자만 (예: 54)" },
  { header: "난이도", width: 18, required: false, desc: "드롭다운 선택. 괄호 안 = DB값" },
  { header: "최소인원", width: 10, required: false, desc: "숫자만" },
  { header: "최대인원", width: 10, required: false, desc: "숫자만" },
  { header: "판매가(원)", width: 15, required: true, desc: "1인 기준 (숫자만)" },
  { header: "정가(원)", width: 15, required: false, desc: "할인 전 정가 (숫자만)" },
  { header: "포함사항", width: 40, required: false, desc: "쉼표로 구분" },
  { header: "불포함사항", width: 40, required: false, desc: "쉼표로 구분" },
  { header: "태그", width: 30, required: false, desc: "드롭다운 선택 또는 쉼표 구분 입력" },
  { header: "대표이미지", width: 25, required: true, desc: "파일명 (예: danang_main.jpg)" },
  { header: "상세이미지", width: 35, required: false, desc: "쉼표 구분 파일명" },
  { header: "골프장이미지", width: 35, required: false, desc: "쉼표 구분 파일명" },
  { header: "호텔이미지", width: 35, required: false, desc: "쉼표 구분 파일명" },
  { header: "출발일정", width: 30, required: false, desc: "쉼표 구분 (YYYY-MM-DD)" },
  { header: "추천상품", width: 10, required: false, desc: "Y / N" },
  { header: "네이버 URL", width: 35, required: false, desc: "외부 링크" },
];

setupSheet(ws1, cols1,
  "※ 빨간색 헤더 = 필수입력 | 파란색 헤더 = 선택입력 | 회색 행 = 예시 데이터 (삭제 후 입력) | 괄호 안 값 = DB 코드값",
  25
);

const examples1 = [
  [
    "베트남 다낭 3박5일 프리미엄 골프투어",
    "3색 명문코스 라운딩 + 5성급 리조트",
    "베트남(vietnam)",
    "베트남 다낭",
    "인천",
    "대한항공",
    3, 5, "3박5일",
    "바나힐스 GC, 몽고메리링크스, BRG다낭",
    54, "전체(ALL)", 4, 16,
    1290000, 1590000,
    "왕복항공료, 5성급 숙박(3박), 그린피(3회), 카트비, 전용차량, 조식3회",
    "여행자보험, 개인경비, 캐디피(현지지불), 중석식",
    "프리미엄(premium), 54홀(54-holes), 5성급호텔(5-star)",
    "danang_main.jpg",
    "danang_detail_01.jpg, danang_detail_02.jpg",
    "danang_golf_banahills.jpg, danang_golf_montgomery.jpg",
    "danang_hotel_pullman_01.jpg, danang_hotel_pullman_02.jpg",
    "2026-03-15, 2026-03-22, 2026-04-05",
    "Y", "",
  ],
  [
    "태국 파타야 2박3일 골프패키지",
    "시암CC 포함 2색 라운딩",
    "태국(thailand)",
    "태국 파타야",
    "인천",
    "타이에어아시아X",
    2, 3, "2박3일",
    "시암CC 올드코스, 라엠차방 인터내셔널CC",
    36, "중급(INTERMEDIATE)", 2, 12,
    890000, 1100000,
    "왕복항공료, 숙박(2박), 그린피(2회), 카트비, 공항픽업",
    "여행자보험, 개인경비, 캐디피(현지지불), 식사비용",
    "가성비(value), 단기(short), 2인출발(2-people)",
    "pattaya_main.jpg",
    "pattaya_detail_01.jpg, pattaya_detail_02.jpg",
    "pattaya_golf_siam.jpg, pattaya_golf_laem.jpg",
    "pattaya_hotel_amari.jpg",
    "2026-04-10, 2026-04-17",
    "N", "https://smartstore.naver.com/example/123",
  ],
];

addExampleRows(ws1, examples1, 4, 50);

// 금액 포맷 (천단위 콤마)
for (let r = 4; r <= 25; r++) {
  ws1.getCell(`O${r}`).numFmt = "#,##0";
  ws1.getCell(`P${r}`).numFmt = "#,##0";
}

addEmptyRows(ws1, 6, 25, cols1.length, 25);

// 데이터 유효성 검사 - DB값과 정확히 매칭
ws1.dataValidations.add("C4:C25", {
  type: "list",
  allowBlank: false,
  formulae: [`"${DB.categories.join(",")}"`],
  showErrorMessage: true,
  errorTitle: "카테고리 오류",
  error: "드롭다운에서 선택해주세요",
});
ws1.dataValidations.add("L4:L25", {
  type: "list",
  allowBlank: true,
  formulae: [`"${DB.difficulty.join(",")}"`],
});
ws1.dataValidations.add("Y4:Y25", {
  type: "list",
  allowBlank: true,
  formulae: ['"Y,N"'],
});

// ============================================
// Sheet 2: 일별 일정
// ============================================
const ws2 = wb.addWorksheet("일별 일정", { views: [{ state: "frozen", ySplit: 3 }] });

const cols2 = [
  { header: "상품명", width: 35, required: true, desc: "Sheet1의 상품명과 동일하게 입력" },
  { header: "일차", width: 8, required: true, desc: "숫자만 (예: 1, 2, 3)" },
  { header: "일정 제목", width: 25, required: true, desc: "해당 일차 제목" },
  { header: "일정 상세", width: 50, required: false, desc: "상세 설명" },
  { header: "식사", width: 35, required: false, desc: "예: 조식-호텔식 / 중식-현지식 / 석식-자유식" },
  { header: "숙소", width: 25, required: false, desc: "숙소명" },
  { header: "골프코스", width: 20, required: false, desc: "해당일 라운딩 코스명" },
  { header: "라운딩 홀수", width: 12, required: false, desc: "숫자만 (예: 18)" },
  { header: "이동수단", width: 15, required: false, desc: "전용차량 / 택시 / 도보 등" },
];

setupSheet(ws2, cols2,
  "※ 상품별 일차를 1일차부터 순서대로 입력. 상품명은 '상품 기본정보' 시트와 동일하게 입력합니다.",
  25
);

const itinExamples = [
  ["베트남 다낭 3박5일 프리미엄 골프투어", 1, "인천 출발 → 다낭 도착", "인천국제공항 출발, 다낭 도착 후 호텔 체크인", "석식-환영만찬(현지식)", "풀만 다낭 비치리조트", "", "", "전용차량"],
  ["베트남 다낭 3박5일 프리미엄 골프투어", 2, "바나힐스 GC 라운딩", "오전 바나힐스 골프클럽 18홀 라운딩, 오후 자유시간", "조식-호텔식 / 중식-클럽하우스 / 석식-자유식", "풀만 다낭 비치리조트", "바나힐스 GC", 18, "전용차량"],
  ["베트남 다낭 3박5일 프리미엄 골프투어", 3, "몽고메리링크스 라운딩", "오전 몽고메리링크스 18홀, 오후 호이안 관광", "조식-호텔식 / 중식-클럽하우스 / 석식-현지식", "풀만 다낭 비치리조트", "몽고메리링크스", 18, "전용차량"],
  ["베트남 다낭 3박5일 프리미엄 골프투어", 4, "BRG다낭 라운딩 + 출발", "오전 BRG다낭 18홀, 체크아웃, 공항 이동", "조식-호텔식 / 중식-클럽하우스", "", "BRG다낭", 18, "전용차량"],
  ["베트남 다낭 3박5일 프리미엄 골프투어", 5, "인천 도착", "인천국제공항 도착, 해산", "기내식", "", "", "", ""],
  ["태국 파타야 2박3일 골프패키지", 1, "인천 출발 → 파타야 도착", "인천공항 출발, 방콕 도착 후 파타야 이동", "석식-현지식", "아마리 파타야", "", "", "전용차량"],
  ["태국 파타야 2박3일 골프패키지", 2, "시암CC + 라엠차방CC", "오전 시암CC 올드코스 18홀, 오후 라엠차방CC 18홀", "조식-호텔식 / 중식-클럽하우스 / 석식-현지식", "아마리 파타야", "시암CC, 라엠차방CC", 36, "전용차량"],
  ["태국 파타야 2박3일 골프패키지", 3, "파타야 → 인천 도착", "체크아웃, 방콕 공항 이동, 인천 도착", "조식-호텔식", "", "", "", "전용차량"],
];

addExampleRows(ws2, itinExamples, 4, 35);
addEmptyRows(ws2, 12, 50, cols2.length);

// ============================================
// Sheet 3: 가격 옵션
// ============================================
const ws3 = wb.addWorksheet("가격 옵션", { views: [{ state: "frozen", ySplit: 3 }] });

const cols3 = [
  { header: "상품명", width: 35, required: true, desc: "Sheet1의 상품명과 동일하게 입력" },
  { header: "옵션명", width: 20, required: true, desc: "예: 성인, 아동, 싱글룸 추가" },
  { header: "옵션 설명", width: 30, required: false, desc: "옵션에 대한 설명" },
  { header: "가격(원)", width: 15, required: true, desc: "숫자만 입력" },
  { header: "가격유형", width: 22, required: true, desc: "드롭다운 선택. 괄호 안 = DB값" },
  { header: "시즌", width: 16, required: false, desc: "드롭다운 선택. 괄호 안 = DB값" },
  { header: "적용시작일", width: 15, required: false, desc: "YYYY-MM-DD" },
  { header: "적용종료일", width: 15, required: false, desc: "YYYY-MM-DD" },
  { header: "기본옵션", width: 10, required: false, desc: "Y / N (대표 가격 여부)" },
];

setupSheet(ws3, cols3,
  "※ 상품별 가격 옵션을 입력합니다. 기본 판매가 외에 추가 옵션이 있을 때 사용합니다.",
  25
);

const priceExamples = [
  ["베트남 다낭 3박5일 프리미엄 골프투어", "2인1실 성인", "만 12세 이상", 1290000, "1인당(PER_PERSON)", "일반(REGULAR)", "2026-03-01", "2026-06-30", "Y"],
  ["베트남 다낭 3박5일 프리미엄 골프투어", "1인1실 성인", "싱글룸 사용", 1540000, "1인당(PER_PERSON)", "일반(REGULAR)", "2026-03-01", "2026-06-30", "N"],
  ["베트남 다낭 3박5일 프리미엄 골프투어", "골프 1R 추가", "추가 라운딩 요금", 200000, "추가비용(ADDITIONAL)", "", "", "", "N"],
  ["태국 파타야 2박3일 골프패키지", "성인", "만 12세 이상", 890000, "1인당(PER_PERSON)", "일반(REGULAR)", "2026-04-01", "2026-06-30", "Y"],
  ["태국 파타야 2박3일 골프패키지", "성수기 성인", "만 12세 이상 (7~8월)", 1050000, "1인당(PER_PERSON)", "성수기(PEAK)", "2026-07-01", "2026-08-31", "N"],
];

addExampleRows(ws3, priceExamples, 4, 30);

// 금액 포맷
for (let r = 4; r <= 30; r++) {
  ws3.getCell(`D${r}`).numFmt = "#,##0";
}

ws3.dataValidations.add("E4:E30", {
  type: "list", allowBlank: false, formulae: [`"${DB.priceType.join(",")}"`],
});
ws3.dataValidations.add("F4:F30", {
  type: "list", allowBlank: true, formulae: [`"${DB.season.join(",")}"`],
});
ws3.dataValidations.add("I4:I30", {
  type: "list", allowBlank: true, formulae: ['"Y,N"'],
});

addEmptyRows(ws3, 9, 30, cols3.length);

// ============================================
// Sheet 4: 상품 상세설명
// ============================================
const ws4d = wb.addWorksheet("상품 상세설명", { views: [{ state: "frozen", ySplit: 3 }] });

const cols4 = [
  { header: "상품명", width: 35, required: true, desc: "Sheet1의 상품명과 동일하게 입력" },
  { header: "상세설명", width: 100, required: true, desc: "상세 페이지에 표시될 내용. 줄바꿈: Alt+Enter" },
];

setupSheet(ws4d, cols4,
  "※ 상품 상세 페이지에 노출될 설명을 작성합니다. 줄바꿈(Alt+Enter)으로 자유롭게 작성해주세요.",
  200
);

const descExamples = [
  [
    "베트남 다낭 3박5일 프리미엄 골프투어",
    `[상품 하이라이트]
- 베트남 다낭 TOP3 명문 골프코스 3색 라운딩 (바나힐스 GC, 몽고메리링크스, BRG다낭)
- 5성급 풀만 다낭 비치리조트 3박 숙박
- 대한항공 직항 이용 (인천↔다낭)
- 전 일정 전용차량 + 한국어 가이드 동행

[코스 소개]
1. 바나힐스 골프클럽 (Ba Na Hills Golf Club)
   - 루크 도널드 설계 / 18홀 Par 72
   - 해발 1,400m 고원에 위치한 베트남 최고의 산악 코스
   - 2024 아시아 베스트 골프코스 선정

2. 몽고메리링크스 (Montgomerie Links)
   - 콜린 몽고메리 설계 / 18홀 Par 72
   - 바다와 산이 어우러진 링크스 스타일 코스
   - 다낭 국제공항에서 20분 거리

3. BRG 다낭 골프리조트 (BRG Da Nang Golf Resort)
   - 니클라우스 설계 / 18홀 Par 72
   - 넓은 페어웨이와 전략적 벙커 배치

[숙소]
풀만 다낭 비치리조트 (Pullman Danang Beach Resort) ★★★★★
- 미케 비치 앞 오션뷰 리조트
- 인피니티 풀, 스파, 피트니스 완비
- 조식 뷔페 포함

[유의사항]
- 캐디피는 현지에서 직접 지불 (1라운드 약 $25~30)
- 여행자보험 별도 가입 권장
- 우천 시 일정이 변경될 수 있습니다
- 최소 출발인원 4명 (미달 시 출발일 변경 가능)`,
  ],
  [
    "태국 파타야 2박3일 골프패키지",
    `[상품 하이라이트]
- 태국 명문 시암CC 올드코스 라운딩 포함
- 라엠차방 인터내셔널CC 2색 라운딩
- 아마리 파타야 4성급 호텔 2박
- 공항 픽업 + 전용차량 포함

[코스 소개]
1. 시암 컨트리클럽 올드코스 (Siam Country Club Old Course)
   - 태국 대표 명문 코스 / 18홀 Par 72
   - 혼다 LPGA 타일랜드 개최지
   - 전략적인 코스 설계와 아름다운 자연경관

2. 라엠차방 인터내셔널 CC (Laem Chabang International CC)
   - 잭 니클라우스 설계 / 27홀 (A, B, C 코스)
   - 산과 계곡을 활용한 다이나믹한 코스

[숙소]
아마리 파타야 (Amari Pattaya) ★★★★
- 파타야 비치 로드 위치
- 루프탑 풀, 레스토랑 완비

[유의사항]
- 캐디피 현지 지불 (1라운드 약 400~500바트)
- 식사비용 별도 (중식, 석식)
- 최소 출발인원 2명`,
  ],
];

addExampleRows(ws4d, descExamples, 4, 300);
// 빈 행 (상세설명은 높이 크게)
for (let r = 6; r <= 25; r++) {
  const row = ws4d.getRow(r);
  for (let c = 1; c <= 2; c++) {
    row.getCell(c).border = thinBorder;
    row.getCell(c).alignment = { vertical: "top", wrapText: true };
  }
  row.height = 200;
}

// ============================================
// Sheet 5: DB 코드 참조표
// ============================================
const ws5ref = wb.addWorksheet("DB 코드 참조표");
ws5ref.columns = [{ width: 15 }, { width: 30 }, { width: 20 }, { width: 50 }];

const refTitle = { name: "맑은 고딕", bold: true, size: 14, color: { argb: "FF2F5496" } };
const refSection = { name: "맑은 고딕", bold: true, size: 11, color: { argb: "FF2F5496" } };
const refFont = { name: "맑은 고딕", size: 10 };
const refBold = { name: "맑은 고딕", size: 10, bold: true };

ws5ref.mergeCells("A1:D1");
ws5ref.getCell("A1").value = "DB 코드 참조표 — 드롭다운에 표시되는 값의 의미를 설명합니다";
ws5ref.getCell("A1").font = refTitle;
ws5ref.getRow(1).height = 35;

let row = 3;

// 카테고리
ws5ref.getCell(`A${row}`).value = "카테고리";
ws5ref.getCell(`A${row}`).font = refSection;
ws5ref.getCell(`B${row}`).value = "표시값";
ws5ref.getCell(`B${row}`).font = refBold;
ws5ref.getCell(`C${row}`).value = "DB slug";
ws5ref.getCell(`C${row}`).font = refBold;
ws5ref.getCell(`D${row}`).value = "설명";
ws5ref.getCell(`D${row}`).font = refBold;
row++;

const catDetails = [
  ["일본", "japan", "일본 골프 투어"],
  ["태국", "thailand", "태국 골프 투어"],
  ["베트남", "vietnam", "베트남 골프 & 리조트"],
  ["대만", "taiwan", "대만 프리미엄 골프"],
  ["라오스", "laos", "라오스 골프 투어"],
  ["괌 및 사이판", "guam-saipan", "괌·사이판 골프 리조트"],
  ["유럽 및 하와이", "europe-hawaii", "유럽·하와이 골프 투어"],
  ["몽골(울란바토르)", "mongolia", "몽골 골프 투어"],
  ["기타", "other", "기타 지역 골프 투어"],
  ["단체여행(인센티브)", "group-travel", "단체 골프 투어 및 인센티브"],
  ["국내 및 제주도", "domestic-jeju", "국내·제주 골프 패키지"],
];
catDetails.forEach(([name, slug, desc]) => {
  ws5ref.getCell(`B${row}`).value = name; ws5ref.getCell(`B${row}`).font = refFont;
  ws5ref.getCell(`C${row}`).value = slug; ws5ref.getCell(`C${row}`).font = refFont;
  ws5ref.getCell(`D${row}`).value = desc; ws5ref.getCell(`D${row}`).font = refFont;
  row++;
});

row++;

// 난이도
ws5ref.getCell(`A${row}`).value = "난이도"; ws5ref.getCell(`A${row}`).font = refSection;
ws5ref.getCell(`B${row}`).value = "표시값"; ws5ref.getCell(`B${row}`).font = refBold;
ws5ref.getCell(`C${row}`).value = "DB 값"; ws5ref.getCell(`C${row}`).font = refBold;
row++;
[["초급", "BEGINNER"], ["중급", "INTERMEDIATE"], ["상급", "ADVANCED"], ["전체", "ALL"]].forEach(([k, v]) => {
  ws5ref.getCell(`B${row}`).value = k; ws5ref.getCell(`B${row}`).font = refFont;
  ws5ref.getCell(`C${row}`).value = v; ws5ref.getCell(`C${row}`).font = refFont;
  row++;
});

row++;

// 가격유형
ws5ref.getCell(`A${row}`).value = "가격유형"; ws5ref.getCell(`A${row}`).font = refSection;
ws5ref.getCell(`B${row}`).value = "표시값"; ws5ref.getCell(`B${row}`).font = refBold;
ws5ref.getCell(`C${row}`).value = "DB 값"; ws5ref.getCell(`C${row}`).font = refBold;
row++;
[["1인당", "PER_PERSON"], ["1실당", "PER_ROOM"], ["추가비용", "ADDITIONAL"]].forEach(([k, v]) => {
  ws5ref.getCell(`B${row}`).value = k; ws5ref.getCell(`B${row}`).font = refFont;
  ws5ref.getCell(`C${row}`).value = v; ws5ref.getCell(`C${row}`).font = refFont;
  row++;
});

row++;

// 시즌
ws5ref.getCell(`A${row}`).value = "시즌"; ws5ref.getCell(`A${row}`).font = refSection;
ws5ref.getCell(`B${row}`).value = "표시값"; ws5ref.getCell(`B${row}`).font = refBold;
ws5ref.getCell(`C${row}`).value = "DB 값"; ws5ref.getCell(`C${row}`).font = refBold;
row++;
[["성수기", "PEAK"], ["일반", "REGULAR"], ["비수기", "OFF"]].forEach(([k, v]) => {
  ws5ref.getCell(`B${row}`).value = k; ws5ref.getCell(`B${row}`).font = refFont;
  ws5ref.getCell(`C${row}`).value = v; ws5ref.getCell(`C${row}`).font = refFont;
  row++;
});

row++;

// 태그
ws5ref.getCell(`A${row}`).value = "태그"; ws5ref.getCell(`A${row}`).font = refSection;
ws5ref.getCell(`B${row}`).value = "표시값"; ws5ref.getCell(`B${row}`).font = refBold;
ws5ref.getCell(`C${row}`).value = "DB slug"; ws5ref.getCell(`C${row}`).font = refBold;
ws5ref.getCell(`D${row}`).value = "태그 유형"; ws5ref.getCell(`D${row}`).font = refBold;
row++;
[
  ["가성비", "value", "PRICE_RANGE"], ["프리미엄", "premium", "PRICE_RANGE"],
  ["54홀", "54-holes", "FEATURE"], ["단기", "short", "DURATION"],
  ["장기", "long", "DURATION"], ["2인출발", "2-people", "FEATURE"],
  ["단체", "group", "FEATURE"], ["5성급호텔", "5-star", "ACCOMMODATION"],
].forEach(([name, slug, type]) => {
  ws5ref.getCell(`B${row}`).value = name; ws5ref.getCell(`B${row}`).font = refFont;
  ws5ref.getCell(`C${row}`).value = slug; ws5ref.getCell(`C${row}`).font = refFont;
  ws5ref.getCell(`D${row}`).value = type; ws5ref.getCell(`D${row}`).font = refFont;
  row++;
});

row++;

// 이미지 유형
ws5ref.getCell(`A${row}`).value = "이미지유형"; ws5ref.getCell(`A${row}`).font = refSection;
ws5ref.getCell(`B${row}`).value = "시트 컬럼명"; ws5ref.getCell(`B${row}`).font = refBold;
ws5ref.getCell(`C${row}`).value = "DB type 값"; ws5ref.getCell(`C${row}`).font = refBold;
row++;
[
  ["대표이미지", "THUMBNAIL"], ["상세이미지", "DETAIL"],
  ["골프장이미지", "GOLF_COURSE"], ["호텔이미지", "HOTEL"],
].forEach(([k, v]) => {
  ws5ref.getCell(`B${row}`).value = k; ws5ref.getCell(`B${row}`).font = refFont;
  ws5ref.getCell(`C${row}`).value = v; ws5ref.getCell(`C${row}`).font = refFont;
  row++;
});

// ============================================
// Sheet 6: 작성 가이드
// ============================================
const ws6 = wb.addWorksheet("작성 가이드");
ws6.columns = [{ width: 20 }, { width: 60 }, { width: 40 }];

ws6.mergeCells("A1:C1");
ws6.getCell("A1").value = "상품등록 엑셀 작성 가이드";
ws6.getCell("A1").font = refTitle;
ws6.getRow(1).height = 35;

const guideData = [
  { row: 3, data: ["시트 구성", "설명", "비고"], font: refSection },
  { row: 4, data: ["① 상품 기본정보", "상품의 기본 정보 (1상품 = 1행)", "★ = 필수입력"] },
  { row: 5, data: ["② 일별 일정", "상품별 일차별 일정", "상품명으로 매칭"] },
  { row: 6, data: ["③ 가격 옵션", "성인/아동/시즌별 가격", "기본 판매가 외 추가옵션"] },
  { row: 7, data: ["④ 상품 상세설명", "상세 페이지 긴 설명", "줄바꿈: Alt+Enter"] },
  { row: 8, data: ["⑤ DB 코드 참조표", "드롭다운 값의 DB 코드 설명", "업로드 시 자동 매핑"] },
  { row: 10, data: ["입력 규칙", "설명", "예시"], font: refSection },
  { row: 11, data: ["상품명 일치", "모든 시트에서 동일한 상품명 사용 필수", "시트간 매칭 키로 사용"] },
  { row: 12, data: ["괄호 안 값", "드롭다운의 괄호 안 값 = DB 실제 코드값", "베트남(vietnam) → DB에 vietnam 저장"] },
  { row: 13, data: ["금액 입력", "숫자만 입력 → 자동으로 천단위 콤마 표시", "1290000 입력 → 1,290,000 표시"] },
  { row: 14, data: ["날짜 형식", "YYYY-MM-DD 형식으로 입력", "2026-03-15"] },
  { row: 15, data: ["다중값 입력", "쉼표(,)로 구분하여 입력", "왕복항공료, 숙박, 그린피"] },
  { row: 16, data: ["Y/N 필드", "Y 또는 N만 입력", "추천상품: Y, 기본옵션: Y"] },
  { row: 18, data: ["이미지 안내", "", ""], font: refSection },
  { row: 19, data: ["파일명 규칙", "영문+숫자+언더스코어로 작성", "danang_main.jpg (O) / 다낭 메인.jpg (X)"] },
  { row: 20, data: ["전달 방법", "엑셀 파일 + 이미지 폴더를 함께 전달", "images/ 폴더에 정리"] },
  { row: 21, data: ["권장 사이즈", "대표: 1200x800px 이상 / 상세: 자유", "JPG, PNG, WebP"] },
  { row: 23, data: ["주의사항", "", ""], font: refSection },
  { row: 24, data: ["", "회색 예시 데이터 행은 반드시 삭제 후 입력해주세요", ""] },
  { row: 25, data: ["", "가격은 부가세 포함 금액으로 입력해주세요", ""] },
  { row: 26, data: ["", "드롭다운 값을 임의로 변경하지 마세요 (DB 매핑 오류 발생)", ""] },
  { row: 27, data: ["", "새로운 카테고리/태그가 필요하면 별도로 요청해주세요", ""] },
];

guideData.forEach(({ row: r, data, font }) => {
  const wsRow = ws6.getRow(r);
  data.forEach((val, i) => {
    const cell = wsRow.getCell(i + 1);
    cell.value = val;
    cell.font = font || (i === 0 && val ? refBold : refFont);
  });
});

// ============================================
// 저장
// ============================================
const outputPath = "/Users/simjaehyeong/Desktop/side/boryoung/상품등록_템플릿.xlsx";
await wb.xlsx.writeFile(outputPath);
console.log(`엑셀 템플릿 생성 완료: ${outputPath}`);
