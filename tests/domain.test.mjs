import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseCopy } from "../public/copy.js";
import { STRATEGIES, planDeposit, planAlloc, checkDeposit, checkAlloc } from "../public/domain.js";
import { createApp, validateContact } from "../server.mjs";

test("Parse sheet Landing page: đủ các nhóm nội dung V2", async () => {
  const { cells } = JSON.parse(
    await readFile(new URL("../public/content.json", import.meta.url), "utf8"),
  );
  const c = parseCopy(cells);
  assert.equal(c.pain.length, 4);
  assert.ok(c.pain.every(({ title }) => title.endsWith("?")));
  assert.equal(c.features.length, 4);
  assert.deepEqual(c.advantageGroups.map((group) => group.items.length), [3, 3]);
  assert.equal(c.model.assets.length, 4);
  assert.equal(c.model.layers.length, 3);
  assert.equal(c.compound.stocks.length, 4);
  assert.equal(c.steps.length, 5);
  assert.equal(c.survey.title, "THIẾT KẾ LỘ TRÌNH ĐẦU TƯ CỦA BẠN");
  assert.ok(c.survey.intro.startsWith("Tham gia khảo sát sức khỏe tài chính"));
  assert.equal(c.survey.cta, "BẮT ĐẦU KHẢO SÁT");
  assert.ok(c.compound.intro.startsWith("Danh mục được thiết kế"));
  assert.equal(c.experts.length, 4);
  assert.equal(c.faqs.length, 19);
  assert.ok(c.faqs[1][1].includes("200 triệu đồng"));
  assert.ok(c.comparison[2].at(-1).includes("10-15"));
});
test("Bốn chiến lược AAS Gia sản 18/15/12/10%", () => {
  assert.deepEqual(
    Object.entries(STRATEGIES).map(([key, item]) => [key, item.name, item.rate]),
    [["breakthrough", "Bứt phá", 0.18], ["growth", "Tăng trưởng", 0.15], ["balanced", "Cân bằng", 0.12], ["sustainable", "Bền vững", 0.1]],
  );
});
test("Lộ trình Tích sản: PMT 12%/năm (lãi tháng r/12) và điều kiện tham gia", () => {
  const plan = planDeposit({ initial: 200_000_000, target: 5_000_000_000, years: 5 });
  assert.equal(plan.months, 60);
  assert.ok(Math.abs(plan.monthly - 56_775_000) < 10_000, plan.monthly);
  assert.ok(Math.abs(plan.final - 5_000_000_000) < 1);
  assert.ok(Math.abs(plan.capital - (200_000_000 + plan.monthly * 60)) < 1);
  assert.ok(Math.abs(plan.profit - (plan.final - plan.capital)) < 1);
  assert.equal(plan.series.length, 6);
  assert.ok(Math.abs(plan.series.at(-1).value - 5_000_000_000) < 1);
  assert.equal(checkDeposit({ initial: 200_000_000, target: 5_000_000_000, years: 5 }), "");
  assert.match(checkDeposit({ initial: 100_000_000, target: 5_000_000_000, years: 5 }), /200 triệu/);
  assert.match(checkDeposit({ initial: 200_000_000, target: 5_000_000_000, years: 31 }), /1 đến 30 năm/);
  assert.match(checkDeposit({ initial: 1_000_000_000, target: 1_100_000_000, years: 5 }), /không cần nạp thêm/);
});
test("Lộ trình Gia sản: vốn khởi điểm = mục tiêu / (1+i)^n (lãi tháng quy đổi)", () => {
  const plan = planAlloc({ target: 5_000_000_000, years: 5, rate: 0.15 });
  assert.ok(Math.abs(plan.initial - 5_000_000_000 / 1.15 ** 5) < 1);
  assert.ok(Math.abs(plan.profit + plan.initial - 5_000_000_000) < 1);
  assert.ok(Math.abs(plan.series.at(-1).value - 5_000_000_000) < 1);
  assert.equal(checkAlloc({ capital: 3_000_000_000, target: 5_000_000_000, years: 5, rate: 0.15 }), "");
  assert.match(checkAlloc({ capital: 500_000_000, target: 5_000_000_000, years: 5, rate: 0.15 }), /1 tỷ/);
  assert.match(checkAlloc({ capital: 1_000_000_000, target: 1_200_000_000, years: 5, rate: 0.15 }), /dưới 1 tỷ/);
});
test("API tiếp nhận yêu cầu tư vấn và bảo vệ dữ liệu", async () => {
  const base = join(tmpdir(), "opencode");
  await mkdir(base, { recursive: true });
  const dataDir = await mkdtemp(join(base, "aas-v2-api-"));
  const server = createApp({ dataDir });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}`;
  const person = {
    name: "Nguyễn Kiểm Thử",
    email: "test@example.com",
    phone: "0901234567",
  };
  const send = (path, data) =>
    fetch(url + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  try {
    assert.equal(
      (
        await send("/api/requests", {
          ...person,
          kind: "booking",
          slot: "9-11h",
        })
      ).status,
      201,
    );
    assert.equal(
      (
        await send("/api/requests", {
          ...person,
          kind: "booking",
          slot: "night",
        })
      ).status,
      400,
    );
    // Loại yêu cầu cũ (báo cáo mô phỏng) không còn được nhận.
    assert.equal(
      (await send("/api/requests", { ...person, kind: "report" })).status,
      400,
    );
    // Hồ sơ từ công cụ lộ trình: liên hệ + phương án mô phỏng; sai sản phẩm / mục đích bị chặn.
    const plan = { product: "tich-san", goal: "Mua nhà", initial: 200000000, target: 5000000000, years: 5, rate: 0.12, monthly: 56775000 };
    assert.equal((await send("/api/requests", { ...person, kind: "plan", purpose: "survey", plan })).status, 201);
    assert.equal((await send("/api/requests", { ...person, kind: "plan", purpose: "spam", plan })).status, 400);
    assert.equal((await send("/api/requests", { ...person, kind: "plan", purpose: "advice", plan: { ...plan, goal: "<script>" } })).status, 400);
    assert.equal((await send("/api/requests", { ...person, kind: "plan", purpose: "advice", plan: { ...plan, target: "5 tỷ" } })).status, 400);
    assert.equal((await send("/api/register", { id: "x" })).status, 404);
    assert.equal(
      (await send("/api/requests", { ...person, kind: "booking" })).status,
      201,
    );
    const stored = JSON.parse(
      await readFile(join(dataDir, "requests.json"), "utf8"),
    );
    assert.equal(stored.length, 3);
    assert.deepEqual(stored.find((item) => item.kind === "plan").plan, plan);
    assert.equal((await fetch(url + "/api/admin/requests")).status, 401);
    assert.equal((await fetch(url + "/data/requests.json")).status, 404);
    assert.throws(() =>
      validateContact({
        ...person,
        kind: "booking",
        slot: "9-11h",
        email: "no",
      }),
    );
  } finally {
    await new Promise((done) => server.close(done));
    await rm(dataDir, { recursive: true, force: true });
  }
});
