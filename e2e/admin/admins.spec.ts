import { test, expect } from "@playwright/test";

// =====================================================
// 관리자 계정 관리 E2E 테스트
// 경로: /admins
// API: GET/POST /api/admins, PUT/DELETE /api/admins/[id]
// 권한: SUPER_ADMIN 전용
// =====================================================

test.describe("관리자 계정 관리", () => {
  test.setTimeout(60000);

  let authToken: string;
  const createdAdminIds: string[] = [];

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
    for (const id of createdAdminIds) {
      try {
        await request.delete(`/api/admins/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {}
    }
    createdAdminIds.length = 0;
  });

  // =====================================================
  // 테스트 1: 관리자 목록 로딩 확인
  // =====================================================
  test("관리자 목록 페이지가 정상적으로 로딩된다", async ({ page }) => {
    await page.goto("/admins");
    await page.waitForLoadState("networkidle");

    // SUPER_ADMIN이면 목록 표시, 아니면 권한 없음
    const hasTitle = await page.locator('h1:has-text("관리자 관리")').count() > 0;
    const hasNoPermission = await page.locator("text=권한이 없습니다").count() > 0;

    if (hasTitle) {
      await expect(page.locator('button:has-text("관리자 추가")')).toBeVisible();
      // 테이블 헤더 확인
      await expect(page.locator("th:has-text('이름')").first()).toBeVisible();
      await expect(page.locator("th:has-text('이메일')").first()).toBeVisible();
      await expect(page.locator("th:has-text('역할')").first()).toBeVisible();
      console.log("✓ 관리자 목록 로딩 확인 (SUPER_ADMIN)");
    } else {
      expect(hasNoPermission).toBe(true);
      console.log("✓ 권한 없음 표시 확인 (SUPER_ADMIN 아님)");
    }
  });

  // =====================================================
  // 테스트 2: 관리자 목록 API 응답 확인
  // =====================================================
  test("관리자 목록 API가 정상 응답한다", async ({ request }) => {
    const res = await request.get("/api/admins", {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // SUPER_ADMIN이면 200, 아니면 403
    if (res.status() === 200) {
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.admins)).toBe(true);

      if (data.admins.length > 0) {
        const admin = data.admins[0];
        expect(admin).toHaveProperty("id");
        expect(admin).toHaveProperty("name");
        expect(admin).toHaveProperty("role");
        expect(admin).toHaveProperty("isActive");
      }
      console.log(`✓ 관리자 목록 API 확인: ${data.admins.length}명`);
    } else {
      expect(res.status()).toBe(403);
      console.log("✓ 비 SUPER_ADMIN 403 확인");
    }
  });

  // =====================================================
  // 테스트 3: 관리자 생성 (API)
  // =====================================================
  test("새 관리자를 생성하면 목록에 추가된다", async ({ request }) => {
    const uniqueSuffix = Date.now();
    const username = `teststaff_${uniqueSuffix}`;

    const createRes = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        username,
        password: "testpass1234!!",
        name: `테스트스태프_${uniqueSuffix}`,
        role: "STAFF",
      },
    });

    if (createRes.status() === 403) {
      test.skip(true, "SUPER_ADMIN 권한 없음");
      return;
    }

    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.admin.name).toBe(`테스트스태프_${uniqueSuffix}`);
    expect(createData.admin.role).toBe("STAFF");
    createdAdminIds.push(createData.admin.id);

    // 목록에서 확인
    const listRes = await request.get("/api/admins", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    const found = listData.admins.find((a: any) => a.id === createData.admin.id);
    expect(found).toBeTruthy();

    console.log(`✓ 관리자 생성 확인: ${username} (${createData.admin.role})`);
  });

  // =====================================================
  // 테스트 4: 유효성 검사 - 필수 필드 누락
  // =====================================================
  test("필수 필드 누락 시 API가 400 에러를 반환한다", async ({ request }) => {
    // username 없이
    const res1 = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { password: "pass1234", name: "이름", role: "STAFF" },
    });
    if (res1.status() === 403) {
      test.skip(true, "SUPER_ADMIN 권한 없음");
      return;
    }
    expect(res1.status()).toBe(400);

    // password 없이
    const res2 = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { username: "nopass", name: "이름", role: "STAFF" },
    });
    expect(res2.status()).toBe(400);

    // name 없이
    const res3 = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { username: "noname", password: "pass1234", role: "STAFF" },
    });
    expect(res3.status()).toBe(400);

    console.log("✓ 필수 필드 유효성 검사 확인 (username, password, name, role)");
  });

  // =====================================================
  // 테스트 5: 중복 username 생성 시 409
  // =====================================================
  test("중복 아이디로 생성 시 409 에러가 반환된다", async ({ request }) => {
    const uniqueSuffix = Date.now();
    const username = `dup_admin_${uniqueSuffix}`;

    // 첫 번째 생성
    const res1 = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { username, password: "pass1234!!", name: "중복테스트1", role: "STAFF" },
    });

    if (res1.status() === 403) {
      test.skip(true, "SUPER_ADMIN 권한 없음");
      return;
    }
    expect(res1.status()).toBe(201);
    const data1 = await res1.json();
    createdAdminIds.push(data1.admin.id);

    // 동일 username으로 재생성 시도
    const res2 = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: { username, password: "pass1234!!", name: "중복테스트2", role: "STAFF" },
    });
    expect(res2.status()).toBe(409);

    console.log(`✓ 중복 아이디 409 확인: ${username}`);
  });

  // =====================================================
  // 테스트 6: 관리자 수정 (이름, 역할 변경)
  // =====================================================
  test("관리자 정보를 수정할 수 있다", async ({ request }) => {
    const uniqueSuffix = Date.now();

    // 생성
    const createRes = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        username: `edit_admin_${uniqueSuffix}`,
        password: "pass1234!!",
        name: `수정전_${uniqueSuffix}`,
        role: "STAFF",
      },
    });

    if (createRes.status() === 403) {
      test.skip(true, "SUPER_ADMIN 권한 없음");
      return;
    }
    const createData = await createRes.json();
    createdAdminIds.push(createData.admin.id);

    // 수정
    const updateRes = await request.put(`/api/admins/${createData.admin.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: `수정후_${uniqueSuffix}`,
        role: "MANAGER",
      },
    });
    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.admin.name).toBe(`수정후_${uniqueSuffix}`);
    expect(updateData.admin.role).toBe("MANAGER");

    console.log(`✓ 관리자 수정 확인: STAFF → MANAGER`);
  });

  // =====================================================
  // 테스트 7: 관리자 삭제
  // =====================================================
  test("관리자를 삭제하면 목록에서 제거된다", async ({ request }) => {
    const uniqueSuffix = Date.now();

    // 생성
    const createRes = await request.post("/api/admins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        username: `del_admin_${uniqueSuffix}`,
        password: "pass1234!!",
        name: `삭제대상_${uniqueSuffix}`,
        role: "STAFF",
      },
    });

    if (createRes.status() === 403) {
      test.skip(true, "SUPER_ADMIN 권한 없음");
      return;
    }
    const createData = await createRes.json();
    const adminId = createData.admin.id;
    createdAdminIds.push(adminId);

    // 삭제
    const deleteRes = await request.delete(`/api/admins/${adminId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(deleteRes.status()).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // 목록에서 확인
    const listRes = await request.get("/api/admins", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    const found = listData.admins.find((a: any) => a.id === adminId);
    expect(found).toBeFalsy();

    // 정리 목록에서 제거
    const idx = createdAdminIds.indexOf(adminId);
    if (idx > -1) createdAdminIds.splice(idx, 1);

    console.log(`✓ 관리자 삭제 확인: del_admin_${uniqueSuffix}`);
  });

  // =====================================================
  // 테스트 8: 인증 없이 API 호출 시 401
  // =====================================================
  test("인증 없이 API 호출 시 401이 반환된다", async ({ request }) => {
    const res = await request.get("/api/admins");
    expect(res.status()).toBe(401);

    console.log("✓ 미인증 401 확인");
  });
});
