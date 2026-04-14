import { test, expect } from "@playwright/test";

// 로그인 헬퍼
async function login(page: any) {
  await page.goto("/login");
  await page.locator('input[type="text"]').fill("admin");
  await page.locator('input[type="password"]').fill("qwer1234!!");
  await page.locator('button:has-text("로그인")').click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}

// 커스텀 Select 컴포넌트 선택 헬퍼
async function selectOption(page: any, container: any, optionText: string) {
  // Select 트리거 버튼 클릭
  const trigger = container.locator("button").first();
  await trigger.click();
  await page.waitForTimeout(200);
  // 드롭다운에서 옵션 선택
  await page.locator(`ul li button:has-text("${optionText}")`).last().click();
  await page.waitForTimeout(200);
}

// 모달 컨테이너 헬퍼 (Modal 컴포넌트: fixed inset-0 z-50 래퍼 안의 bg-white 컨테이너)
function getModal(page: any) {
  return page.locator('.fixed.inset-0.z-50').locator('.bg-white.rounded-xl').first();
}

test.describe("블로그(매거진) 관리", () => {
  test.setTimeout(60000);

  let createdPostTitle: string;
  let authToken: string;

  test.beforeEach(async ({ page, request }) => {
    // API 로그인으로 토큰 획득
    const loginRes = await request.post("/api/login", {
      data: { username: "admin", password: "qwer1234!!" },
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    // UI 로그인
    await login(page);
  });

  // ========================================
  // 1. 블로그 목록 로딩
  // ========================================
  test("블로그 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    // 페이지 헤더 확인
    await expect(page.locator('h1:has-text("매거진")')).toBeVisible();

    // 필터 탭 확인 (탭 텍스트에 건수 포함 가능: "전체 (17)")
    await expect(page.locator('button:has-text("전체")').first()).toBeVisible();

    // 검색바 확인
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();

    // 글 작성 버튼 확인
    await expect(page.locator('button:has-text("글 작성")').first()).toBeVisible();

    console.log("✓ 블로그 목록 페이지 로딩 완료");
  });

  // ========================================
  // 2. 새 블로그 글 생성
  // ========================================
  test("새 블로그 글을 생성한다", async ({ page }) => {
    // 유니크 제목 생성
    const uniqueSuffix = Date.now();
    createdPostTitle = `E2E 테스트 블로그 글 ${uniqueSuffix}`;

    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    // "글 작성" 버튼 클릭 (AI 글 작성과 구분)
    await page.getByRole('button', { name: '글 작성', exact: true }).click();

    // 모달 열림 대기 (Modal 컴포넌트: h2 타이틀로 확인)
    await expect(page.locator('h2:has-text("글 작성")')).toBeVisible({ timeout: 5000 });

    const modal = getModal(page);

    // 제목 입력
    await modal.locator('input[type="text"]').fill(createdPostTitle);

    // 카테고리 선택 (커스텀 Select)
    const categoryContainer = modal.locator('label:has-text("카테고리")').locator("..");
    await selectOption(page, categoryContainer, "여행팁");

    // 발췌 입력
    await modal.locator("textarea").first().fill("E2E 테스트용 발췌 내용입니다.");

    // 본문 입력 (TiptapEditor - contenteditable)
    const editor = modal.locator('[contenteditable="true"]');
    if (await editor.count() > 0) {
      await editor.first().click();
      await page.keyboard.type("E2E 테스트용 블로그 본문 내용입니다. 테스트 자동화로 작성된 글입니다.");
    } else {
      // fallback: textarea
      await modal.locator("textarea").last().fill("E2E 테스트용 블로그 본문 내용입니다.");
    }

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes("/api/blog-posts") && res.request().method() === "POST",
      { timeout: 10000 }
    );

    // 확인 버튼 클릭 (모달 푸터의 "작성" 버튼)
    await page.locator('button:has-text("작성")').last().click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(201);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);

    // 모달 닫힘 확인 (h2 타이틀이 사라져야 함)
    await expect(page.locator('h2:has-text("글 작성")')).not.toBeVisible({ timeout: 10000 });

    // 목록에서 생성된 글 확인
    await expect(page.locator(`text="${createdPostTitle}"`).first()).toBeVisible({ timeout: 5000 });

    console.log("✓ 블로그 글 생성 완료:", createdPostTitle);
  });

  // ========================================
  // 3. 블로그 글 수정
  // ========================================
  test("블로그 글을 수정한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const originalTitle = `수정 테스트 글 ${uniqueSuffix}`;
    const updatedTitle = `수정 완료 글 ${uniqueSuffix}`;

    // API로 테스트 글 생성
    const createRes = await request.post("/api/blog-posts", {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: {
        title: originalTitle,
        content: "<p>수정 테스트 본문</p>",
        contentHtml: "<p>수정 테스트 본문</p>",
        isPublished: false,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const postId = createData.post.id;

    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    // 생성한 글의 수정 버튼 클릭 (연필 아이콘)
    const row = page.locator(`tr:has-text("${originalTitle}")`);
    await row.locator('button[title="수정"]').click();

    // 모달 열림 대기 (h2 타이틀로 확인)
    await expect(page.locator('h2:has-text("글 수정")')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500); // 데이터 로딩 대기

    const modal = getModal(page);

    // 제목 수정
    const titleInput = modal.locator('input[type="text"]');
    await titleInput.clear();
    await titleInput.fill(updatedTitle);

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes(`/api/blog-posts/${postId}`) && res.request().method() === "PUT",
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
    await expect(page.locator('h2:has-text("글 수정")')).not.toBeVisible({ timeout: 10000 });

    // 목록에서 수정된 제목 확인
    await expect(page.locator(`text="${updatedTitle}"`).first()).toBeVisible({ timeout: 5000 });

    // 정리: 생성한 글 삭제
    await request.delete(`/api/blog-posts/${postId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✓ 블로그 글 수정 완료:", updatedTitle);
  });

  // ========================================
  // 4. 발행 토글
  // ========================================
  test("블로그 글 발행 토글을 변경한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const postTitle = `발행 토글 테스트 ${uniqueSuffix}`;

    // API로 비공개 글 생성
    const createRes = await request.post("/api/blog-posts", {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: {
        title: postTitle,
        content: "<p>발행 토글 테스트 본문</p>",
        contentHtml: "<p>발행 토글 테스트 본문</p>",
        isPublished: false,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const postId = createData.post.id;

    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    // 수정 모달 열기
    const row = page.locator(`tr:has-text("${postTitle}")`);
    await row.locator('button[title="수정"]').click();

    await expect(page.locator('h2:has-text("글 수정")')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    const modal = getModal(page);

    // 발행 토글 클릭 (현재 비공개 → 발행)
    // 실제 구조: <span>발행</span> 다음에 토글 버튼이 같은 flex 컨테이너에 있음
    const publishToggle = modal.locator('.flex.items-center.justify-between').filter({
      has: page.locator('span:has-text("발행")')
    }).locator('button');
    await publishToggle.click();

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) => res.url().includes(`/api/blog-posts/${postId}`) && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    // 수정 저장
    await page.locator('button:has-text("수정")').last().click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);
    expect(responseData.post.isPublished).toBe(true);

    await expect(page.locator('h2:has-text("글 수정")')).not.toBeVisible({ timeout: 10000 });

    // 발행됨 배지 확인
    const updatedRow = page.locator(`tr:has-text("${postTitle}")`);
    await expect(updatedRow.locator('span:has-text("발행됨")')).toBeVisible({ timeout: 5000 });

    // 정리: 생성한 글 삭제
    await request.delete(`/api/blog-posts/${postId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✓ 발행 토글 테스트 완료");
  });

  // ========================================
  // 5. 블로그 글 삭제
  // ========================================
  test("블로그 글을 삭제한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const postTitle = `삭제 테스트 글 ${uniqueSuffix}`;

    // API로 테스트 글 생성
    const createRes = await request.post("/api/blog-posts", {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: {
        title: postTitle,
        content: "<p>삭제 테스트 본문</p>",
        contentHtml: "<p>삭제 테스트 본문</p>",
        isPublished: false,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const postId = createData.post.id;

    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    // 생성한 글 확인
    await expect(page.locator(`text="${postTitle}"`).first()).toBeVisible();

    // 삭제 버튼 클릭 (쓰레기통 아이콘)
    const row = page.locator(`tr:has-text("${postTitle}")`);
    await row.locator('button[title="삭제"]').click();

    // ConfirmModal 확인 (h2 타이틀 없이 confirm 버튼만 있음)
    await expect(page.locator('button:has-text("삭제")').last()).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("삭제")').last().click();

    // API 삭제 응답 대기
    await page.waitForTimeout(1000);

    // 목록에서 제거 확인
    await expect(page.locator(`text="${postTitle}"`)).not.toBeVisible({ timeout: 5000 });

    console.log("✓ 블로그 글 삭제 완료");
  });

  // ========================================
  // 6. 검색 기능
  // ========================================
  test("블로그 검색바로 제목 검색이 동작한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const searchTitle = `검색테스트제목 ${uniqueSuffix}`;

    // API로 테스트 글 생성
    const createRes = await request.post("/api/blog-posts", {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: {
        title: searchTitle,
        content: "<p>검색 테스트 본문</p>",
        contentHtml: "<p>검색 테스트 본문</p>",
        isPublished: false,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    const postId = createData.post.id;

    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    // 검색어 입력
    await page.locator('input[placeholder*="검색"]').fill(`검색테스트제목 ${uniqueSuffix}`);
    await page.waitForTimeout(500); // 디바운스 대기

    // 검색 결과 확인
    await expect(page.locator(`text="${searchTitle}"`).first()).toBeVisible({ timeout: 5000 });

    // 존재하지 않는 검색어로 필터
    await page.locator('input[placeholder*="검색"]').fill("존재하지않는글제목xyz123abc");
    await page.waitForTimeout(500);

    // 결과 없음 확인
    await expect(page.locator(`text="${searchTitle}"`)).not.toBeVisible({ timeout: 3000 });

    // 정리
    await request.delete(`/api/blog-posts/${postId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✓ 블로그 검색 테스트 완료");
  });

  // ========================================
  // 7. 필터 탭 (발행/비공개)
  // ========================================
  test("필터 탭으로 발행/비공개 글을 구분하여 조회한다", async ({ page, request }) => {
    const uniqueSuffix = Date.now();
    const publishedTitle = `발행글 ${uniqueSuffix}`;
    const draftTitle = `비공개글 ${uniqueSuffix}`;

    // API로 발행 글과 비공개 글 생성
    const [publishedRes, draftRes] = await Promise.all([
      request.post("/api/blog-posts", {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        data: { title: publishedTitle, content: "<p>발행 본문</p>", contentHtml: "<p>발행 본문</p>", isPublished: true },
      }),
      request.post("/api/blog-posts", {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        data: { title: draftTitle, content: "<p>비공개 본문</p>", contentHtml: "<p>비공개 본문</p>", isPublished: false },
      }),
    ]);

    const publishedData = await publishedRes.json();
    const draftData = await draftRes.json();
    expect(publishedData.success).toBe(true);
    expect(draftData.success).toBe(true);

    const publishedId = publishedData.post.id;
    const draftId = draftData.post.id;

    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    // "발행됨" 탭 클릭
    await page.locator('button:has-text("발행됨")').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text="${publishedTitle}"`).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text="${draftTitle}"`)).not.toBeVisible();

    // "비공개" 탭 클릭
    await page.locator('button:has-text("비공개")').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text="${draftTitle}"`).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text="${publishedTitle}"`)).not.toBeVisible();

    // 정리
    await Promise.all([
      request.delete(`/api/blog-posts/${publishedId}`, { headers: { Authorization: `Bearer ${authToken}` } }),
      request.delete(`/api/blog-posts/${draftId}`, { headers: { Authorization: `Bearer ${authToken}` } }),
    ]);

    console.log("✓ 필터 탭 테스트 완료");
  });
});
