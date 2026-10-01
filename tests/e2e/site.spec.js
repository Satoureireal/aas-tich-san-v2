import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function ready(page) {
  await page.goto("/");
  await expect(page.locator("#planner .video-frame")).toBeVisible();
}
async function contact(page) {
  await page.locator("#contact-name").fill("Nguyễn Kiểm Thử");
  await page.locator("#contact-phone").fill("0901234567");
  await page.locator("#contact-email").fill("test@example.com");
  await page.locator("#contact-submit").click();
}

for (const width of [320, 768, 1024, 1440])
  test(`V2 responsive ${width}px, ảnh và nội dung`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await ready(page);
    await expect(page.locator(".faq-item")).toHaveCount(19);
    await expect(page.locator(".expert-card")).toHaveCount(4);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await page.locator("img").evaluateAll((images) =>
      Promise.all(
        images
          .map(async (img) => {
          img.loading = "eager";
          await img.decode();
        }),
      ),
    );
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `test-results/v2-${width}.png`,
      fullPage: true,
    });
  });

test("Nội dung các section giữ nguyên theo source Excel", async ({ page }) => {
  await ready(page);
  const mismatches = await page.evaluate(async () => {
    const { cells } = await (await fetch("/content.json")).json();
    // So không phân biệt hoa/thường: CSS text-transform chỉ đổi cách hiển thị, không đổi nội dung.
    const normal = (text) => text.replace(/\s+/g, " ").trim().toLocaleLowerCase("vi-VN");
    return [
      ...document.querySelectorAll(
        "h1[data-source],h2[data-source],h3[data-source],h4[data-source],p[data-source],th[data-source],td[data-source],strong[data-source],small[data-source]",
      ),
    ]
      .map((el) => ({ source: el.dataset.source, text: normal(el.innerText) }))
      .filter(
        (item) =>
          item.text && !normal(cells[item.source] || "").includes(item.text),
      );
  });
  expect(mismatches).toEqual([]);
});

test("Quỹ đạo, tháp, tài sản, cổ phiếu và backtest tương tác", async ({
  page,
}) => {
  // Tắt hiệu ứng xuất hiện khi cuộn: chỉ kiểm tra tương tác, không kiểm tra animation.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.locator('[data-orbit-goal="1"]').click();
  await expect(page.locator("#orbit-goal")).toHaveText("Mua xe");
  // Đặc điểm: 4 thẻ cùng kích thước.
  await expect(page.locator(".orbit-feature, .ring-outer")).toHaveCount(0);
  const heights = await page.locator(".feature-card").evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().height)));
  expect(new Set(heights).size).toBe(1);
  // Không còn dấu +; máy có chuột: mô tả chỉ hiện khi rê chuột vào box.
  await expect(page.locator(".feature-card .expand-icon, .feature-toggle")).toHaveCount(0);
  await expect(page.locator("#feature-3 p")).toHaveCSS("opacity", "0");
  await page.locator("#feature-3").hover();
  await expect(page.locator("#feature-3 p")).toHaveCSS("opacity", "1");
  // Bấm vào box cũng mở (dùng cho màn cảm ứng).
  await page.locator("#feature-0").click();
  await expect(page.locator("#feature-0")).toHaveAttribute("aria-expanded", "true");
  await page.mouse.move(5, 5);
  await expect(page.locator("#feature-0 p")).toHaveCSS("opacity", "1");
  await expect(page.locator(".flex-plans-box .plan-card")).toHaveCount(2);
  await expect(page.locator(".plan-goals li")).toHaveCount(6);
  await expect(page.locator(".flex-plans .cta")).toHaveText("XEM CÁCH MAY ĐO DANH MỤC");
  await expect(page.locator(".feature-cta")).toHaveCount(0);
  await expect(page.locator(".why-block")).toHaveCount(2);
  await expect(page.locator(".why-item")).toHaveCount(6);
  await expect(page.locator(".why-reasons")).toHaveCount(0);
  await expect(page.locator(".flex-plans [data-plan-mode]")).toHaveCount(0);
  await expect(page.locator(".orbit-rotation")).toHaveCount(0);
  await expect(page.locator(".asset-card")).toHaveCount(4);
  await expect(page.locator(".asset-card").nth(2)).toContainText("Trái phiếu");
  await page.locator('[data-layer="1"]').click();
  await expect(page.locator("#layer-panel-1")).toContainText(
    "Tactical Asset Allocation",
  );
  // Đường nối của tầng đang chọn chạy từ tháp tới đúng mép trái thẻ của nó.
  await expect(page.locator('[data-link="1"]')).toHaveClass(/is-active/);
  // Đo sau khi các thẻ trượt vào xong (hiệu ứng lặp vô hạn thì bỏ qua).
  await page.locator(".governance").evaluate((node) =>
    Promise.all(
      node
        .getAnimations({ subtree: true })
        .filter((a) => a.effect.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
  const gap = await page.evaluate(() => {
    const tip = document.querySelector('[data-link="1"] .pyr-link-end').getBoundingClientRect();
    const panel = document.querySelector("#layer-panel-1").getBoundingClientRect();
    return [
      Math.abs(tip.x + tip.width / 2 - panel.left),
      Math.abs(tip.y + tip.height / 2 - (panel.top + panel.height / 2)),
    ];
  });
  expect(Math.max(...gap)).toBeLessThan(3);
  // Cổ phiếu tự chuyển theo chu kỳ, nên bấm lại cho tới khi đúng mã CAP.
  await expect(async () => {
    await page.locator('[data-stock="2"]').click();
    await expect(page.locator("#stock-final")).toHaveText("10 tỷ 437tr", { timeout: 1000 });
  }).toPass();
  await expect(async () => {
    await page.locator("#zoom-backtest").click();
    await expect(page.locator("#image-dialog")).toBeVisible({ timeout: 1000 });
  }).toPass();
  await page.keyboard.press("Escape");
  await expect(page.locator("#image-dialog")).not.toBeVisible();
});

test("Thiết kế lộ trình (v2): khung video 16:9 chờ cập nhật và 2 nút bên dưới", async ({ page }) => {
  await ready(page);
  await expect(page.locator("#planner .planner, #planner .pl-tabs")).toHaveCount(0);
  await expect(page.locator("#planner h2")).toHaveText("THIẾT KẾ LỘ TRÌNH ĐẦU TƯ");
  const frame = page.locator("#planner .video-frame");
  await expect(frame).toBeVisible();
  const ratio = await frame.evaluate((box) => box.clientWidth / box.clientHeight);
  expect(ratio).toBeCloseTo(16 / 9, 1);
  await expect(frame.locator(".video-wait")).toContainText("Sắp cập nhật");
  const survey = page.locator("#planner a", { hasText: "HIỂU KHẨU VỊ CỦA TÔI" });
  await expect(survey).toHaveAttribute("href", "https://finhcaas.netlify.app/");
  await expect(survey).toHaveAttribute("target", "_blank");
  await page.locator("#planner [data-book]").click();
  await expect(page.locator("#contact-dialog")).toBeVisible();
});

test("Đặt lịch trực tiếp, khung giờ đúng Excel và lỗi API không báo thành công", async ({
  page,
}) => {
  await ready(page);
  await page.locator(".header-book").click();
  await expect(page.locator("#contact-slot")).toHaveCount(0);
  await expect(page.locator("#contact-intro")).toBeHidden();
  await expect(page.locator("#contact-submit")).toHaveText("NHẬN TƯ VẤN");
  await contact(page);
  await expect(page.locator("#contact-success")).toBeVisible();
  await expect(page.locator("#contact-title")).toHaveText("ĐĂNG KÝ THÀNH CÔNG");
  await expect(page.locator("#contact-success")).toContainText("liên hệ lại với bạn trong thời gian sớm nhất!");
  await page.keyboard.press("Escape");
  await page.route("**/api/requests", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Không thể gửi"}',
    }),
  );
  await page.locator(".header-book").click();
  await contact(page);
  await expect(page.locator("#contact-error")).toHaveText("Không thể gửi");
  await expect(page.locator("#contact-submit")).toBeEnabled();
});

test("Animations chạy liên tục và carousel điều khiển bằng bàn phím", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await ready(page);
  const heroCta = page.locator(".hero .cta").first();
  await expect(heroCta).toHaveClass(/is-visible/);
  expect(
    await heroCta.evaluate(
      (node) => getComputedStyle(node, "::before").animationName,
    ),
  ).toBe("cta-sweep");
  await heroCta.hover();
  expect(
    await heroCta.evaluate(
      (node) => getComputedStyle(node, "::before").animationName,
    ),
  ).toBe("none");
  await page.locator(".orbit-stage").hover({ position: { x: 40, y: 60 } });
  await expect
    .poll(() =>
      page
        .locator(".orbit-stage")
        .evaluate((node) => node.style.getPropertyValue("--tilt-y")),
    )
    .not.toBe("");
  await expect(page.locator("#motion-control")).toHaveCount(0);
  await expect(page.locator("#motion-toggle")).toHaveCount(0);
  await page.locator("#experts-track").focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => page.locator("#experts-track").evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);
  await expect(page.locator('[data-expert-dot="1"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('[data-expert-dot="0"]').click();
  await expect
    .poll(() => page.locator("#experts-track").evaluate((node) => node.scrollLeft))
    .toBeLessThan(5);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
});

test("Accessibility trang chính và form liên hệ", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.evaluate(() => document.fonts.ready);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.locator(".header-book").click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("Bản demo tĩnh (GitHub Pages/Vercel) gửi form mà không gọi API", async ({
  page,
}) => {
  const apiCalls = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) apiCalls.push(request.url());
  });
  await page.goto("/?demo=static");
  await expect(page.locator("#planner .video-frame")).toBeVisible();
  await page.locator(".header-book").click();
  await contact(page);
  await expect(page.locator("#contact-title")).toHaveText("ĐĂNG KÝ THÀNH CÔNG");
  expect(apiCalls).toEqual([]);
});

test("Lưu thông tin liên hệ: lần sau mở form được điền sẵn", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.locator(".header-book").click();
  await contact(page);
  await expect(page.locator("#contact-success")).toBeVisible();
  await page.reload();
  await expect(page.locator("#planner .video-frame")).toBeVisible();
  await page.locator(".header-book").click();
  await expect(page.locator("#contact-name")).toHaveValue("Nguyễn Kiểm Thử");
  await expect(page.locator("#contact-email")).toHaveValue("test@example.com");
});
