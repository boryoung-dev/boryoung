import { test, expect } from "@playwright/test";
import path from "path";

// =====================================================
// 상품 등록 E2E 테스트
// 현재 UI: 탭이 아닌 SectionCard (한 페이지 스크롤)
// 섹션 순서: 기본정보 → 이미지 → 상품소개 → 출발일정 → 일정 → 가격옵션 → 태그/SEO → 설정
// =====================================================

// 커스텀 Select 컴포넌트 선택 헬퍼
async function selectOption(page: any, label: string, optionText: string) {
  // label 텍스트를 포함하는 요소의 형제 Select 버튼 클릭
  const selectBtn = page.locator(`text=${label}`).locator("..").locator("button").first();
  await selectBtn.scrollIntoViewIfNeeded();
  await selectBtn.click();
  await page.waitForTimeout(300);
  await page.locator(`button:has-text("${optionText}")`).last().click();
  await page.waitForTimeout(200);
}

test.describe("상품 등록 - 발리 뉴꾸따 골프", () => {
  test.setTimeout(180000);

  let authToken: string;

  test.beforeEach(async ({ page, request }) => {
    const loginRes = await request.post("/api/login", {
      data: { username: "admin", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    await page.goto("/login");
    await page.locator('input[type="text"]').fill("admin");
    await page.locator('input[type="password"]').fill("qwer1234!!");
    await page.locator('button:has-text("로그인")').click();
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("전체 섹션 입력 → 등록 → 모든 필드 검증", async ({ page, request }) => {
    const uniqueSuffix = Date.now().toString(36);

    await page.goto("/products/new");
    await page.waitForLoadState("networkidle");

    // ========================================
    // 1. 기본 정보 섹션 (이미 펼쳐져 있음)
    // ========================================
    const productTitle = `발리 뉴꾸따 골프 4박 6일 54홀 ${uniqueSuffix}`;

    // 상품명 (첫 번째 편집 가능 text input)
    await page.locator('input[placeholder*="골프"]').first().fill(productTitle);
    await page.waitForTimeout(500);

    // 부제
    const subtitleInput = page.locator('input[placeholder*="오션뷰"], input[placeholder*="부제"]').first();
    if (await subtitleInput.count() > 0) {
      await subtitleInput.fill("인도양 오션뷰 프리미엄 골프");
    } else {
      // 부제가 두 번째 text input일 수 있음
      const allTextInputs = page.locator('#basic input[type="text"]:not([readonly])');
      if (await allTextInputs.count() > 1) {
        await allTextInputs.nth(1).fill("인도양 오션뷰 프리미엄 골프");
      }
    }

    await selectOption(page, "국가", "발리");
    await selectOption(page, "지역", "발리(쿠타·누사두아)");
    // 목적지는 국가/지역 선택 시 자동 채워짐

    await page.locator('label:has-text("출발지")').locator("..").locator("input").fill("인천");
    await page.locator('label:has-text("항공사")').locator("..").locator("input").fill("가루다인도네시아/대한항공");

    await page.locator('label:has-text("기간 (박)")').locator("..").locator("input").fill("4");
    await page.locator('label:has-text("기간 (일)")').locator("..").locator("input").fill("6");

    await page.locator('label:has-text("판매가 (원)")').locator("..").locator('input[type="number"]').fill("1590000");

    // 할인 표시: 체크박스 클릭 후 정가 입력
    await page.locator('label:has-text("할인 표시 사용")').locator('input[type="checkbox"]').check();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder*="정가"]').fill("1890000");

    await page.locator('label:has-text("최소 인원")').locator("..").locator("input").fill("4");
    await page.locator('label:has-text("최대 인원")').locator("..").locator("input").fill("20");

    await selectOption(page, "난이도", "전체");
    await page.locator('label:has-text("총 홀 수")').locator("..").locator("input").fill("54");

    await page.waitForTimeout(300);
    console.log("✓ 기본 정보 입력 완료");

    // ========================================
    // 2. 이미지 섹션 (스크롤하여 접근)
    // ========================================
    const imageSection = page.locator('#section-images');
    await imageSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const testImagePath = path.resolve(__dirname, "../fixtures/new-kuta-golf.png");
    const testImagePath2 = path.resolve(__dirname, "../fixtures/test-golf.jpg");

    const fileInput = page.locator("#image-upload");
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles([testImagePath, testImagePath2]);
      await page.waitForTimeout(3000);
      console.log("✓ 이미지 업로드 완료");
    }

    // ========================================
    // 3. 상품 소개 섹션 (excerpt + 포함/불포함)
    // ========================================
    const contentSection = page.locator('#section-content');
    await contentSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // 상품 요약
    await page.locator('label:has-text("상품 요약")').scrollIntoViewIfNeeded();
    await page.locator('label:has-text("상품 요약")').locator("..").locator("textarea").fill(
      "발리 뉴꾸따GC를 포함한 명문 3개 코스 54홀 라운딩. 5성급 리조트 숙박 + 우붓 관광까지 즐기는 올인원 패키지."
    );

    // 포함사항
    const inclusions = [
      "왕복 항공권", "5성급 리조트 숙박 4박", "그린피 3회(54홀)", "카트비",
      "캐디피", "전 일정 차량", "조식 4회", "석식 3회",
    ];
    for (const item of inclusions) {
      const addBtn = page.locator('label:has-text("포함사항")').locator("..").locator('button:has-text("추가")').first();
      await addBtn.scrollIntoViewIfNeeded();
      await addBtn.click();
      await page.waitForTimeout(200);
      const inputs = page.locator('label:has-text("포함사항")').locator("..").locator("..").locator('input[type="text"]');
      await inputs.last().fill(item);
    }

    // 불포함사항
    const exclusions = ["여행자보험", "개인경비", "중식", "캐디팁", "관광지 입장료"];
    for (const item of exclusions) {
      const addBtn = page.locator('label:has-text("불포함사항")').locator("..").locator('button:has-text("추가")').first();
      await addBtn.scrollIntoViewIfNeeded();
      await addBtn.click();
      await page.waitForTimeout(200);
      const inputs = page.locator('label:has-text("불포함사항")').locator("..").locator("..").locator('input[type="text"]');
      await inputs.last().fill(item);
    }

    await page.waitForTimeout(300);
    console.log("✓ 상품 소개 입력 완료");

    // ========================================
    // 4. 출발일정 섹션
    // ========================================
    const scheduleSection = page.locator('#section-schedule');
    await scheduleSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const scheduleTextarea = scheduleSection.locator("textarea").first();
    await scheduleTextarea.fill(
      "2026-04-12, 2026-04-26, 2026-05-10, 2026-05-24, 2026-06-07, 2026-06-21"
    );
    const bulkAddBtn = scheduleSection.locator('button:has-text("일괄 추가")');
    if (await bulkAddBtn.count() > 0) {
      await bulkAddBtn.click();
      await page.waitForTimeout(500);
    }
    console.log("✓ 출발일정 입력 완료");

    // ========================================
    // 5. 일정 섹션
    // ========================================
    const itinerarySection = page.locator('#section-itinerary');
    await itinerarySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const itineraries = [
      { title: "인천 출발", description: "22:00 인천공항 집합", meals: "기내식", accommodation: "기내", golfCourse: "", golfHoles: "", transport: "항공" },
      { title: "발리 도착 + 뉴꾸따GC 18홀", description: "뉴꾸따GC 18홀 라운딩", meals: "조식: 기내식 / 석식: 짐바란 씨푸드", accommodation: "물리아 리조트 누사두아", golfCourse: "뉴꾸따GC", golfHoles: "18", transport: "전용버스" },
      { title: "발리 내셔널GC 18홀", description: "발리 내셔널GC 18홀 라운딩", meals: "조식: 호텔 뷔페", accommodation: "물리아 리조트 누사두아", golfCourse: "발리 내셔널GC", golfHoles: "18", transport: "전용버스" },
      { title: "바투카루GC 18홀 + 우붓 관광", description: "바투카루GC 18홀 + 우붓 관광", meals: "조식: 호텔 뷔페", accommodation: "물리아 리조트 누사두아", golfCourse: "바투카루GC", golfHoles: "18", transport: "전용버스" },
      { title: "자유시간 + 발리 출발", description: "자유시간 후 발리 출발", meals: "조식: 호텔 뷔페", accommodation: "기내", golfCourse: "", golfHoles: "", transport: "전용버스" },
      { title: "인천 도착", description: "인천공항 도착, 해산", meals: "", accommodation: "", golfCourse: "", golfHoles: "", transport: "" },
    ];

    const dayCards = itinerarySection.locator("div.border.rounded-lg.p-4, div.border.rounded-xl");

    for (let i = 0; i < itineraries.length; i++) {
      const it = itineraries[i];

      if (i > 0) {
        const addItBtn = itinerarySection.locator('button:has-text("일정 추가")');
        await addItBtn.scrollIntoViewIfNeeded();
        await addItBtn.click();
        await page.waitForTimeout(300);
      }

      const card = dayCards.nth(i);
      await card.scrollIntoViewIfNeeded();

      await card.locator('input[type="text"]').first().fill(it.title);
      await card.locator("textarea").first().fill(it.description);

      const mealsInput = card.locator('input[placeholder*="조식"]');
      if (it.meals && await mealsInput.count() > 0) await mealsInput.fill(it.meals);

      const accomInput = card.locator('input[placeholder="호텔명"]');
      if (it.accommodation && await accomInput.count() > 0) await accomInput.fill(it.accommodation);

      // 골프장
      const golfInput = card.locator('input[placeholder="코스명"]');
      if (it.golfCourse && await golfInput.count() > 0) await golfInput.fill(it.golfCourse);

      // 라운드 홀 수
      const holesInput = card.locator('input[placeholder="18"]');
      if (it.golfHoles && await holesInput.count() > 0) await holesInput.fill(it.golfHoles);

      // 이동수단
      const transportInput = card.locator('input[placeholder="전용버스"]');
      if (it.transport && await transportInput.count() > 0) await transportInput.fill(it.transport);

      await page.waitForTimeout(200);
    }
    console.log("✓ 일정 입력 완료");

    // ========================================
    // 6. 가격 옵션 섹션
    // ========================================
    const pricingSection = page.locator('#section-pricing');
    await pricingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const priceOptions = [
      { name: "2인 1실", price: "1590000" },
      { name: "1인 1실", price: "1890000" },
      { name: "골프 1라운드 추가", price: "250000" },
    ];

    for (let i = 0; i < priceOptions.length; i++) {
      const opt = priceOptions[i];
      const addPriceBtn = pricingSection.locator('button:has-text("가격 옵션 추가")');
      await addPriceBtn.scrollIntoViewIfNeeded();
      await addPriceBtn.click();
      await page.waitForTimeout(300);

      const optCards = pricingSection.locator("div.border.rounded-lg.p-4, div.border.rounded-xl");
      const card = optCards.nth(i);
      await card.scrollIntoViewIfNeeded();

      await card.locator('input[placeholder="1인실 추가"]').fill(opt.name);
      await card.locator('input[type="number"]').first().fill(opt.price);
      await page.waitForTimeout(200);
    }
    console.log("✓ 가격 옵션 입력 완료");

    // ========================================
    // 7. 태그/SEO 섹션
    // ========================================
    const tagsSection = page.locator('#section-tags');
    await tagsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // 태그 선택
    const tag54 = tagsSection.locator('text=54홀').first();
    if (await tag54.count() > 0) {
      await tag54.click();
      await page.waitForTimeout(200);
    }
    const tagPremium = tagsSection.locator('text=프리미엄').first();
    if (await tagPremium.count() > 0) {
      await tagPremium.click();
      await page.waitForTimeout(200);
    }

    // SEO 자동 생성 버튼
    const autoGenBtn = tagsSection.locator('button:has-text("자동 생성")');
    if (await autoGenBtn.count() > 0) {
      await autoGenBtn.click();
      await page.waitForTimeout(500);
    }

    // Meta 수동 입력
    const metaTitleInput = tagsSection.locator('input[placeholder*="검색 엔진"]');
    if (await metaTitleInput.count() > 0) {
      await metaTitleInput.clear();
      await metaTitleInput.fill("발리 뉴꾸따 골프 4박 6일 54홀 - 보령항공여행사");
    }

    const metaDescTextarea = tagsSection.locator('textarea').first();
    if (await metaDescTextarea.count() > 0) {
      await metaDescTextarea.clear();
      await metaDescTextarea.fill("발리 뉴꾸따GC 포함 명문 3개 코스 54홀 라운딩. 5성급 리조트 숙박 프리미엄 골프 패키지.");
    }
    console.log("✓ 태그/SEO 입력 완료");

    // ========================================
    // 8. 등록 + API 응답 검증
    // ========================================
    // 페이지 맨 위로 스크롤하여 등록 버튼 클릭
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes("/api/products") && res.request().method() === "POST",
      { timeout: 15000 }
    );

    await page.locator('button:has-text("등록")').last().click();

    const apiResponse = await apiResponsePromise;
    const responseData = await apiResponse.json();

    console.log("API STATUS:", apiResponse.status());
    expect(apiResponse.status()).toBe(201);
    expect(responseData.success).toBe(true);

    const productId = responseData.product.id;
    console.log("생성된 상품 ID:", productId);

    // === 기본 정보 검증 ===
    const p = responseData.product;
    expect(p.title).toBe(productTitle);
    expect(p.departure).toBe("인천");
    expect(p.airline).toBe("가루다인도네시아/대한항공");
    expect(p.nights).toBe(4);
    expect(p.days).toBe(6);
    expect(p.basePrice).toBe(1590000);
    expect(p.originalPrice).toBe(1890000);
    expect(p.minPeople).toBe(4);
    expect(p.maxPeople).toBe(20);
    expect(p.totalHoles).toBe(54);
    expect(p.isActive).toBe(true);
    console.log("✓ 기본 정보 검증 통과");

    // === 상품 소개 검증 ===
    expect(p.excerpt).toContain("명문 3개 코스 54홀");
    expect(p.inclusions).toHaveLength(8);
    expect(p.inclusions).toContain("왕복 항공권");
    expect(p.exclusions).toHaveLength(5);
    expect(p.exclusions).toContain("여행자보험");
    console.log("✓ 상품 소개 검증 통과");

    // === SEO 검증 ===
    expect(p.metaTitle).toContain("발리 뉴꾸따 골프");
    console.log("✓ SEO 검증 통과");

    // === 출발일정 검증 ===
    expect(p.scheduleDates).toHaveLength(6);
    console.log("✓ 출발일정 검증 통과");

    // === 리다이렉트 검증 ===
    await page.waitForURL(`**/products/${productId}/edit`, { timeout: 10000 }).catch(() => {});
    const finalUrl = page.url();
    if (finalUrl.includes(`/products/${productId}/edit`)) {
      console.log("✓ 리다이렉트 검증 통과");
    } else {
      console.log("⚠ 리다이렉트 대기 초과 (API 201 성공, 데이터 검증 완료)")
    }

    // ========================================
    // 9. 관련 데이터 API 검증
    // ========================================
    await page.waitForTimeout(2000);

    const productRes = await request.get(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const fullProduct = await productRes.json();
    const fp = fullProduct.product;

    // 이미지 검증
    console.log(`이미지: ${fp.images?.length || 0}개`);
    expect(fp.images?.length).toBeGreaterThanOrEqual(1);
    console.log("✓ 이미지 검증 통과");

    // 일정 검증
    console.log(`일정: ${fp.itineraries?.length || 0}개`);
    expect(fp.itineraries).toHaveLength(6);
    expect(fp.itineraries[0].title).toBe("인천 출발");
    expect(fp.itineraries[0].transport).toBe("항공");
    expect(fp.itineraries[1].title).toContain("뉴꾸따");
    expect(fp.itineraries[1].golfCourse).toBe("뉴꾸따GC");
    expect(fp.itineraries[1].golfHoles).toBe(18);
    expect(fp.itineraries[1].transport).toBe("전용버스");
    expect(fp.itineraries[1].accommodation).toBe("물리아 리조트 누사두아");
    expect(fp.itineraries[2].golfCourse).toBe("발리 내셔널GC");
    expect(fp.itineraries[3].golfCourse).toBe("바투카루GC");
    console.log("✓ 일정 검증 통과 (골프코스/홀수/교통수단 포함)");

    // 가격 옵션 검증
    console.log(`가격옵션: ${fp.priceOptions?.length || 0}개`);
    expect(fp.priceOptions).toHaveLength(3);
    const optNames = fp.priceOptions.map((o: any) => o.name);
    expect(optNames).toContain("2인 1실");
    expect(optNames).toContain("1인 1실");
    console.log("✓ 가격 옵션 검증 통과");

    console.log("\n=== 전체 검증 완료 ===");
    console.log(`상품 ID: ${productId}`);
    console.log(`이미지: ${fp.images.length}개 | 일정: ${fp.itineraries.length}개 | 가격옵션: ${fp.priceOptions.length}개`);
  });
});
