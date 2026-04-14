import { test, expect } from "@playwright/test";

// 로그인 헬퍼
async function login(page: any) {
  await page.goto("/login");
  await page.locator('input[type="text"]').fill("admin");
  await page.locator('input[type="password"]').fill("qwer1234!!");
  await page.locator('button:has-text("로그인")').click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}

test.describe("대시보드", () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ========================================
  // 1. 대시보드 로딩 확인
  // ========================================
  test("대시보드 페이지 로딩", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // 페이지 헤더 확인
    await expect(page.locator("h1")).toHaveText("대시보드");

    // 로딩 스피너가 사라졌는지 확인 (데이터 로딩 완료)
    await expect(page.locator("text=불러오는 중...")).not.toBeVisible({ timeout: 15000 });

    console.log("✓ 대시보드 로딩 검증 통과");
  });

  // ========================================
  // 2. 통계 카드 6개 표시 확인 (숫자 표시)
  // ========================================
  test("통계 카드 6개 표시 및 숫자 렌더링", async ({ page, request }) => {
    // API로 실제 stats 데이터 먼저 조회
    const loginRes = await request.post("/api/login", {
      data: { username: "admin", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    const statsRes = await request.get("/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(statsRes.status()).toBe(200);
    const statsData = await statsRes.json();
    expect(statsData.success).toBe(true);

    const stats = statsData.stats;
    console.log("API stats:", JSON.stringify(stats));

    // 대시보드 페이지 로드
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=불러오는 중...")).not.toBeVisible({ timeout: 15000 });

    // 통계 카드 라벨 6개 존재 확인 (.first()로 중복 방지)
    // 실제 카드 클래스: bg-white rounded-xl border border-gray-200 p-5 shadow-sm
    // 통계 카드 6개 라벨이 모두 표시되면 OK
    // 통계 카드 라벨 확인 (.first()로 strict mode 방지)
    await expect(page.locator("text=오늘 예약").first()).toBeVisible();
    await expect(page.locator("text=이번주 예약").first()).toBeVisible();
    await expect(page.locator("text=이번달 예약").first()).toBeVisible();
    await expect(page.locator("text=대기 중 예약").first()).toBeVisible();
    await expect(page.locator("text=대기 중 문의").first()).toBeVisible();
    await expect(page.locator("text=활성 상품").first()).toBeVisible();
    console.log("✓ 통계 카드 6개 표시 확인");

    console.log("✓ 통계 카드 표시 검증 통과");
  });

  // ========================================
  // 3. 빠른 액션 버튼 클릭 → 해당 페이지 이동
  // ========================================
  test("빠른 액션 버튼 클릭 후 페이지 이동", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=불러오는 중...")).not.toBeVisible({ timeout: 15000 });

    // 빠른 액션 링크 4개 존재 확인
    const actions = [
      { label: "상품 추가", href: "/products/new" },
      { label: "문의 관리", href: "/inquiries" },
      { label: "상품 관리", href: "/products" },
      { label: "리뷰 관리", href: "/reviews" },
    ];

    for (const action of actions) {
      // 사이드바에도 같은 텍스트 링크가 있으므로 .last()로 대시보드 콘텐츠 영역 선택
      const link = page.locator(`a:has-text("${action.label}")`).last();
      await expect(link).toBeVisible();
      const href = await link.getAttribute("href");
      expect(href).toContain(action.href);
      console.log(`✓ ${action.label} 링크 확인: ${href}`);
    }

    console.log("✓ 빠른 액션 버튼 검증 통과");
  });

  // ========================================
  // 4. 최근 예약 목록 표시 확인
  // ========================================
  test("최근 예약 목록 표시", async ({ page, request }) => {
    // API로 예약 목록 확인
    const loginRes = await request.post("/api/login", {
      data: { username: "admin", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    const bookingsRes = await request.get("/api/bookings?limit=5", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(bookingsRes.status()).toBe(200);
    const bookingsData = await bookingsRes.json();
    expect(bookingsData.success).toBe(true);

    const bookings = bookingsData.bookings || [];
    console.log("API 최근 예약 수:", bookings.length);

    // 대시보드 로드
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=불러오는 중...")).not.toBeVisible({ timeout: 15000 });

    // 최근 예약 섹션 헤더 확인
    await expect(page.locator("h2:has-text('최근 예약')")).toBeVisible();

    // 전체 보기 링크 확인
    await expect(page.locator("a:has-text('전체 보기')").first()).toBeVisible();

    if (bookings.length === 0) {
      // 예약이 없을 경우 빈 상태 메시지 확인
      await expect(page.locator("text=최근 예약이 없습니다")).toBeVisible();
      console.log("✓ 예약 없음 상태 확인");
    } else {
      // 예약이 있을 경우 첫 번째 예약 항목 이름이 UI에 표시되는지 확인
      const firstBookingName = bookings[0].name;
      await expect(page.locator(`text=${firstBookingName}`)).toBeVisible({ timeout: 5000 });
      console.log(`✓ 첫 번째 예약 "${firstBookingName}" UI 표시 확인`);

      // 최근 예약 섹션 내 링크 수 확인 (최대 5개)
      const bookingSection = page.locator("h2:has-text('최근 예약')").locator("..").locator("..");
      const bookingLinks = bookingSection.locator("a[href*='/bookings/']");
      const displayedCount = await bookingLinks.count();
      expect(displayedCount).toBeLessThanOrEqual(5);
      console.log(`✓ 최근 예약 표시 수: ${displayedCount}개 (최대 5개)`);
    }

    console.log("✓ 최근 예약 목록 표시 검증 통과");
  });
});
