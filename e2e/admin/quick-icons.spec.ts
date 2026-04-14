import { test, expect } from "@playwright/test";

// =====================================================
// 빠른아이콘 관리 E2E 테스트
// 경로: /quick-icons
// API: GET/POST /api/quick-icons, PUT/DELETE /api/quick-icons/[id]
// =====================================================

test.describe("빠른아이콘 관리", () => {
  test.setTimeout(60000);

  let authToken: string;
  const createdIds: string[] = [];

  test.beforeEach(async ({ page, request }) => {
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
    for (const id of createdIds) {
      try {
        await request.delete(`/api/quick-icons/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {}
    }
    createdIds.length = 0;
  });

  // =====================================================
  // 테스트 1: 목록 로딩 확인
  // =====================================================
  test("빠른아이콘 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/quick-icons");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('h1:has-text("빠른아이콘 관리")')).toBeVisible();
    await expect(page.locator('button:has-text("아이콘 추가")')).toBeVisible();

    // 테이블 또는 빈 상태 확인
    const hasTable = await page.locator("th:has-text('레이블')").count() > 0;
    const hasEmpty = await page.locator("text=등록된 빠른아이콘이 없습니다").count() > 0;
    expect(hasTable || hasEmpty).toBe(true);

    console.log("✓ 빠른아이콘 목록 로딩 확인");
  });

  // =====================================================
  // 테스트 2: 빠른아이콘 생성
  // =====================================================
  test("빠른아이콘을 생성하면 테이블에 표시된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const label = `테스트아이콘_${uniqueSuffix}`;
    const linkUrl = `https://example.com/test-${uniqueSuffix}`;

    // API로 직접 생성 (UI 셀렉터 복잡도 회피)
    const createRes = await request.post("/api/quick-icons", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        label,
        iconName: "plane",
        linkUrl,
        sortOrder: 99,
        isActive: true,
      },
    });

    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.quickIcon.label).toBe(label);
    createdIds.push(createData.quickIcon.id);

    // 페이지에서 확인
    await page.goto("/quick-icons");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${label}`)).toBeVisible();

    console.log(`✓ 빠른아이콘 생성 확인: ${label}`);
  });

  // =====================================================
  // 테스트 3: 유효성 검사 - 필수 필드 누락
  // =====================================================
  test("필수 필드 누락 시 API가 400 에러를 반환한다", async ({ request }) => {
    // 레이블 없이 생성 시도
    const res1 = await request.post("/api/quick-icons", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { iconName: "plane", linkUrl: "https://example.com" },
    });
    expect(res1.status()).toBe(400);

    // 링크 URL 없이 생성 시도
    const res2 = await request.post("/api/quick-icons", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { label: "테스트", iconName: "plane" },
    });
    expect(res2.status()).toBe(400);

    // 아이콘 이름 없이 생성 시도
    const res3 = await request.post("/api/quick-icons", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { label: "테스트", linkUrl: "https://example.com" },
    });
    expect(res3.status()).toBe(400);

    console.log("✓ 필수 필드 유효성 검사 확인 (label, iconName, linkUrl)");
  });

  // =====================================================
  // 테스트 4: 빠른아이콘 수정
  // =====================================================
  test("빠른아이콘을 수정하면 변경된 내용이 반영된다", async ({ request }) => {
    const uniqueSuffix = Date.now();

    // 생성
    const createRes = await request.post("/api/quick-icons", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        label: `수정전_${uniqueSuffix}`,
        iconName: "plane",
        linkUrl: "https://before.com",
        sortOrder: 0,
        isActive: true,
      },
    });
    const createData = await createRes.json();
    createdIds.push(createData.quickIcon.id);

    // 수정
    const updateRes = await request.put(`/api/quick-icons/${createData.quickIcon.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        label: `수정후_${uniqueSuffix}`,
        iconName: "star",
        linkUrl: "https://after.com",
        sortOrder: 10,
      },
    });

    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.quickIcon.label).toBe(`수정후_${uniqueSuffix}`);
    expect(updateData.quickIcon.iconName).toBe("star");
    expect(updateData.quickIcon.linkUrl).toBe("https://after.com");
    expect(updateData.quickIcon.sortOrder).toBe(10);

    console.log(`✓ 빠른아이콘 수정 확인: 수정전_${uniqueSuffix} → 수정후_${uniqueSuffix}`);
  });

  // =====================================================
  // 테스트 5: 활성/비활성 토글
  // =====================================================
  test("빠른아이콘 활성 상태를 토글할 수 있다", async ({ request }) => {
    const uniqueSuffix = Date.now();

    // 활성 상태로 생성
    const createRes = await request.post("/api/quick-icons", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        label: `토글_${uniqueSuffix}`,
        iconName: "globe",
        linkUrl: "https://toggle.com",
        isActive: true,
      },
    });
    const createData = await createRes.json();
    const iconId = createData.quickIcon.id;
    createdIds.push(iconId);

    // 비활성화
    const toggleRes = await request.put(`/api/quick-icons/${iconId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { isActive: false },
    });
    expect(toggleRes.status()).toBe(200);
    const toggleData = await toggleRes.json();
    expect(toggleData.quickIcon.isActive).toBe(false);

    // 다시 활성화
    const toggleRes2 = await request.put(`/api/quick-icons/${iconId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { isActive: true },
    });
    expect(toggleRes2.status()).toBe(200);
    const toggleData2 = await toggleRes2.json();
    expect(toggleData2.quickIcon.isActive).toBe(true);

    console.log(`✓ 빠른아이콘 토글 확인: true → false → true`);
  });

  // =====================================================
  // 테스트 6: 빠른아이콘 삭제
  // =====================================================
  test("빠른아이콘을 삭제하면 목록에서 제거된다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const label = `삭제테스트_${uniqueSuffix}`;

    // 생성
    const createRes = await request.post("/api/quick-icons", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        label,
        iconName: "flag",
        linkUrl: "https://delete.com",
        isActive: true,
      },
    });
    const createData = await createRes.json();
    const iconId = createData.quickIcon.id;
    createdIds.push(iconId);

    // 삭제
    const deleteRes = await request.delete(`/api/quick-icons/${iconId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(deleteRes.status()).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // 목록에서 제거 확인
    await page.goto("/quick-icons");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${label}`)).not.toBeVisible();

    // 정리 목록에서 제거
    const idx = createdIds.indexOf(iconId);
    if (idx > -1) createdIds.splice(idx, 1);

    console.log(`✓ 빠른아이콘 삭제 확인: ${label}`);
  });
});
