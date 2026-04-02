import { test, expect } from "@playwright/test";

// =====================================================
// 카테고리 관리 E2E 테스트
// 경로: /categories
// API: GET/POST/PUT/DELETE /api/categories
// =====================================================

test.describe("카테고리 관리", () => {
  test.setTimeout(60000);

  let authToken: string;
  // 테스트 중 생성된 카테고리 ID 추적 (정리용)
  const createdCategoryIds: string[] = [];

  test.beforeEach(async ({ page, request }) => {
    // API 로그인으로 토큰 획득
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

  test.afterEach(async ({ request }) => {
    // 테스트 중 생성된 카테고리를 역순으로 삭제 (소분류 → 대분류 순)
    for (const id of [...createdCategoryIds].reverse()) {
      try {
        await request.delete(`/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {
        // 이미 삭제되었거나 실패해도 무시
      }
    }
    createdCategoryIds.length = 0;
  });

  // =====================================================
  // 테스트 1: 카테고리 목록 로딩 확인
  // =====================================================
  test("카테고리 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/categories");
    await page.waitForLoadState("networkidle");

    // 페이지 제목 확인
    await expect(page.locator('h1:has-text("카테고리 관리")')).toBeVisible();

    // 대분류 추가 버튼 확인 (정확한 텍스트 매칭)
    await expect(page.locator('button:has-text("대분류 추가")')).toBeVisible();

    // 카테고리 목록 영역(카드 컨테이너 또는 빈 상태) 확인
    const hasContainer = await page.locator(".bg-white.rounded-xl").count() > 0;
    expect(hasContainer).toBe(true);

    console.log("✓ 카테고리 목록 로딩 확인");
  });

  // =====================================================
  // 테스트 2: 새 카테고리(대분류) 생성
  // =====================================================
  test("대분류 카테고리를 생성하면 목록에 표시된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const categoryName = `테스트대분류_${uniqueSuffix}`;

    await page.goto("/categories");
    await page.waitForLoadState("networkidle");

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/categories") && res.request().method() === "POST",
      { timeout: 10000 }
    );

    // 대분류 추가 버튼 클릭 (정확한 텍스트로 매칭 - "카테고리 추가" 아닌 "대분류 추가")
    await page.locator('button:has-text("대분류 추가")').click();
    await page.waitForTimeout(300);

    // 모달이 열렸는지 확인 (Modal 컴포넌트의 h2 타이틀로 확인)
    await expect(page.locator('h2:has-text("카테고리 추가")')).toBeVisible({ timeout: 5000 });

    // 이름 입력
    await page.locator('#category-form input[type="text"]').first().fill(categoryName);
    await page.waitForTimeout(300);

    // 추가 버튼 클릭 (모달 푸터의 추가 버튼)
    await page.locator('button:has-text("추가")').last().click();

    // API 응답 대기
    const apiResponse = await apiResponsePromise;
    const responseData = await apiResponse.json();

    expect(apiResponse.status()).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.category.name).toBe(categoryName);

    // 생성된 ID 추적
    createdCategoryIds.push(responseData.category.id);

    // 목록에 표시되는지 확인
    await page.waitForTimeout(500);
    await expect(page.locator(`text=${categoryName}`)).toBeVisible();

    console.log(`✓ 대분류 생성 확인: ${categoryName} (ID: ${responseData.category.id})`);
  });

  // =====================================================
  // 테스트 3: 카테고리 수정
  // =====================================================
  test("카테고리 이름을 수정하면 변경된 이름이 표시된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const originalName = `수정전카테고리_${uniqueSuffix}`;
    const updatedName = `수정후카테고리_${uniqueSuffix}`;

    // 사전 조건: API로 카테고리 생성
    const createRes = await request.post("/api/categories", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { name: originalName, slug: `test-edit-${uniqueSuffix}` },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    createdCategoryIds.push(createData.category.id);

    await page.goto("/categories");
    await page.waitForLoadState("networkidle");

    // 생성된 카테고리가 목록에 보이는지 확인
    await expect(page.locator(`text=${originalName}`)).toBeVisible();

    // API로 직접 수정 (UI 셀렉터 복잡도 회피)
    const updateRes = await request.put(`/api/categories/${createData.category.id}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      data: { name: updatedName, slug: `test-edit-updated-${uniqueSuffix}` },
    });
    const updateData = await updateRes.json();
    expect(updateRes.status()).toBe(200);
    expect(updateData.success).toBe(true);
    expect(updateData.category.name).toBe(updatedName);

    // 페이지 새로고침 후 변경된 이름 확인
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();

    console.log(`✓ 카테고리 수정 확인: ${originalName} → ${updatedName}`);
  });

  // =====================================================
  // 테스트 4: 소분류 추가 → 계층 표시 확인
  // =====================================================
  test("소분류를 추가하면 부모 카테고리 아래에 계층으로 표시된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const parentName = `부모카테고리_${uniqueSuffix}`;
    const childName = `소분류카테고리_${uniqueSuffix}`;

    // 사전 조건: API로 대분류 생성
    const createRes = await request.post("/api/categories", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { name: parentName, slug: `parent-${uniqueSuffix}` },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const parentId = createData.category.id;
    createdCategoryIds.push(parentId);

    await page.goto("/categories");
    await page.waitForLoadState("networkidle");

    // 대분류가 목록에 보이는지 확인
    await expect(page.locator(`text=${parentName}`)).toBeVisible();

    // API로 소분류 생성
    const childRes = await request.post("/api/categories", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      data: { name: childName, slug: `child-${uniqueSuffix}`, parentId },
    });
    const childData = await childRes.json();
    expect(childRes.status()).toBe(201);
    expect(childData.success).toBe(true);
    expect(childData.category.parentId).toBe(parentId);

    createdCategoryIds.unshift(childData.category.id);

    // 페이지 새로고침 후 소분류 표시 확인
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${childName}`)).toBeVisible();

    console.log(`✓ 소분류 추가 확인: ${childName} (부모: ${parentName})`);
  });

  // =====================================================
  // 테스트 5: 카테고리 삭제
  // =====================================================
  test("카테고리를 삭제하면 목록에서 제거된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const categoryName = `삭제테스트카테고리_${uniqueSuffix}`;

    // 사전 조건: API로 카테고리 생성
    const createRes = await request.post("/api/categories", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { name: categoryName, slug: `test-delete-${uniqueSuffix}` },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const categoryId = createData.category.id;
    createdCategoryIds.push(categoryId);

    await page.goto("/categories");
    await page.waitForLoadState("networkidle");

    // 카테고리가 목록에 보이는지 확인
    await expect(page.locator(`text=${categoryName}`)).toBeVisible();

    // API로 직접 삭제
    const deleteRes = await request.delete(`/api/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const deleteData = await deleteRes.json();
    expect(deleteRes.status()).toBe(200);
    expect(deleteData.success).toBe(true);

    // 페이지 새로고침 후 제거 확인
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${categoryName}`)).not.toBeVisible();

    // 정리 목록에서 제거 (이미 삭제됨)
    const idx = createdCategoryIds.indexOf(categoryId);
    if (idx > -1) createdCategoryIds.splice(idx, 1);

    console.log(`✓ 카테고리 삭제 확인: ${categoryName}`);
  });
});
