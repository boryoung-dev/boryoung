import { test, expect } from "@playwright/test";

// =====================================================
// AI 설정 관리 E2E 테스트
// 경로: /ai-settings
// API: GET/POST /api/ai-providers, PUT/DELETE /api/ai-providers/[id]
// =====================================================

test.describe("AI 설정 관리", () => {
  test.setTimeout(60000);

  let authToken: string;
  const createdProviderIds: string[] = [];

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
    for (const id of createdProviderIds) {
      try {
        await request.delete(`/api/ai-providers/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {}
    }
    createdProviderIds.length = 0;
  });

  // =====================================================
  // 테스트 1: AI 설정 페이지 로딩 확인
  // =====================================================
  test("AI 설정 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/ai-settings");
    await page.waitForLoadState("networkidle");

    // 페이지 타이틀 또는 주요 UI 요소 확인
    // AI 설정 페이지의 "AI 제공자" 또는 관련 텍스트 확인
    const pageLoaded =
      (await page.locator("text=AI").first().count()) > 0 ||
      (await page.locator("text=제공자").first().count()) > 0;
    expect(pageLoaded).toBe(true);

    console.log("✓ AI 설정 페이지 로딩 확인");
  });

  // =====================================================
  // 테스트 2: AI 제공자 목록 API 확인
  // =====================================================
  test("AI 제공자 목록 API가 정상 응답한다", async ({ request }) => {
    const res = await request.get("/api/ai-providers", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.providers)).toBe(true);

    // API 키가 마스킹되었는지 확인
    for (const provider of data.providers) {
      if (provider.apiKey) {
        expect(provider.apiKey).toContain("****");
      }
    }

    console.log(`✓ AI 제공자 목록 API 확인: ${data.providers.length}개`);
  });

  // =====================================================
  // 테스트 3: AI 제공자 생성 (API)
  // =====================================================
  test("새 AI 제공자를 생성할 수 있다", async ({ request }) => {
    const uniqueSuffix = Date.now();

    const createRes = await request.post("/api/ai-providers", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: `테스트OpenAI_${uniqueSuffix}`,
        provider: "openai",
        apiKey: "sk-test-fake-key-12345678",
        model: "gpt-4o-mini",
        isDefault: false,
        authType: "apikey",
      },
    });
    expect(createRes.status()).toBe(201);

    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.provider.name).toBe(`테스트OpenAI_${uniqueSuffix}`);
    expect(createData.provider.provider).toBe("openai");
    // API 키가 마스킹되어 반환
    expect(createData.provider.apiKey).toContain("****");
    createdProviderIds.push(createData.provider.id);

    console.log(`✓ AI 제공자 생성 확인: 테스트OpenAI_${uniqueSuffix}`);
  });

  // =====================================================
  // 테스트 4: 유효성 검사 - 필수 필드 누락
  // =====================================================
  test("필수 필드 누락 시 API가 400 에러를 반환한다", async ({ request }) => {
    // name 없이
    const res1 = await request.post("/api/ai-providers", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { provider: "openai", apiKey: "sk-test" },
    });
    expect(res1.status()).toBe(400);

    // provider 없이
    const res2 = await request.post("/api/ai-providers", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { name: "테스트", apiKey: "sk-test" },
    });
    expect(res2.status()).toBe(400);

    console.log("✓ AI 제공자 필수 필드 유효성 검사 확인 (name, provider)");
  });

  // =====================================================
  // 테스트 5: 기본 제공자 설정 시 기존 기본 해제
  // =====================================================
  test("기본 제공자를 설정하면 기존 기본 제공자가 해제된다", async ({ request }) => {
    const uniqueSuffix = Date.now();

    // 첫 번째 기본 제공자 생성
    const res1 = await request.post("/api/ai-providers", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: `기본1_${uniqueSuffix}`,
        provider: "openai",
        apiKey: "sk-test-1",
        isDefault: true,
      },
    });
    expect(res1.status()).toBe(201);
    const data1 = await res1.json();
    createdProviderIds.push(data1.provider.id);

    // 두 번째 기본 제공자 생성
    const res2 = await request.post("/api/ai-providers", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: `기본2_${uniqueSuffix}`,
        provider: "anthropic",
        apiKey: "sk-ant-test-2",
        isDefault: true,
      },
    });
    expect(res2.status()).toBe(201);
    const data2 = await res2.json();
    createdProviderIds.push(data2.provider.id);

    // 목록에서 확인: 두 번째만 기본이어야 함
    const listRes = await request.get("/api/ai-providers", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();

    const first = listData.providers.find((p: any) => p.id === data1.provider.id);
    const second = listData.providers.find((p: any) => p.id === data2.provider.id);

    expect(first.isDefault).toBe(false);
    expect(second.isDefault).toBe(true);

    console.log("✓ 기본 제공자 교체 확인: 첫 번째 해제, 두 번째 설정");
  });

  // =====================================================
  // 테스트 6: 인증 없이 API 호출 시 401
  // =====================================================
  test("인증 없이 API 호출 시 401이 반환된다", async ({ request }) => {
    const res = await request.get("/api/ai-providers");
    expect(res.status()).toBe(401);

    console.log("✓ 미인증 401 확인");
  });
});
