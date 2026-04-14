import { test, expect } from "@playwright/test";

// 로그인 헬퍼
async function login(page: any) {
  await page.goto("/login");
  await page.locator('input[type="text"]').fill("admin");
  await page.locator('input[type="password"]').fill("qwer1234!!");
  await page.locator('button:has-text("로그인")').click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}

// 모달 컨테이너 헬퍼
function getModal(page: any) {
  return page.locator('.fixed.inset-0.z-50').locator('.bg-white.rounded-xl').first();
}

test.describe("문의 관리", () => {
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
    await login(page);
  });

  // ========================================
  // 1. 문의 목록 로딩
  // ========================================
  test("문의 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/inquiries");
    await page.waitForLoadState("networkidle");

    // 페이지 헤더 확인
    await expect(page.locator("h1:has-text('문의 관리')")).toBeVisible();

    // 필터 탭 확인
    await expect(page.locator("button:has-text('전체')").first()).toBeVisible();
    await expect(page.locator("button:has-text('대기중')").first()).toBeVisible();
    await expect(page.locator("button:has-text('답변완료')").first()).toBeVisible();
    await expect(page.locator("button:has-text('종료')").first()).toBeVisible();

    // 테이블 헤더 확인
    await expect(page.locator("th:has-text('이름')")).toBeVisible();
    await expect(page.locator("th:has-text('연락처')")).toBeVisible();
    await expect(page.locator("th:has-text('내용')")).toBeVisible();
    await expect(page.locator("th:has-text('상태')")).toBeVisible();

    console.log("✓ 문의 목록 페이지 로딩 완료");
  });

  // ========================================
  // 2. 문의 상세 보기
  // ========================================
  test("문의 상세 모달을 열어 내용을 확인한다", async ({ page, request }) => {
    // 문의 목록 조회
    const listRes = await request.get("/api/inquiries", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();

    // 문의가 없으면 테스트 스킵
    if (!listData.inquiries || listData.inquiries.length === 0) {
      console.log("⚠ 테스트용 문의가 없어 스킵합니다. 먼저 웹앱에서 문의를 등록해주세요.");
      test.skip();
      return;
    }

    const inquiry = listData.inquiries[0];

    await page.goto("/inquiries");
    await page.waitForLoadState("networkidle");

    // 첫 번째 문의의 상세/답변 버튼(Reply 아이콘) 클릭 - title="상세/답변"
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.locator('button[title="상세/답변"]').click();

    // 모달 열림 대기 (h2 타이틀로 확인)
    await expect(page.locator('h2:has-text("문의 상세")')).toBeVisible({ timeout: 5000 });

    const modal = getModal(page);

    // 모달 내 레이블 확인
    await expect(modal.locator('label:has-text("이름")')).toBeVisible();
    await expect(modal.locator('label:has-text("연락처")')).toBeVisible();
    await expect(modal.locator('label:has-text("문의 내용")')).toBeVisible();
    await expect(modal.locator('label:has-text("상태")')).toBeVisible();
    await expect(modal.locator('label:has-text("관리자 답변")')).toBeVisible();

    // 문의 내용이 표시되는지 확인 (bg-gray-50 p-4 rounded-lg 영역)
    const contentArea = modal.locator(".bg-gray-50.p-4.rounded-lg");
    await expect(contentArea).toBeVisible();
    expect((await contentArea.innerText()).length).toBeGreaterThan(0);

    // 취소 버튼으로 모달 닫기
    await modal.locator('button:has-text("취소")').click();
    await expect(page.locator('h2:has-text("문의 상세")')).not.toBeVisible({ timeout: 5000 });

    console.log("✓ 문의 상세 보기 완료");
  });

  // ========================================
  // 3. 답변 작성 + 상태 변경
  // ========================================
  test("문의에 답변을 작성하고 상태를 변경한다", async ({ page, request }) => {
    // 문의 목록 조회
    const listRes = await request.get("/api/inquiries", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();

    // PENDING 상태 문의 찾기
    const pendingInquiry = listData.inquiries?.find((i: any) => i.status === "PENDING");

    if (!pendingInquiry) {
      console.log("⚠ PENDING 상태 문의가 없어 스킵합니다.");
      test.skip();
      return;
    }

    await page.goto("/inquiries");
    await page.waitForLoadState("networkidle");

    // PENDING 문의 행 찾기 (이름으로)
    const row = page.locator(`tr:has-text("${pendingInquiry.name}")`).first();
    await row.locator('button[title="상세/답변"]').click();

    // 모달 열림 대기
    await expect(page.locator('h2:has-text("문의 상세")')).toBeVisible({ timeout: 5000 });

    const modal = getModal(page);

    // 상태 변경 (PENDING → REPLIED)
    // Select 컴포넌트: label "상태" 다음 컨테이너의 버튼 클릭
    const statusContainer = modal.locator('label:has-text("상태")').locator("..");
    const statusSelect = statusContainer.locator("button").first();
    await statusSelect.click();
    await page.waitForTimeout(200);
    await page.locator('ul li button:has-text("답변완료")').last().click();
    await page.waitForTimeout(200);

    // 관리자 답변 입력 (placeholder: "답변 내용을 입력하세요...")
    const replyTextarea = modal.locator('textarea[placeholder*="답변 내용"]');
    await replyTextarea.fill("안녕하세요. 문의해 주셔서 감사합니다. E2E 테스트 자동 답변입니다.");

    // API 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) =>
        res.url().includes(`/api/inquiries/${pendingInquiry.id}`) && res.request().method() === "PUT",
      { timeout: 10000 }
    );

    // 저장 버튼 클릭
    await page.locator('button:has-text("저장")').last().click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);

    // 모달 닫힘 확인
    await expect(page.locator('h2:has-text("문의 상세")')).not.toBeVisible({ timeout: 10000 });

    // 목록에서 상태 배지가 "답변완료"로 변경 확인
    const updatedRow = page.locator(`tr:has-text("${pendingInquiry.name}")`).first();
    await expect(updatedRow.locator('span:has-text("답변완료")')).toBeVisible({ timeout: 5000 });

    // 정리: 원래 상태로 복원
    await request.put(`/api/inquiries/${pendingInquiry.id}`, {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: { status: "PENDING", adminReply: null },
    });

    console.log("✓ 문의 답변 + 상태 변경 완료");
  });

  // ========================================
  // 4. 문의 상태를 종료로 변경
  // ========================================
  test("문의 상태를 종료로 변경한다", async ({ request }) => {
    // 문의 목록 조회
    const listRes = await request.get("/api/inquiries", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();

    const targetInquiry =
      listData.inquiries?.find((i: any) => i.status === "REPLIED") ||
      listData.inquiries?.find((i: any) => i.status === "PENDING");

    if (!targetInquiry) {
      console.log("⚠ 변경 가능한 문의가 없어 스킵합니다.");
      test.skip();
      return;
    }

    const originalStatus = targetInquiry.status;

    // API로 직접 상태를 CLOSED로 변경 (adminReply 없이 status만 전송)
    const updateRes = await request.put(`/api/inquiries/${targetInquiry.id}`, {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: { status: "CLOSED" },
    });
    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);

    // 목록에서 상태 확인
    const verifyRes = await request.get("/api/inquiries", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const verifyData = await verifyRes.json();
    const updated = verifyData.inquiries?.find((i: any) => i.id === targetInquiry.id);
    expect(updated?.status).toBe("CLOSED");

    // 정리: 원래 상태로 복원
    await request.put(`/api/inquiries/${targetInquiry.id}`, {
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      data: { status: originalStatus },
    });

    console.log("✓ 문의 종료 상태 변경 완료 (API 직접 검증)");
  });

  // ========================================
  // 5. 필터 탭별 조회
  // ========================================
  test("필터 탭으로 문의 상태별 조회가 동작한다", async ({ page, request }) => {
    // 문의 목록 조회
    const listRes = await request.get("/api/inquiries", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();

    if (!listData.inquiries || listData.inquiries.length === 0) {
      console.log("⚠ 문의가 없어 필터 탭 테스트를 스킵합니다.");
      test.skip();
      return;
    }

    const allInquiries: any[] = listData.inquiries;
    const pendingCount = allInquiries.filter((i) => i.status === "PENDING").length;
    const repliedCount = allInquiries.filter((i) => i.status === "REPLIED").length;
    const closedCount = allInquiries.filter((i) => i.status === "CLOSED").length;

    await page.goto("/inquiries");
    await page.waitForLoadState("networkidle");

    // "전체" 탭 — 모든 문의 표시
    await page.locator("button:has-text('전체')").first().click();
    await page.waitForTimeout(300);
    const allRows = page.locator("table tbody tr");
    const allRowCount = await allRows.count();
    if (allInquiries.length > 0) {
      expect(allRowCount).toBeGreaterThanOrEqual(1);
    }

    // "대기중" 탭
    await page.locator("button:has-text('대기중')").first().click();
    await page.waitForTimeout(300);
    const pendingRows = page.locator("table tbody tr");
    const pendingRowCount = await pendingRows.count();
    if (pendingCount > 0) {
      expect(pendingRowCount).toBeGreaterThanOrEqual(1);
      await expect(page.locator('span:has-text("답변완료")')).not.toBeVisible();
    }

    // "답변완료" 탭
    await page.locator("button:has-text('답변완료')").first().click();
    await page.waitForTimeout(300);
    const repliedRows = page.locator("table tbody tr");
    const repliedRowCount = await repliedRows.count();
    if (repliedCount > 0) {
      expect(repliedRowCount).toBeGreaterThanOrEqual(1);
      await expect(page.locator('span:has-text("대기중")')).not.toBeVisible();
    }

    // "종료" 탭
    await page.locator("button:has-text('종료')").first().click();
    await page.waitForTimeout(300);
    const closedRows = page.locator("table tbody tr");
    const closedRowCount = await closedRows.count();
    if (closedCount > 0) {
      expect(closedRowCount).toBeGreaterThanOrEqual(1);
    }

    // 다시 "전체" 탭으로 돌아가기
    await page.locator("button:has-text('전체')").first().click();
    await page.waitForTimeout(300);
    const backToAllRows = page.locator("table tbody tr");
    expect(await backToAllRows.count()).toBe(allRowCount);

    console.log(`✓ 필터 탭 테스트 완료 (전체: ${allInquiries.length}, 대기중: ${pendingCount}, 답변완료: ${repliedCount}, 종료: ${closedCount})`);
  });

  // ========================================
  // 6. 문의 삭제
  // ========================================
  test("문의를 삭제한다", async ({ page, request }) => {
    // 문의 목록 조회
    const listRes = await request.get("/api/inquiries", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();

    if (!listData.inquiries || listData.inquiries.length === 0) {
      console.log("⚠ 삭제할 문의가 없어 스킵합니다.");
      test.skip();
      return;
    }

    // 마지막 문의를 삭제 대상으로 선택
    const targetInquiry = listData.inquiries[listData.inquiries.length - 1];

    await page.goto("/inquiries");
    await page.waitForLoadState("networkidle");

    // 삭제 대상 행 확인
    const row = page.locator(`tr:has-text("${targetInquiry.name}")`).first();
    await expect(row).toBeVisible();

    // API 삭제 응답 캡처 준비
    const apiResponsePromise = page.waitForResponse(
      (res: any) =>
        res.url().includes(`/api/inquiries/${targetInquiry.id}`) && res.request().method() === "DELETE",
      { timeout: 10000 }
    );

    // 삭제 버튼 클릭 (title="삭제")
    await row.locator('button[title="삭제"]').click();

    // ConfirmModal에서 "삭제" 버튼 클릭
    await expect(page.locator('button:has-text("삭제")').last()).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("삭제")').last().click();

    // API 응답 검증
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);

    // 삭제 후 목록에서 제거 확인
    await page.waitForTimeout(1000);

    // 전체 목록 재확인
    const afterListRes = await request.get("/api/inquiries", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const afterListData = await afterListRes.json();
    const afterCount = afterListData.inquiries?.length ?? 0;
    expect(afterCount).toBe(listData.inquiries.length - 1);

    console.log("✓ 문의 삭제 완료");
  });
});
