import { test, expect } from "@playwright/test";

// 로그인 헬퍼
async function login(page: any) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("admin@boryoung.com");
  await page.locator('input[type="password"]').fill("qwer1234!!");
  await page.locator('button:has-text("로그인")').click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}

// 모달 컨테이너 헬퍼 (Modal 컴포넌트: fixed inset-0 z-50 래퍼 안의 bg-white 컨테이너)
function getModal(page: any) {
  return page.locator('.fixed.inset-0.z-50').locator('.bg-white.rounded-xl').first();
}

test.describe("배너 관리", () => {
  test.setTimeout(60000);

  let authToken: string;

  test.beforeEach(async ({ page, request }) => {
    // API 로그인으로 토큰 획득
    const loginRes = await request.post("/api/login", {
      data: { email: "admin@boryoung.com", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    // UI 로그인
    await login(page);
  });

  // ========================================
  // 1. 배너 목록 로딩
  // ========================================
  test("배너 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/banners");
    await page.waitForLoadState("networkidle");

    // 페이지 헤더 확인
    await expect(page.locator("h1:has-text('배너 관리')")).toBeVisible();

    // 배너 추가 버튼 확인
    await expect(page.locator('button:has-text("배너 추가")')).toBeVisible();

    console.log("✓ 배너 목록 페이지 로딩 완료");
  });

  // ========================================
  // 2. 새 배너 생성
  // ========================================
  test("새 배너를 생성한다", async ({ page }) => {
    const uniqueSuffix = Date.now();
    const bannerTitle = `E2E 테스트 배너 ${uniqueSuffix}`;

    await page.goto("/banners");
    await page.waitForLoadState("networkidle");

    // "배너 추가" 버튼 클릭
    await page.locator('button:has-text("배너 추가")').click();

    // 모달 열림 대기 (h2 타이틀로 확인)
    await expect(page.locator('h2:has-text("배너 추가")')).toBeVisible({ timeout: 5000 });

    const modal = getModal(page);

    // 제목 입력 (form id="banner-form" 내 첫 번째 text input)
    const titleInput = modal.locator('#banner-form input[type="text"]').first();
    await titleInput.fill(bannerTitle);

    // 부제목 입력 (두 번째 text input)
    const subtitleInput = modal.locator('#banner-form input[type="text"]').nth(1);
    await subtitleInput.fill("E2E 테스트 부제목입니다");

    // 이미지 URL 입력 (url 타입 input 첫 번째)
    const imageInput = modal.locator('#banner-form input[type="url"]').first();
    await imageInput.fill("https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400");

    // 링크 URL 입력 (url 타입 input 두 번째)
    const linkInput = modal.locator('#banner-form input[type="url"]').nth(1);
    await linkInput.fill("https://example.com/test");

    // CTA 텍스트 입력 (세 번째 text input)
    const ctaInput = modal.locator('#banner-form input[type="text"]').nth(2);
    await ctaInput.fill("자세히 보기");

    // 정렬 순서 입력
    const sortInput = modal.locator('#banner-form input[type="number"]').first();
    await sortInput.fill("10");

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes("/api/banners") && res.request().method() === "POST",
      { timeout: 10000 }
    );

    // 추가 버튼 클릭
    await page.locator('button:has-text("추가")').last().click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(201);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);

    // 모달 닫힘 확인
    await expect(page.locator('h2:has-text("배너 추가")')).not.toBeVisible({ timeout: 10000 });

    // 목록에서 생성된 배너 확인 (카드 그리드)
    await expect(page.locator(`text="${bannerTitle}"`).first()).toBeVisible({ timeout: 5000 });

    // 정리: API로 배너 삭제
    const bannerId = responseData.banner?.id;
    if (bannerId) {
      await page.request.delete(`/api/banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    }

    console.log("✓ 배너 생성 완료:", bannerTitle);
  });

  // ========================================
  // 3. 배너 수정
  // ========================================
  test("배너를 수정한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const originalTitle = `수정 테스트 배너 ${uniqueSuffix}`;
    const updatedTitle = `수정 완료 배너 ${uniqueSuffix}`;

    // API로 테스트 배너 생성
    const createRes = await request.post("/api/banners", {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: {
        title: originalTitle,
        imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400",
        sortOrder: 99,
        isActive: true,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const bannerId = createData.banner.id;

    await page.goto("/banners");
    await page.waitForLoadState("networkidle");

    // 생성한 배너 카드의 수정 버튼 클릭
    // 배너 카드는 bg-white rounded-xl 클래스를 가진 div
    const bannerCard = page.locator('.bg-white.rounded-xl').filter({ hasText: originalTitle });
    await bannerCard.locator('button:has-text("수정")').click();

    // 모달 열림 대기
    await expect(page.locator('h2:has-text("배너 수정")')).toBeVisible({ timeout: 5000 });

    const modal = getModal(page);

    // 제목 수정 (첫 번째 text input)
    const titleInput = modal.locator('#banner-form input[type="text"]').first();
    await titleInput.clear();
    await titleInput.fill(updatedTitle);

    // 부제목 수정 (두 번째 text input)
    const subtitleInput = modal.locator('#banner-form input[type="text"]').nth(1);
    await subtitleInput.clear();
    await subtitleInput.fill("수정된 부제목");

    // CTA 텍스트 수정 (세 번째 text input)
    const ctaInput = modal.locator('#banner-form input[type="text"]').nth(2);
    await ctaInput.clear();
    await ctaInput.fill("지금 예약하기");

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes(`/api/banners/${bannerId}`) && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    // 수정 버튼 클릭
    await page.locator('button:has-text("수정")').last().click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);

    // 모달 닫힘 확인
    await expect(page.locator('h2:has-text("배너 수정")')).not.toBeVisible({ timeout: 10000 });

    // 목록에서 수정된 제목 확인
    await expect(page.locator(`text="${updatedTitle}"`).first()).toBeVisible({ timeout: 5000 });

    // 정리
    await request.delete(`/api/banners/${bannerId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✓ 배너 수정 완료:", updatedTitle);
  });

  // ========================================
  // 4. 배너 삭제
  // ========================================
  test("배너를 삭제한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const bannerTitle = `삭제 테스트 배너 ${uniqueSuffix}`;

    // API로 테스트 배너 생성
    const createRes = await request.post("/api/banners", {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: {
        title: bannerTitle,
        imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400",
        sortOrder: 99,
        isActive: true,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);

    await page.goto("/banners");
    await page.waitForLoadState("networkidle");

    // 생성한 배너 카드 확인
    await expect(page.locator(`text="${bannerTitle}"`).first()).toBeVisible();

    // 배너 카드의 삭제 버튼 클릭
    const bannerCard = page.locator('.bg-white.rounded-xl').filter({ hasText: bannerTitle });
    await bannerCard.locator('button:has-text("삭제")').click();

    // ConfirmModal에서 "삭제" 버튼 클릭
    await expect(page.locator('button:has-text("삭제")').last()).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("삭제")').last().click();

    // API 삭제 응답 대기
    await page.waitForTimeout(1000);

    // 목록에서 제거 확인
    await expect(page.locator(`text="${bannerTitle}"`)).not.toBeVisible({ timeout: 5000 });

    console.log("✓ 배너 삭제 완료");
  });

  // ========================================
  // 5. 배너 활성화 토글
  // ========================================
  test("배너 활성화 상태를 토글한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const bannerTitle = `활성화 토글 테스트 ${uniqueSuffix}`;

    // API로 비활성 배너 생성
    const createRes = await request.post("/api/banners", {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: {
        title: bannerTitle,
        imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400",
        sortOrder: 99,
        isActive: false,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const bannerId = createData.banner.id;

    await page.goto("/banners");
    await page.waitForLoadState("networkidle");

    // 배너 카드에서 "비활성" 배지 확인
    const bannerCard = page.locator('.bg-white.rounded-xl').filter({ hasText: bannerTitle });
    await expect(bannerCard.locator('span:has-text("비활성")')).toBeVisible();

    // 수정 모달 열기
    await bannerCard.locator('button:has-text("수정")').click();

    await expect(page.locator('h2:has-text("배너 수정")')).toBeVisible({ timeout: 5000 });

    const modal = getModal(page);

    // 활성화 토글 클릭 (비활성 → 활성)
    // 실제 구조: flex items-center justify-between 컨테이너에 "활성화" span과 버튼
    const toggleBtn = modal.locator('.flex.items-center.justify-between').filter({
      has: page.locator('span:has-text("활성화")')
    }).locator('button');
    await toggleBtn.click();

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes(`/api/banners/${bannerId}`) && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    await page.locator('button:has-text("수정")').last().click();

    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);
    expect(responseData.banner.isActive).toBe(true);

    await expect(page.locator('h2:has-text("배너 수정")')).not.toBeVisible({ timeout: 10000 });

    // 카드에서 "활성" 배지 확인
    const updatedCard = page.locator('.bg-white.rounded-xl').filter({ hasText: bannerTitle });
    await expect(updatedCard.locator('span:has-text("활성")')).toBeVisible({ timeout: 5000 });

    // 정리
    await request.delete(`/api/banners/${bannerId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✓ 배너 활성화 토글 완료");
  });
});
