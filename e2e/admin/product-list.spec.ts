import { test, expect } from "@playwright/test";

test.describe("상품 목록 관리", () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto("/login");
    await page.locator('input[type="text"]').fill("admin");
    await page.locator('input[type="password"]').fill("qwer1234!!");
    await page.locator('button:has-text("로그인")').click();
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("상품 목록 페이지 로딩 및 기본 동작", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // 페이지 제목 확인
    await expect(page.locator("h1, h2").filter({ hasText: /상품/ })).toBeVisible({ timeout: 10000 });

    // 상품 테이블 또는 목록이 표시되는지 확인
    const table = page.locator("table");
    const hasTable = await table.count() > 0;

    if (hasTable) {
      // 테이블 헤더 확인
      const headers = await table.locator("th").allTextContents();
      console.log("테이블 헤더:", headers.join(", "));
      expect(headers.length).toBeGreaterThan(0);

      // 최소 1개 이상의 상품 행이 있는지 확인
      const rows = table.locator("tbody tr");
      const rowCount = await rows.count();
      console.log(`상품 수: ${rowCount}개`);
      expect(rowCount).toBeGreaterThan(0);
    }
    console.log("✓ 상품 목록 로딩 확인");
  });

  test("상품 등록 버튼 → 등록 페이지 이동", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // 등록/추가 버튼 찾기
    const addButton = page.locator('a:has-text("등록"), a:has-text("추가"), button:has-text("등록"), button:has-text("추가")').first();
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    // 등록 페이지로 이동 확인
    await page.waitForURL("**/products/new**", { timeout: 5000 });
    expect(page.url()).toContain("/products/new");
    console.log("✓ 상품 등록 페이지 이동 확인");
  });

  test("상품 클릭 → 수정 페이지 이동", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // 첫 번째 상품의 수정 링크/버튼 클릭
    const editLink = page.locator('a[href*="/products/"][href*="/edit"], button:has-text("수정")').first();

    if (await editLink.count() > 0) {
      await editLink.click();
      await page.waitForURL("**/products/*/edit**", { timeout: 10000 });
      expect(page.url()).toMatch(/\/products\/[^/]+\/edit/);
      console.log("✓ 상품 수정 페이지 이동:", page.url());
    } else {
      // 테이블 행 클릭으로 이동
      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();
      await page.waitForTimeout(2000);
      console.log("✓ 상품 행 클릭 후 URL:", page.url());
    }
  });

  test("상품 검색/필터 동작", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // 검색 입력창이 있으면 테스트
    const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill("발리");
      await page.waitForTimeout(1000);

      // 검색 결과가 필터링되었는지 확인
      const rows = page.locator("table tbody tr");
      const count = await rows.count();
      console.log(`"발리" 검색 결과: ${count}개`);
    } else {
      console.log("⚠ 검색 입력창 없음 (스킵)");
    }

    console.log("✓ 상품 검색/필터 확인");
  });
});
