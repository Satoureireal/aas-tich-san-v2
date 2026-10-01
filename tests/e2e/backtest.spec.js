import { test, expect } from "@playwright/test";

const IMAGE = "images/backtest-hieu-suat.png";

test("Backtest là ảnh biểu đồ, có mô tả số liệu và bấm để phóng to", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const image = page.locator("#backtest .backtest-zoom img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute("src", IMAGE);
  await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth)).toBe(3788);
  // Trình đọc màn hình đọc được số liệu dù biểu đồ là ảnh.
  await expect(page.locator("#backtest figcaption")).toContainText("AAS 271,9%");
  await expect(page.locator("#backtest figcaption")).toContainText("FUEVN100 36,2%");
  await expect(page.locator("#backtest .bt-column")).toHaveCount(0);
  await page.locator("#zoom-backtest").click();
  const full = page.locator("#image-dialog .backtest-full");
  await expect(full).toBeVisible();
  await expect(full).toHaveAttribute("alt", /VCBF-BCF 45,7%/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#image-dialog")).not.toBeVisible();
});

test("Mobile: biểu đồ thanh ngang đọc được, đúng tỷ lệ, không cuộn ngang, mở được ảnh gốc", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await expect(page.locator("#backtest .backtest-zoom")).toBeHidden();
  const chart = page.locator("#backtest .backtest-mobile");
  await expect(chart).toBeVisible();
  await expect(chart.locator(".btm-bars li")).toHaveCount(13);
  await expect(chart.locator(".is-aas b")).toHaveText("271.9%");
  const ratio = await chart.locator(".is-aas .btm-track").evaluate(
    (track) => track.firstElementChild.getBoundingClientRect().width / track.getBoundingClientRect().width,
  );
  expect(ratio).toBeCloseTo(271.9 / 300, 2);
  const fontSize = await chart.locator(".btm-name").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  // Nút có thể đang trong hiệu ứng xuất hiện: bấm lại tới khi popup mở (như test zoom ở site.spec).
  await expect(async () => {
    await chart.locator(".btm-zoom").click();
    await expect(page.locator("#image-dialog .backtest-full")).toBeVisible({ timeout: 1000 });
  }).toPass();
});
