import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const read = (path) => readFile(new URL(`../public/${path}`, import.meta.url), "utf8");

test("Prerender SEO: HTML dựng sẵn đủ section, JSON-LD FAQ hợp lệ, robots + sitemap", async () => {
  execFileSync(process.execPath, [fileURLToPath(new URL("../scripts/prerender.mjs", import.meta.url))]);
  const html = await read("index.html");
  assert.match(html, /<main id="main" data-prerendered>/);
  for (const id of ["solution", "advantages", "model", "backtest", "comparison", "compound", "steps", "planner", "experts", "faq"])
    assert.ok(html.includes(`<section id="${id}"`), `thiếu section #${id}`);
  assert.equal(html.match(/<!-- seo:start/g).length, 1);
  assert.equal(html.match(/<meta name="description"/g).length, 1);
  assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+\/" \/>/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const faq = ld.find((item) => item["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, 19);
  assert.ok(faq.mainEntity.every((q) => q.name && q.acceptedAnswer.text));
  assert.match(await read("robots.txt"), /Sitemap: https:\/\/.+\/sitemap\.xml/);
  assert.match(await read("sitemap.xml"), /<loc>https:\/\/.+\/<\/loc>/);
});
