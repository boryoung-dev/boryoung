import { test, expect } from "@playwright/test";
import blogPosts from "../fixtures/blog-posts.json";

test.describe("블로그 글 10개 업로드", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("admin@boryoung.com");
    await page.locator('input[type="password"]').fill("admin1234");
    await page.locator('button:has-text("로그인")').click();

    // 로그인 후 대시보드 이동 대기
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("블로그 글 10개를 순차적으로 작성하고 목록에서 확인한다", async ({
    page,
  }) => {
    // 블로그 관리 페이지로 이동
    await page.goto("/blog-posts");
    await page.waitForLoadState("networkidle");

    for (let i = 0; i < blogPosts.length; i++) {
      const post = blogPosts[i];

      // "글 작성" 버튼 클릭
      await page.locator('button:has-text("글 작성")').click();

      // 모달이 열릴 때까지 대기
      const modal = page.locator(".fixed.inset-0");
      await modal.waitFor({ state: "visible" });

      // 제목 입력
      await modal.locator('input[type="text"]').fill(post.title);

      // 카테고리 선택 - 커스텀 Select 드롭다운
      // Select 트리거 버튼 클릭 (ChevronDown 아이콘이 있는 버튼)
      const selectTrigger = modal.locator(".relative.inline-block button").first();
      await selectTrigger.click();

      // 드롭다운 옵션에서 카테고리 선택
      await page.locator(`ul li button:has-text("${post.category}")`).click();

      // 발췌 입력 (첫 번째 textarea)
      await modal.locator("textarea").nth(0).fill(post.excerpt);

      // 본문 입력 (두 번째 textarea)
      await modal.locator("textarea").nth(1).fill(post.content);

      // 발행 체크박스 체크
      if (post.isPublished) {
        await modal.locator("#isPublished").check();
      }

      // "작성" 버튼 클릭
      await modal.locator('button[type="submit"]:has-text("작성")').click();

      // 모달이 닫힐 때까지 대기
      await modal.waitFor({ state: "hidden", timeout: 10000 });

      // 목록에 새 글이 표시되는지 확인
      await expect(page.locator(`text="${post.title}"`).first()).toBeVisible({
        timeout: 5000,
      });

      // 다음 글 작성 전 잠시 대기 (API 안정화)
      await page.waitForTimeout(500);
    }

    // 최종 검증: 테이블에 최소 10개 글이 표시되는지 확인 (기존 글이 있을 수 있음)
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(blogPosts.length);

    // 각 글의 제목이 모두 목록에 있는지 확인
    for (const post of blogPosts) {
      await expect(page.locator(`text="${post.title}"`).first()).toBeVisible();
    }
  });
});
