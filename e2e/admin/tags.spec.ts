import { test, expect } from "@playwright/test";

// =====================================================
// 태그 관리 E2E 테스트
// 경로: /tags
// API: GET/POST/PUT/DELETE /api/tags
// =====================================================

test.describe("태그 관리", () => {
  test.setTimeout(60000);

  let authToken: string;
  // 테스트 중 생성된 태그 ID 추적 (정리용)
  const createdTagIds: string[] = [];

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

  test.afterEach(async ({ request }) => {
    // 테스트 중 생성된 태그 정리
    for (const id of createdTagIds) {
      try {
        await request.delete(`/api/tags/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {
        // 이미 삭제되었거나 실패해도 무시
      }
    }
    createdTagIds.length = 0;
  });

  // =====================================================
  // 테스트 1: 태그 목록 로딩 확인
  // =====================================================
  test("태그 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/tags");
    await page.waitForLoadState("networkidle");

    // 페이지 제목 확인
    await expect(page.locator('h1:has-text("태그 관리")')).toBeVisible();

    // 태그 추가 버튼 확인
    await expect(page.locator('button:has-text("태그 추가")')).toBeVisible();

    // 테이블 헤더 확인 (태그가 있는 경우)
    const tableHeader = page.locator('th:has-text("이름")');
    const emptyState = page.locator('text=태그가 없습니다');

    const hasTable = await tableHeader.count() > 0;
    const hasEmpty = await emptyState.count() > 0;
    expect(hasTable || hasEmpty).toBe(true);

    console.log("✓ 태그 목록 로딩 확인");
  });

  // =====================================================
  // 테스트 2: 새 태그 생성
  // =====================================================
  test("새 태그를 생성하면 테이블에 표시된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const tagName = `테스트태그_${uniqueSuffix}`;

    await page.goto("/tags");
    await page.waitForLoadState("networkidle");

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/tags") && res.request().method() === "POST",
      { timeout: 10000 }
    );

    // 태그 추가 버튼 클릭
    await page.locator('button:has-text("태그 추가")').click();
    await page.waitForTimeout(300);

    // 모달이 열렸는지 확인 (h2 타이틀로 확인 - strict mode violation 방지)
    await expect(page.locator('h2:has-text("태그 추가")')).toBeVisible({ timeout: 5000 });

    // 태그 이름 입력 (form id="tag-form" 내 이름 필드)
    await page.locator('#tag-form input[type="text"]').first().fill(tagName);
    await page.waitForTimeout(300);

    // 타입 선택 (커스텀 Select 컴포넌트)
    // Select 컴포넌트의 트리거 버튼: tag-form 안의 버튼 중 타입 텍스트를 포함하는 것
    const typeSelectBtn = page.locator('#tag-form button').filter({ hasText: /특징|기간|가격대|숙박/ }).first();
    await typeSelectBtn.click();
    await page.waitForTimeout(200);
    // 드롭다운에서 "기간" 선택
    await page.locator('ul li button:has-text("기간")').last().click();
    await page.waitForTimeout(200);

    // 추가 버튼 클릭 (모달 푸터의 추가 버튼)
    await page.locator('button:has-text("추가")').last().click();

    // API 응답 대기
    const apiResponse = await apiResponsePromise;
    const responseData = await apiResponse.json();

    expect(apiResponse.status()).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.tag.name).toBe(tagName);
    expect(responseData.tag.type).toBe("DURATION");

    // 생성된 ID 추적
    createdTagIds.push(responseData.tag.id);

    // 테이블에 표시되는지 확인
    await page.waitForTimeout(500);
    await expect(page.locator(`td:has-text("${tagName}")`)).toBeVisible();

    console.log(`✓ 태그 생성 확인: ${tagName} (ID: ${responseData.tag.id})`);
  });

  // =====================================================
  // 테스트 3: 태그 수정
  // =====================================================
  test("태그 이름을 수정하면 변경된 이름이 테이블에 표시된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const originalName = `수정전태그_${uniqueSuffix}`;
    const updatedName = `수정후태그_${uniqueSuffix}`;

    // 사전 조건: API로 태그 생성
    const createRes = await request.post("/api/tags", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: originalName,
        slug: `test-edit-tag-${uniqueSuffix}`,
        type: "FEATURE",
        sortOrder: 0,
        isActive: true,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    createdTagIds.push(createData.tag.id);

    await page.goto("/tags");
    await page.waitForLoadState("networkidle");

    // 생성된 태그가 테이블에 보이는지 확인
    await expect(page.locator(`td:has-text("${originalName}")`)).toBeVisible();

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/tags/") && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    // 수정 버튼 클릭 (해당 행의 title="수정" 버튼)
    await page.locator(`tr:has-text("${originalName}") button[title="수정"]`).click();
    await page.waitForTimeout(300);

    // 수정 모달 확인 (h2 타이틀로 확인)
    await expect(page.locator('h2:has-text("태그 수정")')).toBeVisible({ timeout: 5000 });

    // 이름 필드 초기화 후 새 이름 입력
    const nameInput = page.locator('#tag-form input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill(updatedName);
    await page.waitForTimeout(200);

    // 수정 버튼 클릭
    await page.locator('button:has-text("수정")').last().click();

    // API 응답 확인
    const apiResponse = await apiResponsePromise;
    const responseData = await apiResponse.json();

    expect(apiResponse.status()).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.tag.name).toBe(updatedName);

    // 변경된 이름이 테이블에 표시되는지 확인
    await page.waitForTimeout(500);
    await expect(page.locator(`td:has-text("${updatedName}")`)).toBeVisible();
    await expect(page.locator(`td:has-text("${originalName}")`)).not.toBeVisible();

    console.log(`✓ 태그 수정 확인: ${originalName} → ${updatedName}`);
  });

  // =====================================================
  // 테스트 4: 태그 활성/비활성 토글
  // =====================================================
  test("태그 상태 토글을 클릭하면 활성/비활성 상태가 변경된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const tagName = `토글테스트태그_${uniqueSuffix}`;

    // 사전 조건: API로 활성 상태의 태그 생성
    const createRes = await request.post("/api/tags", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: tagName,
        slug: `test-toggle-tag-${uniqueSuffix}`,
        type: "FEATURE",
        sortOrder: 0,
        isActive: true,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const tagId = createData.tag.id;
    createdTagIds.push(tagId);

    await page.goto("/tags");
    await page.waitForLoadState("networkidle");

    // 태그 행에서 토글 버튼 확인 (초기 상태: 활성 = bg-green-500)
    const tagRow = page.locator(`tr:has-text("${tagName}")`);
    await expect(tagRow).toBeVisible();

    // 토글 버튼: 상태 컬럼의 inline-flex rounded-full 버튼
    const toggleBtn = tagRow.locator('button.rounded-full').first();
    const initialClass = await toggleBtn.getAttribute("class");
    const wasActive = initialClass?.includes("bg-green-500") ?? false;

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/tags/${tagId}`) && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    // 토글 클릭
    await toggleBtn.click();

    // API 응답 확인
    const apiResponse = await apiResponsePromise;
    const responseData = await apiResponse.json();

    expect(apiResponse.status()).toBe(200);
    expect(responseData.success).toBe(true);
    // 상태가 반전되었는지 확인
    expect(responseData.tag.isActive).toBe(!wasActive);

    // UI에서 토글 색상 변경 확인
    await page.waitForTimeout(500);
    const updatedToggle = tagRow.locator('button.rounded-full').first();
    const updatedClass = await updatedToggle.getAttribute("class");

    if (wasActive) {
      // 활성 → 비활성: bg-gray-300으로 변경
      expect(updatedClass).toContain("bg-gray-300");
    } else {
      // 비활성 → 활성: bg-green-500으로 변경
      expect(updatedClass).toContain("bg-green-500");
    }

    console.log(`✓ 태그 토글 확인: ${tagName} (${wasActive ? "활성→비활성" : "비활성→활성"})`);
  });

  // =====================================================
  // 테스트 5: 태그 삭제
  // =====================================================
  test("태그를 삭제하면 테이블에서 제거된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const tagName = `삭제테스트태그_${uniqueSuffix}`;

    // 사전 조건: API로 태그 생성
    const createRes = await request.post("/api/tags", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: tagName,
        slug: `test-delete-tag-${uniqueSuffix}`,
        type: "FEATURE",
        sortOrder: 0,
        isActive: true,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const tagId = createData.tag.id;
    createdTagIds.push(tagId);

    await page.goto("/tags");
    await page.waitForLoadState("networkidle");

    // 태그가 테이블에 보이는지 확인
    await expect(page.locator(`td:has-text("${tagName}")`)).toBeVisible();

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/tags/") && res.request().method() === "DELETE",
      { timeout: 10000 }
    );

    // 삭제 버튼 클릭 (쓰레기통 아이콘, title="삭제")
    await page.locator(`tr:has-text("${tagName}") button[title="삭제"]`).click();
    await page.waitForTimeout(300);

    // ConfirmModal에서 삭제 버튼 클릭
    await expect(page.locator('button:has-text("삭제")').last()).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("삭제")').last().click();

    // API 응답 확인
    const apiResponse = await apiResponsePromise;
    const responseData = await apiResponse.json();

    expect(apiResponse.status()).toBe(200);
    expect(responseData.success).toBe(true);

    // 테이블에서 제거되었는지 확인
    await page.waitForTimeout(500);
    await expect(page.locator(`td:has-text("${tagName}")`)).not.toBeVisible();

    // 정리 목록에서 제거 (이미 삭제됨)
    const idx = createdTagIds.indexOf(tagId);
    if (idx > -1) createdTagIds.splice(idx, 1);

    console.log(`✓ 태그 삭제 확인: ${tagName}`);
  });
});
