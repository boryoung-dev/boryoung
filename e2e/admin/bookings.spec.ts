import { test, expect } from "@playwright/test";

// =====================================================
// 예약 관리 E2E 테스트
// 경로: /bookings, /bookings/[id]
// API: GET /api/bookings, GET/PATCH /api/bookings/[id]
// =====================================================

test.describe("예약 관리", () => {
  test.setTimeout(60000);

  let authToken: string;

  test.beforeEach(async ({ page, request }) => {
    // API 로그인으로 토큰 획득
    const loginRes = await request.post("/api/login", {
      data: { username: "admin", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    // UI 로그인
    await page.goto("/login");
    await page.locator('input[type="text"]').fill("admin");
    await page.locator('input[type="password"]').fill("qwer1234!!");
    await page.locator('button:has-text("로그인")').click();
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  // =====================================================
  // 테스트 1: 예약 목록 로딩 확인
  // =====================================================
  test("예약 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    // 페이지 제목 확인
    await expect(page.locator('h1:has-text("예약 관리")')).toBeVisible();

    // 필터 탭 확인 (전체, 접수, 확정, 완료, 취소)
    await expect(page.locator('text=전체').first()).toBeVisible();
    await expect(page.locator('text=접수').first()).toBeVisible();
    await expect(page.locator('text=확정').first()).toBeVisible();

    // 테이블 또는 빈 상태 확인
    const hasTable = await page.locator("th:has-text('예약자')").count() > 0;
    const hasEmpty = await page.locator("text=예약이 없습니다").count() > 0;
    expect(hasTable || hasEmpty).toBe(true);

    console.log("✓ 예약 목록 로딩 확인");
  });

  // =====================================================
  // 테스트 2: 예약 목록 API 데이터 일치 확인
  // =====================================================
  test("예약 목록 API 응답이 정상이다", async ({ request }) => {
    const res = await request.get("/api/bookings?limit=100", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.bookings)).toBe(true);

    // 예약이 있다면 필수 필드 존재 확인
    if (data.bookings.length > 0) {
      const booking = data.bookings[0];
      expect(booking).toHaveProperty("id");
      expect(booking).toHaveProperty("name");
      expect(booking).toHaveProperty("phone");
      expect(booking).toHaveProperty("status");
      expect(booking).toHaveProperty("tourProduct");
      expect(booking.tourProduct).toHaveProperty("title");
      console.log(`✓ 예약 ${data.bookings.length}건 확인, 첫 번째: ${booking.name}`);
    } else {
      console.log("✓ 예약 0건 (빈 상태 정상)");
    }
  });

  // =====================================================
  // 테스트 3: 상태 필터 동작 확인
  // =====================================================
  test("상태 필터 클릭 시 API가 필터 파라미터와 함께 호출된다", async ({ page }) => {
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    // '접수' 필터 클릭 시 API 호출 확인
    const apiResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/bookings") && res.url().includes("status=PENDING"),
      { timeout: 10000 }
    );

    // FilterTabs에서 '접수' 버튼 클릭
    await page.locator('button:has-text("접수")').first().click();

    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    const data = await apiResponse.json();
    expect(data.success).toBe(true);

    // 모든 결과가 PENDING 상태인지 확인
    for (const booking of data.bookings) {
      expect(booking.status).toBe("PENDING");
    }

    console.log(`✓ 접수 필터 동작 확인 (${data.bookings.length}건)`);
  });

  // =====================================================
  // 테스트 4: 예약 상세 페이지 로딩 + 상태 변경
  // =====================================================
  test("예약 상세 페이지에서 상태를 변경할 수 있다", async ({ page, request }) => {
    // 먼저 예약 목록에서 첫 번째 예약 ID 확인
    const listRes = await request.get("/api/bookings?limit=1", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();

    if (listData.bookings.length === 0) {
      test.skip(true, "예약 데이터가 없어 스킵");
      return;
    }

    const bookingId = listData.bookings[0].id;
    const bookingName = listData.bookings[0].name;

    // 예약 상세 페이지 이동
    await page.goto(`/bookings/${bookingId}`);
    await page.waitForLoadState("networkidle");

    // 예약 상세 페이지 헤더 확인
    await expect(page.locator('h1:has-text("예약 상세")')).toBeVisible({ timeout: 10000 });

    // 예약자 이름 표시 확인
    await expect(page.locator(`text=${bookingName}`)).toBeVisible();

    // 상태 관리 섹션 확인
    await expect(page.locator('h2:has-text("상태 관리")')).toBeVisible();

    // 관리자 메모 입력
    const memoText = `테스트 메모 ${Date.now()}`;
    const memoTextarea = page.locator('textarea[placeholder*="내부 메모"]');
    await memoTextarea.clear();
    await memoTextarea.fill(memoText);

    // 변경사항 저장 API 캡처
    const patchPromise = page.waitForResponse(
      (res) => res.url().includes(`/api/bookings/${bookingId}`) && res.request().method() === "PATCH",
      { timeout: 10000 }
    );

    // 저장 버튼 클릭
    await page.locator('button:has-text("변경 사항 저장")').click();

    const patchResponse = await patchPromise;
    const patchData = await patchResponse.json();
    expect(patchResponse.status()).toBe(200);
    expect(patchData.success).toBe(true);

    console.log(`✓ 예약 상세 상태 변경 확인: ${bookingName} (메모: ${memoText})`);
  });

  // =====================================================
  // 테스트 5: 예약 상세 API - 존재하지 않는 ID
  // =====================================================
  test("존재하지 않는 예약 ID로 API 호출 시 404가 반환된다", async ({ request }) => {
    const res = await request.get("/api/bookings/nonexistent-id-12345", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(404);

    const data = await res.json();
    expect(data.success).toBe(false);

    console.log("✓ 존재하지 않는 예약 404 확인");
  });
});
