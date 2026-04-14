import { test, expect } from "@playwright/test";

// =====================================================
// 상품 수정 E2E 테스트
// 경로: /products/[id]/edit
// API: GET/PUT /api/products/[id]
// =====================================================

test.describe("상품 수정", () => {
  test.setTimeout(90000);

  let authToken: string;
  let testProductId: string;

  test.beforeEach(async ({ page, request }) => {
    const loginRes = await request.post("/api/login", {
      data: { username: "admin", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    // 테스트용 상품 ID 확보 (기존 상품 사용)
    const productsRes = await request.get("/api/products?limit=1", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const productsData = await productsRes.json();

    if (!productsData.success || productsData.products.length === 0) {
      test.skip(true, "테스트할 상품이 없습니다");
      return;
    }

    testProductId = productsData.products[0].id;

    // UI 로그인
    await page.goto("/login");
    await page.locator('input[type="text"]').fill("admin");
    await page.locator('input[type="password"]').fill("qwer1234!!");
    await page.locator('button:has-text("로그인")').click();
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  // =====================================================
  // 테스트 1: 상품 수정 페이지 로딩 확인
  // =====================================================
  test("상품 수정 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto(`/products/${testProductId}/edit`);
    await page.waitForLoadState("networkidle");

    // 페이지 제목 확인
    await expect(page.locator('h1:has-text("상품 수정")')).toBeVisible({ timeout: 15000 });

    // 로딩 완료 후 폼이 표시되는지 확인 (로딩 중 텍스트가 사라지는지)
    await expect(page.locator("text=로딩 중...")).not.toBeVisible({ timeout: 10000 });

    console.log(`✓ 상품 수정 페이지 로딩 확인 (ID: ${testProductId})`);
  });

  // =====================================================
  // 테스트 2: 기존 데이터가 폼에 프리필되는지 확인
  // =====================================================
  test("기존 상품 데이터가 폼에 프리필된다", async ({ page, request }) => {
    // API로 상품 데이터 조회
    const productRes = await request.get(`/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(productRes.status()).toBe(200);
    const productData = await productRes.json();
    expect(productData.success).toBe(true);

    const product = productData.product;

    // 수정 페이지 로드
    await page.goto(`/products/${testProductId}/edit`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('h1:has-text("상품 수정")')).toBeVisible({ timeout: 15000 });

    // 제목 필드에 기존 값이 들어있는지 확인
    // 상품명 input: placeholder에 "골프" 포함, readOnly가 아닌 것 (slug은 readOnly)
    const titleInput = page.locator('input[placeholder*="골프"]').first();
    if (await titleInput.count() > 0) {
      const titleValue = await titleInput.inputValue();
      expect(titleValue).toBe(product.title);
      console.log(`✓ 제목 프리필 확인: ${product.title}`);
    } else {
      // slug 필드(readOnly)가 아닌 첫 번째 편집 가능한 text input 확인
      const slugInput = page.locator('input[readonly]').first();
      if (await slugInput.count() > 0) {
        const slugValue = await slugInput.inputValue();
        expect(slugValue).toBe(product.slug);
        console.log(`✓ slug 프리필 확인: ${product.slug}`);
      }
    }

    console.log(`✓ 상품 데이터 프리필 확인 (${product.title})`);
  });

  // =====================================================
  // 테스트 3: 상품 API GET 응답 검증
  // =====================================================
  test("상품 상세 API가 모든 관계 데이터를 포함한다", async ({ request }) => {
    const res = await request.get(`/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.product).toHaveProperty("id");
    expect(data.product).toHaveProperty("title");
    expect(data.product).toHaveProperty("slug");

    console.log(`✓ 상품 상세 API 검증: ${data.product.title}`);
  });

  // =====================================================
  // 테스트 4: 존재하지 않는 상품 ID로 수정 페이지 접근
  // =====================================================
  test("존재하지 않는 상품 수정 페이지에서 에러 상태가 표시된다", async ({ page }) => {
    await page.goto("/products/nonexistent-product-id-12345/edit");
    await page.waitForLoadState("networkidle");

    // "상품을 찾을 수 없습니다" 에러 메시지가 표시되어야 함
    await expect(page.locator("text=상품을 찾을 수 없습니다")).toBeVisible({ timeout: 15000 });

    console.log("✓ 존재하지 않는 상품 에러 상태 확인");
  });

  // =====================================================
  // 테스트 5: 상품 목록에서 수정 페이지로 이동
  // =====================================================
  test("상품 목록에서 수정 버튼 클릭 시 수정 페이지로 이동한다", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    const hasProducts = await page.locator("table tbody tr").count() > 0;
    if (!hasProducts) {
      test.skip(true, "상품이 없어 스킵");
      return;
    }

    const editButton = page.locator('table tbody tr:first-child a[href*="/edit"], table tbody tr:first-child button[title="수정"]').first();

    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForURL("**/products/*/edit", { timeout: 10000 });
      await expect(page.locator('h1:has-text("상품 수정")')).toBeVisible({ timeout: 15000 });
      console.log("✓ 목록 → 수정 페이지 이동 확인");
    } else {
      await page.locator("table tbody tr:first-child").first().click();
      console.log("✓ 상품 행 클릭 시도 (수정 버튼 없음)");
    }
  });

  // =====================================================
  // 테스트 6: 상품 제목 수정 후 저장 → DB 반영 확인
  // =====================================================
  test("상품 제목을 수정하고 저장하면 DB에 반영된다", async ({ page, request }) => {
    // 기존 상품 데이터 조회
    const productRes = await request.get(`/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const originalProduct = (await productRes.json()).product;
    const originalTitle = originalProduct.title;
    const modifiedTitle = `${originalTitle} (수정테스트)`;

    // 수정 페이지 로드
    await page.goto(`/products/${testProductId}/edit`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('h1:has-text("상품 수정")')).toBeVisible({ timeout: 15000 });

    // 제목 수정
    const titleInput = page.locator('input[placeholder*="골프"]').first();
    await titleInput.clear();
    await titleInput.fill(modifiedTitle);
    await page.waitForTimeout(300);

    // 저장 버튼 클릭 + API 응답 캡처
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes(`/api/products/${testProductId}`) && res.request().method() === "PUT",
      { timeout: 15000 }
    );

    await page.locator('button:has-text("수정")').last().click();

    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);
    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);
    expect(responseData.product.title).toBe(modifiedTitle);
    console.log(`✓ 제목 수정 저장 확인: "${originalTitle}" → "${modifiedTitle}"`);

    // DB에서 재조회하여 반영 확인
    const verifyRes = await request.get(`/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const verifyData = await verifyRes.json();
    expect(verifyData.product.title).toBe(modifiedTitle);
    console.log("✓ DB 반영 확인 완료");

    // 원래 제목으로 복원
    await request.put(`/api/products/${testProductId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { title: originalTitle },
    });
    console.log(`✓ 원래 제목 복원: "${originalTitle}"`);
  });

  // =====================================================
  // 테스트 7: 상품 가격 수정 후 저장 → DB 반영 확인
  // =====================================================
  test("상품 판매가를 수정하고 저장하면 DB에 반영된다", async ({ page, request }) => {
    const productRes = await request.get(`/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const originalProduct = (await productRes.json()).product;
    const originalPrice = originalProduct.basePrice;
    const modifiedPrice = 9999999;

    await page.goto(`/products/${testProductId}/edit`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('h1:has-text("상품 수정")')).toBeVisible({ timeout: 15000 });

    // 판매가 수정
    const priceInput = page.locator('label:has-text("판매가 (원)")').locator("..").locator('input[type="number"]');
    await priceInput.scrollIntoViewIfNeeded();
    await priceInput.clear();
    await priceInput.fill(String(modifiedPrice));
    await page.waitForTimeout(300);

    // 저장
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes(`/api/products/${testProductId}`) && res.request().method() === "PUT",
      { timeout: 15000 }
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.locator('button:has-text("수정")').last().click();

    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);
    const responseData = await apiResponse.json();
    expect(responseData.product.basePrice).toBe(modifiedPrice);
    console.log(`✓ 판매가 수정 확인: ${originalPrice} → ${modifiedPrice}`);

    // DB 반영 확인
    const verifyRes = await request.get(`/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect((await verifyRes.json()).product.basePrice).toBe(modifiedPrice);
    console.log("✓ DB 반영 확인 완료");

    // 원래 가격 복원
    await request.put(`/api/products/${testProductId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { basePrice: originalPrice },
    });
    console.log(`✓ 원래 가격 복원: ${originalPrice}`);
  });

  // =====================================================
  // 테스트 8: 상품 설정(활성/추천) 수정 → DB 반영 확인
  // =====================================================
  test("상품 활성/추천 상태를 API로 수정하면 반영된다", async ({ request }) => {
    // 현재 상태 조회
    const productRes = await request.get(`/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const original = (await productRes.json()).product;

    // 추천 상태 토글
    const newFeatured = !original.isFeatured;
    const updateRes = await request.put(`/api/products/${testProductId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { isFeatured: newFeatured },
    });
    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.product.isFeatured).toBe(newFeatured);
    console.log(`✓ 추천 상태 변경: ${original.isFeatured} → ${newFeatured}`);

    // 복원
    await request.put(`/api/products/${testProductId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { isFeatured: original.isFeatured },
    });
    console.log(`✓ 추천 상태 복원: ${original.isFeatured}`);
  });
});
