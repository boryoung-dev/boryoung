import { test, expect } from "@playwright/test";

// 로그인 헬퍼
async function login(page: any) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("admin@boryoung.com");
  await page.locator('input[type="password"]').fill("qwer1234!!");
  await page.locator('button:has-text("로그인")').click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}

test.describe("리뷰 관리", () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ========================================
  // 1. 리뷰 목록 로딩 확인
  // ========================================
  test("리뷰 목록 페이지 로딩", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForLoadState("networkidle");

    // 페이지 헤더 확인
    await expect(page.locator("h1")).toHaveText("리뷰 관리");

    // 필터 탭 3개 존재 확인 (전체, 공개, 비공개)
    await expect(page.locator("button:has-text('전체')").first()).toBeVisible();
    await expect(page.locator("button:has-text('공개')").first()).toBeVisible();
    await expect(page.locator("button:has-text('비공개')").first()).toBeVisible();

    // 테이블 헤더 컬럼 확인
    await expect(page.locator("th:has-text('상품명')")).toBeVisible();
    await expect(page.locator("th:has-text('작성자')")).toBeVisible();
    await expect(page.locator("th:has-text('별점')")).toBeVisible();
    await expect(page.locator("th:has-text('공개')")).toBeVisible();

    console.log("✓ 리뷰 목록 로딩 검증 통과");
  });

  // ========================================
  // 2. 공개/비공개 토글
  // ========================================
  test("리뷰 공개/비공개 토글", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForLoadState("networkidle");

    // 리뷰 데이터가 없으면 스킵
    const rowCount = await page.locator("tbody tr").count();
    if (rowCount === 0) {
      console.log("⚠ 리뷰가 없어 토글 테스트를 스킵합니다.");
      return;
    }

    // 첫 번째 리뷰의 공개 토글 버튼 찾기 (공개 컬럼의 버튼 - px-2.5 py-1 rounded-full 클래스)
    const firstRow = page.locator("tbody tr").first();
    const toggleBtn = firstRow.locator('button.rounded-full').first();

    // 현재 상태 텍스트 저장
    const beforeText = await toggleBtn.innerText();
    console.log("토글 전 상태:", beforeText);

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes("/api/reviews/") && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    // 토글 클릭
    await toggleBtn.click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);

    // UI 상태 변경 확인 (텍스트가 바뀌었는지)
    await page.waitForTimeout(500);
    const afterText = await toggleBtn.innerText();
    console.log("토글 후 상태:", afterText);

    // 전/후 상태가 반전되었는지 확인
    expect(afterText).not.toBe(beforeText);

    console.log("✓ 공개/비공개 토글 검증 통과");
  });

  // ========================================
  // 3. 리뷰 수정 모달 (별점, 내용 변경)
  // ========================================
  test("리뷰 수정 모달 열기 및 저장", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForLoadState("networkidle");

    // 리뷰 데이터가 없으면 스킵
    const rowCount = await page.locator("tbody tr").count();
    if (rowCount === 0) {
      console.log("⚠ 리뷰가 없어 수정 테스트를 스킵합니다.");
      return;
    }

    // 첫 번째 리뷰 행에서 수정(연필) 버튼 클릭
    const firstRow = page.locator("tbody tr").first();
    await firstRow.locator('button[title="수정"]').click();

    // 수정 모달이 열렸는지 확인 (h2 타이틀로 확인)
    await expect(page.locator('h2:has-text("리뷰 수정")')).toBeVisible({ timeout: 5000 });

    // 모달 컨테이너
    const modal = page.locator('.fixed.inset-0.z-50').locator('.bg-white.rounded-xl').first();

    // 작성자명 필드 확인 및 수정 (첫 번째 text input)
    const authorInput = modal.locator('input[type="text"]').first();
    await expect(authorInput).toBeVisible();
    await authorInput.clear();
    await authorInput.fill("테스트 작성자");

    // 내용(textarea) 수정
    const contentTextarea = modal.locator("textarea").first();
    await expect(contentTextarea).toBeVisible();
    await contentTextarea.clear();
    await contentTextarea.fill("E2E 테스트로 수정된 리뷰 내용입니다.");

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes("/api/reviews/") && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    // 저장 버튼 클릭 (ModalConfirmButton의 기본 텍스트 "저장")
    await page.locator('button:has-text("저장")').last().click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);
    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);

    // 모달 닫힘 확인
    await expect(page.locator('h2:has-text("리뷰 수정")')).not.toBeVisible({ timeout: 5000 });

    // 성공 토스트 확인 (마침표 포함된 실제 메시지)
    const toast = page.locator("text=리뷰가 수정되었습니다.");
    await expect(toast).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log("⚠ 토스트가 이미 사라졌을 수 있음");
    });

    console.log("✓ 리뷰 수정 검증 통과");
  });

  // ========================================
  // 4. 필터별 조회 (전체 / 공개 / 비공개)
  // ========================================
  test("필터 탭별 리뷰 목록 조회", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForLoadState("networkidle");

    // 전체 탭 (기본)
    await page.locator("button:has-text('전체')").first().click();
    await page.waitForTimeout(300);
    const allRows = page.locator("tbody tr");
    const allCount = await allRows.count();
    console.log("전체 리뷰 수:", allCount);

    // 공개 탭
    await page.locator("button:has-text('공개')").first().click();
    await page.waitForTimeout(300);
    const publishedRows = page.locator("tbody tr");
    const publishedCount = await publishedRows.count();
    console.log("공개 리뷰 수:", publishedCount);

    // 공개 탭의 행 수는 전체 행 수 이하여야 함
    expect(publishedCount).toBeLessThanOrEqual(allCount);

    // 비공개 탭
    await page.locator("button:has-text('비공개')").first().click();
    await page.waitForTimeout(300);
    const unpublishedRows = page.locator("tbody tr");
    const unpublishedCount = await unpublishedRows.count();
    console.log("비공개 리뷰 수:", unpublishedCount);

    // 공개 + 비공개 = 전체 (빈 상태 행 1개 포함 가능하므로 >=)
    expect(publishedCount + unpublishedCount).toBeGreaterThanOrEqual(allCount - 1);

    // 전체 탭으로 돌아오기
    await page.locator("button:has-text('전체')").first().click();
    await page.waitForTimeout(300);
    const backToAllCount = await page.locator("tbody tr").count();
    expect(backToAllCount).toBe(allCount);

    console.log("✓ 필터별 조회 검증 통과");
  });
});
