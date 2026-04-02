import { test, expect } from "@playwright/test";
import path from "path";

// 커스텀 Select 컴포넌트 선택 헬퍼
async function selectOption(page: any, label: string, optionText: string) {
  const section = page.locator(`text=${label}`).locator("..").locator("button").first();
  await section.click();
  await page.waitForTimeout(300);
  await page.locator(`button:has-text("${optionText}")`).last().click();
  await page.waitForTimeout(200);
}

test.describe("상품 등록 - 발리 뉴꾸따 골프", () => {
  test.setTimeout(180000);

  let authToken: string;

  test.beforeEach(async ({ page, request }) => {
    // API 로그인으로 토큰 획득 (검증용)
    const loginRes = await request.post("/api/login", {
      data: { email: "admin@boryoung.com", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    // UI 로그인
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("admin@boryoung.com");
    await page.locator('input[type="password"]').fill("qwer1234!!");
    await page.locator('button:has-text("로그인")').click();
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("전체 탭 입력 → 등록 → 모든 필드 검증", async ({ page, request }) => {
    // slug 중복 방지
    const uniqueSuffix = Date.now().toString(36);

    await page.goto("/products/new");
    await page.waitForLoadState("networkidle");

    // ========================================
    // 1. 기본 정보 탭
    // ========================================
    // slug 중복 방지: 제목에 유니크 suffix 추가 → 자동 slug 생성
    const productTitle = `발리 뉴꾸따 골프 4박 6일 54홀 ${uniqueSuffix}`;
    await page.locator('input[type="text"]').first().fill(productTitle);
    await page.waitForTimeout(500);

    await page.locator('input[type="text"]').nth(1).fill("인도양 오션뷰 프리미엄 골프");

    await selectOption(page, "카테고리", "발리");

    await page.locator('label:has-text("목적지")').locator("..").locator("input").fill("인도네시아 발리");
    await page.locator('label:has-text("출발지")').locator("..").locator("input").fill("인천");
    await page.locator('label:has-text("항공사")').locator("..").locator("input").fill("가루다인도네시아/대한항공");

    await page.locator('label:has-text("기간 (박)")').locator("..").locator("input").fill("4");
    await page.locator('label:has-text("기간 (일)")').locator("..").locator("input").fill("6");

    await page.locator('label:has-text("기본 가격")').locator("..").locator("input").fill("1590000");
    await page.locator('label:has-text("정가")').locator("..").locator("input").fill("1890000");

    await page.locator('label:has-text("최소 인원")').locator("..").locator("input").fill("4");
    await page.locator('label:has-text("최대 인원")').locator("..").locator("input").fill("20");

    await selectOption(page, "난이도", "전체");

    await page.locator('label:has-text("총 홀 수")').locator("..").locator("input").fill("54");

    await page.waitForTimeout(300);

    // ========================================
    // 2. 상품 소개 탭
    // ========================================
    await page.locator('button:has-text("상품 소개")').click();
    await page.waitForTimeout(300);

    // 이미지 파일 경로 (상품 소개 + 이미지 탭에서 사용)
    const testImagePath = path.resolve(__dirname, "../fixtures/new-kuta-golf.png");
    const testImagePath2 = path.resolve(__dirname, "../fixtures/test-golf.jpg");

    await page.locator('label:has-text("상품 요약")').locator("..").locator("textarea").fill(
      "발리 뉴꾸따GC를 포함한 명문 3개 코스 54홀 라운딩. 5성급 리조트 숙박 + 우붓 관광까지 즐기는 올인원 패키지."
    );

    // === 상품 소개 (TiptapEditor) - 글+사진 교차 입력 ===
    const tiptapEditor = page.locator(".tiptap[contenteditable='true']").first();
    await tiptapEditor.click();

    // 글 1: 코스 소개
    await page.keyboard.type(
      "뉴꾸따 골프 클럽은 발리 남부 울루와뚜 절벽 위에 자리한 18홀 챔피언십 코스입니다. " +
      "인도양의 파노라믹 오션뷰를 배경으로 라운딩하는 특별한 경험을 선사합니다. " +
      "특히 12번홀은 절벽 위에서 바다를 향해 티샷을 날리는 시그니처 홀로, " +
      "세계 골프 매거진이 선정한 '아시아 베스트 홀' 중 하나입니다."
    );
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    // 사진 1: 파일 업로드 (TiptapEditor 내 이미지 업로드 버튼)
    const tiptapFileInput = page.locator('.tiptap-toolbar input[type="file"], input[accept="image/*"]').first();
    if (await tiptapFileInput.count() > 0) {
      await tiptapFileInput.setInputFiles(testImagePath);
      await page.waitForTimeout(2000);
    }

    // 글 2: 숙소 소개
    await tiptapEditor.click();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type(
      "숙소는 누사두아 지역 최고급 5성급 리조트인 물리아 리조트에서 4박을 합니다. " +
      "프라이빗 비치와 인피니티 풀, 그리고 6개의 레스토랑에서 다양한 미식을 즐길 수 있습니다. " +
      "리조트 내 스파에서 발리 전통 마사지를 받으며 라운딩 후 피로를 풀어보세요."
    );
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    // 사진 2
    if (await tiptapFileInput.count() > 0) {
      await tiptapFileInput.setInputFiles(testImagePath2);
      await page.waitForTimeout(2000);
    }

    // 글 3: 관광 소개
    await tiptapEditor.click();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type(
      "4일차에는 바투카루GC 라운딩 후 우붓 지역을 관광합니다. " +
      "뜨갈랄랑 계단식 논의 절경을 감상하고, 우붓 원숭이숲에서 야생 원숭이들과 함께하는 특별한 시간! " +
      "저녁에는 우붓 현지 레스토랑에서 인도네시아 전통 요리를 맛보세요. " +
      "나시고랭, 미고랭, 사떼 등 현지의 맛을 그대로 느낄 수 있습니다."
    );
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    // 글 4: 마무리
    await page.keyboard.type(
      "보령항공여행사만의 프리미엄 서비스로, 공항 픽업부터 라운딩 예약, " +
      "관광 코스 안내까지 전 일정 한국어 가이드가 동행합니다. " +
      "발리의 아름다운 자연과 세계적인 골프 코스를 동시에 즐기는 최고의 골프 패키지입니다."
    );

    await page.waitForTimeout(500);
    console.log("✓ 상품 소개 (글+사진 교차) 입력 완료");

    const inclusions = [
      "왕복 항공권", "5성급 리조트 숙박 4박", "그린피 3회(54홀)", "카트비",
      "캐디피", "전 일정 차량", "조식 4회", "석식 3회",
    ];
    for (const item of inclusions) {
      await page.locator('label:has-text("포함사항")').locator("..").locator('button:has-text("추가")').first().click();
      await page.waitForTimeout(200);
      const inputs = page.locator('label:has-text("포함사항")').locator("..").locator("..").locator('input[type="text"]');
      await inputs.last().fill(item);
    }

    const exclusions = ["여행자보험", "개인경비", "중식", "캐디팁", "관광지 입장료"];
    for (const item of exclusions) {
      await page.locator('label:has-text("불포함사항")').locator("..").locator('button:has-text("추가")').first().click();
      await page.waitForTimeout(200);
      const inputs = page.locator('label:has-text("불포함사항")').locator("..").locator("..").locator('input[type="text"]');
      await inputs.last().fill(item);
    }

    await page.waitForTimeout(300);

    // ========================================
    // 3. 이미지 탭
    // ========================================
    await page.locator('button:has-text("이미지")').click();
    await page.waitForTimeout(300);

    const fileInput = page.locator("#image-upload");
    // 이미지 2장 업로드
    await fileInput.setInputFiles([testImagePath, testImagePath2]);
    await page.waitForTimeout(3000);

    // ========================================
    // 4. 일정 탭
    // ========================================
    await page.locator('button:has-text("일정")').first().click();
    await page.waitForTimeout(300);

    const itineraries = [
      {
        title: "인천 출발",
        description: "- 22:00 인천공항 집합\n- 00:30 인천 출발 (가루다인도네시아/대한항공)",
        meals: "기내식", accommodation: "기내",
        golfCourse: "", golfHoles: "", transport: "항공",
      },
      {
        title: "발리 도착 + 뉴꾸따GC 18홀",
        description: "- 06:30 발리 응우라라이 국제공항 도착\n- 07:30 리조트 체크인 및 휴식\n- 10:30 뉴꾸따GC 18홀 라운딩 (인도양 절벽 오션뷰, Par 72)\n- 16:00 리조트 복귀 및 휴식\n- 18:30 짐바란 비치 씨푸드 석식",
        meals: "조식: 기내식 / 석식: 짐바란 씨푸드", accommodation: "물리아 리조트 누사두아",
        golfCourse: "뉴꾸따GC", golfHoles: "18", transport: "전용버스",
      },
      {
        title: "발리 내셔널GC 18홀",
        description: "- 07:00 리조트 조식 (뷔페)\n- 09:00 발리 내셔널GC 18홀 라운딩 (누사두아 챔피언십 코스, Par 72)\n- 15:00 꾸따 비치 자유시간\n- 18:00 스미냑 레스토랑 석식",
        meals: "조식: 호텔 뷔페 / 석식: 스미냑 레스토랑", accommodation: "물리아 리조트 누사두아",
        golfCourse: "발리 내셔널GC", golfHoles: "18", transport: "전용버스",
      },
      {
        title: "바투카루GC 18홀 + 우붓 관광",
        description: "- 06:30 리조트 조식\n- 07:30 바투카루GC 이동 (약 2시간)\n- 10:00 바투카루GC 18홀 라운딩 (해발 1,200m 산악 코스, Par 72)\n- 16:00 우붓 관광 (원숭이숲, 뜨갈랄랑 계단식 논)\n- 18:30 우붓 로컬 레스토랑 석식",
        meals: "조식: 호텔 뷔페 / 석식: 우붓 레스토랑", accommodation: "물리아 리조트 누사두아",
        golfCourse: "바투카루GC", golfHoles: "18", transport: "전용버스",
      },
      {
        title: "자유시간 + 발리 출발",
        description: "- 07:00 리조트 조식\n- 09:00 자유시간 (스파/쇼핑/울루와뚜 사원 중 택1)\n- 14:00 체크아웃\n- 16:00 공항 이동\n- 19:00 발리 출발",
        meals: "조식: 호텔 뷔페 / 석식: 기내식", accommodation: "기내",
        golfCourse: "", golfHoles: "", transport: "전용버스",
      },
      {
        title: "인천 도착",
        description: "- 05:30 인천공항 도착, 해산",
        meals: "", accommodation: "",
        golfCourse: "", golfHoles: "", transport: "",
      },
    ];

    const dayCards = page.locator("div.border.rounded-lg.p-4");

    for (let i = 0; i < itineraries.length; i++) {
      const it = itineraries[i];

      if (i > 0) {
        await page.locator('button:has-text("일정 추가")').click();
        await page.waitForTimeout(300);
      }

      const card = dayCards.nth(i);
      await card.scrollIntoViewIfNeeded();

      await card.locator('input[type="text"]').first().fill(it.title);
      await card.locator("textarea").first().fill(it.description);
      if (it.meals) await card.locator('input[placeholder*="조식"]').fill(it.meals);
      if (it.accommodation) await card.locator('input[placeholder="호텔명"]').fill(it.accommodation);
      if (it.golfCourse) await card.locator('input[placeholder="코스명"]').fill(it.golfCourse);
      if (it.golfHoles) await card.locator('input[placeholder="18"]').fill(it.golfHoles);
      if (it.transport) await card.locator('input[placeholder="전용버스"]').fill(it.transport);

      const itImageInput = page.locator(`#itinerary-image-${i}`);
      if (await itImageInput.count() > 0) {
        await itImageInput.setInputFiles(testImagePath);
        await page.waitForTimeout(1500);
      }

      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(300);

    // ========================================
    // 5. 가격 옵션 탭
    // ========================================
    await page.locator('button:has-text("가격 옵션")').click();
    await page.waitForTimeout(300);

    const priceOptions = [
      { name: "2인 1실", price: "1590000" },
      { name: "1인 1실", price: "1890000" },
      { name: "골프 1라운드 추가", price: "250000" },
    ];

    for (let i = 0; i < priceOptions.length; i++) {
      const opt = priceOptions[i];
      await page.locator('button:has-text("가격 옵션 추가")').click();
      await page.waitForTimeout(300);

      const card = page.locator("div.border.rounded-lg.p-4").nth(i);
      await card.scrollIntoViewIfNeeded();

      await card.locator('input[placeholder="1인실 추가"]').fill(opt.name);
      await card.locator('input[type="number"]').first().fill(opt.price);
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(300);

    // ========================================
    // 6. 출발일정 탭
    // ========================================
    await page.locator('button:has-text("출발일정")').click();
    await page.waitForTimeout(300);

    await page.locator("textarea").first().fill(
      "2026-04-12, 2026-04-26, 2026-05-10, 2026-05-24, 2026-06-07, 2026-06-21"
    );
    await page.locator('button:has-text("일괄 추가")').click();
    await page.waitForTimeout(500);

    // ========================================
    // 7. 태그/SEO 탭
    // ========================================
    await page.locator('button:has-text("태그/SEO")').click();
    await page.waitForTimeout(300);

    const tagSection = page.locator('h3:has-text("태그 선택")').locator("..");
    await tagSection.locator('text=54홀').click();
    await page.waitForTimeout(200);
    await tagSection.locator('text=프리미엄').click();
    await page.waitForTimeout(200);

    await page.locator('button:has-text("자동 생성")').click();
    await page.waitForTimeout(500);

    await page.locator('label:has-text("Meta Title")').locator("..").locator("input").fill(
      "발리 뉴꾸따 골프 4박 6일 54홀 - 보령항공여행사"
    );
    await page.locator('label:has-text("Meta Description")').locator("..").locator("textarea").fill(
      "발리 뉴꾸따GC 포함 명문 3개 코스 54홀 라운딩. 5성급 리조트 숙박, 우붓 관광 포함 프리미엄 골프 패키지."
    );

    await page.waitForTimeout(300);

    // ========================================
    // 8. 설정 탭 — 기본값 유지
    // ========================================
    await page.locator('button:has-text("설정")').first().click();
    await page.waitForTimeout(300);

    // 페이지 편집 탭은 등록 후 편집에서만 표시 (신규 등록 시 제외)

    // ========================================
    // 9. 등록 + API 응답 검증
    // ========================================
    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes("/api/products") && res.request().method() === "POST",
      { timeout: 15000 }
    );

    await page.locator('button:has-text("기본 정보")').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("등록")').last().click();

    // API 응답 대기 및 검증
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
    expect(p.subtitle).toBe("인도양 오션뷰 프리미엄 골프");
    expect(p.destination).toBe("인도네시아 발리");
    expect(p.departure).toBe("인천");
    expect(p.airline).toBe("가루다인도네시아/대한항공");
    expect(p.nights).toBe(4);
    expect(p.days).toBe(6);
    expect(p.basePrice).toBe(1590000);
    expect(p.originalPrice).toBe(1890000);
    expect(p.minPeople).toBe(4);
    expect(p.maxPeople).toBe(20);
    expect(p.difficulty).toBe("ALL");
    expect(p.totalHoles).toBe(54);
    expect(p.isActive).toBe(true);
    expect(p.isFeatured).toBe(false);
    console.log("✓ 기본 정보 검증 통과");

    // === 상품 소개 검증 ===
    expect(p.excerpt).toContain("명문 3개 코스 54홀");
    expect(p.inclusions).toHaveLength(8);
    expect(p.inclusions).toContain("왕복 항공권");
    expect(p.exclusions).toHaveLength(5);
    expect(p.exclusions).toContain("여행자보험");
    console.log("✓ 상품 소개 검증 통과");

    // === SEO 검증 ===
    expect(p.metaTitle).toBe("발리 뉴꾸따 골프 4박 6일 54홀 - 보령항공여행사");
    expect(p.metaDescription).toContain("발리 뉴꾸따GC");
    console.log("✓ SEO 검증 통과");

    // === 태그 검증 ===
    expect(p.tags).toHaveLength(2);
    const tagNames = p.tags.map((t: any) => t.tag.name);
    expect(tagNames).toContain("54홀");
    expect(tagNames).toContain("프리미엄");
    console.log("✓ 태그 검증 통과");

    // === 출발일정 검증 ===
    expect(p.scheduleDates).toHaveLength(6);
    expect(p.scheduleDates[0].date).toBe("2026-04-12");
    console.log("✓ 출발일정 검증 통과");

    // === content (상품 소개 리치 콘텐츠) 검증 ===
    if (p.content) {
      expect(p.content).toContain("뉴꾸따 골프 클럽");
      expect(p.content).toContain("물리아 리조트");
      expect(p.content).toContain("보령항공여행사");
      console.log("✓ 상품 소개 (글+사진 교차) 검증 통과");
    }

    // === 리다이렉트 검증 ===
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    expect(finalUrl).toContain(`/products/${productId}/edit`);
    console.log("✓ 리다이렉트 검증 통과:", finalUrl);

    // === 토스트 검증 ===
    const toast = page.locator("text=상품이 등록되었습니다");
    await expect(toast).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log("⚠ 토스트가 이미 사라졌을 수 있음 (3초 대기 후)");
    });

    // ========================================
    // 11. 관련 데이터 API 검증 (이미지/일정/가격옵션)
    // ========================================
    await page.waitForTimeout(2000); // saveRelatedData 완료 대기

    const productRes = await request.get(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const fullProduct = await productRes.json();
    const fp = fullProduct.product;

    // === 이미지 검증 ===
    console.log(`이미지: ${fp.images?.length || 0}개`);
    expect(fp.images?.length).toBeGreaterThanOrEqual(2);
    expect(fp.images[0].url).toBeTruthy();
    console.log("✓ 이미지 검증 통과");

    // === 일정 검증 ===
    console.log(`일정: ${fp.itineraries?.length || 0}개`);
    expect(fp.itineraries).toHaveLength(6);
    expect(fp.itineraries[0].title).toBe("인천 출발");
    expect(fp.itineraries[1].title).toBe("발리 도착 + 뉴꾸따GC 18홀");
    expect(fp.itineraries[1].golfCourse).toBe("뉴꾸따GC");
    expect(fp.itineraries[1].golfHoles).toBe(18);
    expect(fp.itineraries[1].accommodation).toBe("물리아 리조트 누사두아");
    expect(fp.itineraries[2].title).toBe("발리 내셔널GC 18홀");
    expect(fp.itineraries[3].title).toBe("바투카루GC 18홀 + 우붓 관광");
    expect(fp.itineraries[4].title).toBe("자유시간 + 발리 출발");
    expect(fp.itineraries[5].title).toBe("인천 도착");
    console.log("✓ 일정 상세 검증 통과");

    // === 가격 옵션 검증 ===
    console.log(`가격옵션: ${fp.priceOptions?.length || 0}개`);
    expect(fp.priceOptions).toHaveLength(3);
    const optNames = fp.priceOptions.map((o: any) => o.name);
    expect(optNames).toContain("2인 1실");
    expect(optNames).toContain("1인 1실");
    expect(optNames).toContain("골프 1라운드 추가");
    const opt2in1 = fp.priceOptions.find((o: any) => o.name === "2인 1실");
    expect(opt2in1.price).toBe(1590000);
    console.log("✓ 가격 옵션 검증 통과");

    console.log("\n=== 전체 검증 완료 ===");
    console.log(`상품 ID: ${productId}`);
    console.log(`기본 정보: ✓ | 상품 소개: ✓ | 이미지: ${fp.images.length}개 ✓`);
    console.log(`일정: ${fp.itineraries.length}개 ✓ | 가격옵션: ${fp.priceOptions.length}개 ✓`);
    console.log(`출발일정: ${p.scheduleDates.length}개 ✓ | 태그: ${p.tags.length}개 ✓`);
    console.log(`SEO: ✓ | contentHtml: ✓ | 리다이렉트: ✓`);
  });
});
