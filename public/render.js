import { copy, cta, coin, escape, arrow } from "./ui.js";
import { STRATEGIES } from "./domain.js";
import { painArt, painOverlay } from "./pain-art.js";

// Icon nét cho 5 mục tiêu (cùng phong cách icon 04 lớp tài sản): nhà, ô tô, tên lửa, hoàng hôn trên biển, mũ tốt nghiệp.
const goalIcons = [
  ['<path class="fill" d="M12 22 24 12l12 10v16H12z"/><path d="M8 24 24 11l16 13"/><path d="M12 21v17h24V21"/><path d="M20 38v-9h8v9"/><path d="M31 15v-3h3v6"/>', "#203567"],
  ['<path class="fill" d="M9 30v-6l4-8h19l6 8h2v6z"/><path d="M8 30v-6l5-8h19l6 8h2a2 2 0 0 1 2 2v4h-3"/><path d="M8 30h4M20 30h9"/><circle cx="16" cy="31" r="4"/><circle cx="33" cy="31" r="4"/><path d="M14 23h23M24 16v7"/>', "#203567"],
  ['<path class="fill" d="M24 7c6 4 8 11 8 18l-3 6H19l-3-6c0-7 2-14 8-18z"/><path d="M24 7c6 4 8 11 8 18l-3 6H19l-3-6c0-7 2-14 8-18z"/><circle cx="24" cy="19" r="3.5"/><path d="M16 25l-5 5v5l6-3M32 25l5 5v5l-6-3"/><path d="M21 35l3 6 3-6"/>', "#203567"],
  ['<path class="fill" d="M15 27a9 9 0 0 1 18 0z"/><path d="M15 27a9 9 0 0 1 18 0"/><path d="M24 10v4M12.7 14.7l2.8 2.8M35.3 14.7l-2.8 2.8M7 27h4M37 27h4"/><path d="M7 32h34M12 37h24"/>', "#203567"],
  ['<path class="fill" d="M24 11 7 19l17 8 17-8z"/><path d="M24 11 7 19l17 8 17-8z"/><path d="M13 22v9c0 3 5 5 11 5s11-2 11-5v-9"/><path d="M41 19v10"/><circle cx="41" cy="31" r="1.5"/>', "#203567"],
  ['<path d="M8 40h32"/><path class="fill" d="M13 40 22 22l6 9 4-5 6 14z"/><path d="M13 40 22 22l6 9 4-5 6 14"/><path d="M24 22V8"/><path class="fill" d="M24 8h11l-3 4 3 4H24z"/><path d="M24 8h11l-3 4 3 4H24"/>', "#203567"],
];
const goalNames = ["Mua nhà", "Mua xe", "Khởi nghiệp", "Hưu trí", "Du học"];
// Ảnh chuyên gia theo tên trong ô D17: images/chuyen-gia-<tên-không-dấu>.webp, vd "Ông Lê Quang Chung" → chuyen-gia-le-quang-chung.webp.
// Có ảnh mới thì chép file đúng tên vào images/ và thêm tên vào PORTRAITS; ai chưa có ảnh thì hiện chữ viết tắt.
const PORTRAITS = new Set(["ngo-thuy-linh", "tran-minh-tuan", "vu-duy-khanh", "tran-thanh-mai", "hoang-anh-nhat"]);
const portraitSlug = (name) =>
  name
    .replace(/^(Ông|Bà|TS\.|ThS\.|PGS\.)\s+/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
const initials = (name) =>
  name
    .replace(/^(Ông|Bà|TS\.|ThS\.|PGS\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase("vi-VN");
const heading = (title, source, intro = "") =>
  `<div class="section-heading reveal">${copy("h2", title, source)}${intro ? copy("p", intro, source, "lead") : ""}</div>`;
// Navy medallion with a double gold rim and a faceted diamond in gold line art.
const emblem = () =>
  `<span class="bridge-emblem" aria-hidden="true"><svg viewBox="0 0 96 96"><defs><linearGradient id="emblem-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3edfc"/><stop offset=".45" stop-color="#7fa6e0"/><stop offset=".7" stop-color="#c4d7f5"/><stop offset="1" stop-color="#3f70bf"/></linearGradient><radialGradient id="emblem-navy" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#34508a"/><stop offset="1" stop-color="#101f42"/></radialGradient></defs><circle cx="48" cy="48" r="45" fill="url(#emblem-navy)" stroke="url(#emblem-gold)" stroke-width="2.5"/><circle cx="48" cy="48" r="38.5" fill="none" stroke="url(#emblem-gold)" stroke-width=".9" stroke-dasharray="1.5 2.6" opacity=".85"/><g fill="none" stroke="url(#emblem-gold)" stroke-width="2" stroke-linejoin="round"><path d="M33 40h30l-15 22z" fill="#7fa6e026"/><path d="M33 40l6-8h18l6 8"/><path d="M39 32l3 8 6-8 6 8 3-8M42 40l6 22 6-22"/></g><path d="M69 25l1.4 3.6L74 30l-3.6 1.4L69 35l-1.4-3.6L64 30l3.6-1.4z" fill="#e3edfc"/></svg></span>`;
// Line icons for the asset classes: ETF (basket pie), stocks (candles), bonds (issuer), valuable papers (certificate).
const assetIcons = [
  ['<circle cx="24" cy="24" r="16"/><path class="fill" d="M24 8a16 16 0 0 1 16 16H24z"/><path d="M24 24V8M24 24h16M24 24 12.7 35.3M24 24l4 15.5"/><circle cx="24" cy="24" r="6.5"/>', "#9cc4f0"],
  ['<path d="M6 42h36"/><path d="M13 16v20M23 10v22M33 6v18"/><rect x="10" y="21" width="6" height="10" rx="1.5"/><rect class="fill" x="20" y="14" width="6" height="12" rx="1.5"/><rect x="30" y="9" width="6" height="10" rx="1.5"/><path d="m36 30 6-6m-5 0h5v5"/>', "#b6dc89"],
  ['<path class="fill" d="M7 17 24 7l17 10z"/><path d="M7 17 24 7l17 10H7z"/><path d="M12 21v15M20 21v15M28 21v15M36 21v15M8 38h32M6 42h36"/><circle cx="24" cy="13.5" r="1.6"/>', "#e7cf92"],
  ['<rect x="7" y="8" width="34" height="25" rx="3"/><path d="M13 16h16M13 22h11M13 27h7"/><circle class="fill" cx="34" cy="31" r="6"/><circle cx="34" cy="31" r="6"/><path d="m31 36.5-2 7.5 5-2.8 5 2.8-2-7.5"/>', "#8fd6c0"],
];
// Icons for the governance tiers: strategy (compass), tactics (sliders), analytics (magnifier on a chart).
const layerIcons = [
  ['<circle cx="24" cy="24" r="16"/><path class="fill" d="m29.5 18.5-3.4 7.6-7.6 3.4 3.4-7.6z"/><path d="m29.5 18.5-3.4 7.6-7.6 3.4 3.4-7.6z"/><path d="M24 8v3M24 37v3M8 24h3M37 24h3"/>', "#b6dc89"],
  ['<path d="M10 14h28M10 24h28M10 34h28"/><circle class="fill" cx="30" cy="14" r="3.5"/><circle cx="30" cy="14" r="3.5"/><circle class="fill" cx="17" cy="24" r="3.5"/><circle cx="17" cy="24" r="3.5"/><circle class="fill" cx="26" cy="34" r="3.5"/><circle cx="26" cy="34" r="3.5"/>', "#9cc4f0"],
  ['<path d="M8 38V10M8 38h30"/><path d="m13 31 6-7 5 4 7-9"/><circle class="fill" cx="32" cy="26" r="7"/><circle cx="32" cy="26" r="7"/><path d="m37 31 5 5"/>', "#e7cf92"],
];
// Kim tự tháp 3D bằng SVG: 2 mặt (trái sáng, phải tối), 3 tầng cắt ngang theo chiều cao.
const PYRAMID = { apex: [200, 26], left: [26, 318], front: [220, 374], right: [376, 306] };
const TIER_RANGES = [[0, 0.31], [0.345, 0.655], [0.69, 1]];
const TIER_COLORS = [
  ["#efffc2", "#b9e44a", "#6a9e22"],
  ["#eaf4ff", "#9cc8f5", "#4a82c4"],
  ["#fdeebf", "#e9c465", "#a67a26"],
];
const along = (to, t) => PYRAMID.apex.map((value, k) => value + (to[k] - value) * t);
const points = (list) => list.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
const path = (list) => "M" + list.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L");
// Vùng bấm của từng tầng, tính theo % khung 400×400.
const tierBox = ([t0, t1]) => {
  const top = Math.min(along(PYRAMID.right, t0)[1], along(PYRAMID.left, t0)[1]);
  const bottom = along(PYRAMID.front, t1)[1];
  const left = along(PYRAMID.left, t1)[0];
  const right = along(PYRAMID.right, t1)[0];
  return `top:${top / 4}%;height:${(bottom - top) / 4}%;left:${left / 4}%;width:${(right - left) / 4}%`;
};
function pyramidSvg(layers) {
  const { left: L, front: F, right: R } = PYRAMID;
  const tiers = layers.map((layer, i) => {
    const [t0, t1] = TIER_RANGES[i];
    const [light, mid, dark] = TIER_COLORS[i];
    const leftFace = [along(L, t0), along(F, t0), along(F, t1), along(L, t1)];
    const rightFace = [along(F, t0), along(R, t0), along(R, t1), along(F, t1)];
    const shine = [leftFace[3], leftFace[0], rightFace[1], rightFace[2], rightFace[3]];
    // Điểm neo của đường nối tới thẻ: giữa mặt phải (thẻ bên phải) và giữa mặt trái (thẻ bên dưới, mobile).
    const t = t0 + (t1 - t0) * 0.6;
    const mixPoint = (a, b, k) => a.map((v, n) => (v + (b[n] - v) * k).toFixed(1)).join(",");
    const anchors = `data-anchor-right="${mixPoint(along(F, t), along(R, t), 0.5)}" data-anchor-left="${mixPoint(along(L, t), along(F, t), 0.5)}"`;
    return `<g class="pyr-tier pyr-tier-${i}${i === 0 ? " is-active" : ""}" style="--order:${layers.length - 1 - i}" ${anchors}><defs><linearGradient id="pyr-l${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></linearGradient><linearGradient id="pyr-r${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><polygon points="${points(leftFace)}" fill="url(#pyr-l${i})"/><polygon points="${points(rightFace)}" fill="url(#pyr-r${i})"/><polygon class="pyr-shine" points="${points(shine)}"/><path class="pyr-edge" d="${path([along(L, t0), along(F, t0), along(R, t0)])}"/><path class="pyr-ridge" d="${path([along(F, t0), along(F, t1)])}"/></g>`;
  }).join("");
  return `<svg class="pyramid-svg" viewBox="0 0 400 400" aria-hidden="true"><defs><radialGradient id="pyr-halo"><stop offset="0" stop-color="#b6dc89" stop-opacity=".35"/><stop offset="1" stop-color="#b6dc89" stop-opacity="0"/></radialGradient><filter id="pyr-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs><circle class="pyr-halo" cx="200" cy="205" r="185" fill="url(#pyr-halo)"/><ellipse cx="210" cy="372" rx="176" ry="18" fill="#07162d" opacity=".55" filter="url(#pyr-blur)"/>${tiers}<path class="pyr-star" d="M200 4l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></svg>`;
}
// Icon 3 yếu tố lãi kép: bổ sung vốn (chồng xu), tái đầu tư (vòng quay), thời gian (đồng hồ cát).
const compoundIcons = [
  ['<ellipse class="fill" cx="20" cy="15" rx="11" ry="4"/><ellipse cx="20" cy="15" rx="11" ry="4"/><path d="M9 15v18c0 2.2 4.9 4 11 4s11-1.8 11-4V15"/><path d="M9 21c0 2.2 4.9 4 11 4s11-1.8 11-4M9 27c0 2.2 4.9 4 11 4s11-1.8 11-4"/><path d="M38 9v10M33 14h10"/>', "#b6dc89"],
  ['<path d="M38 20a15 15 0 0 0-27-6"/><path d="M11 6v8h8"/><path d="M10 28a15 15 0 0 0 27 6"/><path d="M37 42v-8h-8"/><circle class="fill" cx="24" cy="24" r="5"/><circle cx="24" cy="24" r="5"/>', "#9cc4f0"],
  ['<path d="M14 8h20M14 40h20"/><path d="M16 8c0 9 16 9 16 16s-16 7-16 16"/><path d="M32 8c0 9-16 9-16 16s16 7 16 16"/><path class="fill" d="M18 38c2-5 10-5 12 0z"/>', "#e7cf92"],
];
// Minh hoạ lãi kép: 8 cột tăng theo cấp số nhân và đường cong nối đỉnh cột.
// Minh hoạ lãi kép: cột chồng 10 năm — phần navy là vốn góp đều mỗi năm, phần xanh nhạt là lợi nhuận
// được tái đầu tư. Chỉ minh hoạ hình dạng (giả định lợi suất cố định 12%/năm), không in con số.
function compoundArt() {
  const rate = 0.12;
  const years = Array.from({ length: 10 }, (_, i) => {
    const capital = i + 1;
    const total = Array.from({ length: capital }, (_, k) => (1 + rate) ** (k + 1)).reduce((sum, v) => sum + v, 0);
    return { capital, gain: total - capital };
  });
  const max = years.at(-1).capital + years.at(-1).gain;
  const pct = (value) => `${((value / max) * 100).toFixed(1)}%`;
  const cols = years.map(({ capital, gain }, i) => `<div class="cc-col" style="--i:${i}"><div class="cc-stack"><span class="cc-gain" style="height:${pct(gain)}"></span><span class="cc-cap" style="height:${pct(capital)}"></span></div><small>${i + 1}</small></div>`).join("");
  return `<figure class="compound-art reveal"><figcaption class="cc-head"><strong>Tài sản tích lũy theo thời gian</strong><span>Góp vốn đều mỗi năm, lợi nhuận được tái đầu tư</span></figcaption><p class="sr-only">Minh họa: phần vốn góp tăng đều mỗi năm, phần lợi nhuận tái đầu tư lớn dần theo thời gian và gần bằng vốn góp vào năm thứ 10.</p><div class="cc-plot" aria-hidden="true">${cols}</div><p class="cc-axis" aria-hidden="true">Năm đầu tư</p><ul class="cc-legend" aria-hidden="true"><li class="is-cap">Vốn góp</li><li class="is-gain">Lợi nhuận tái đầu tư</li></ul><p class="cc-note">Hình minh họa khái niệm với lợi suất giả định cố định, không phải cam kết lợi nhuận.</p></figure>`;
}
const orb = () => `<div class="orbital-light" aria-hidden="true"></div>`;

function hero(c) {
  return `<section class="hero hero-banner" id="top"><div class="hero-media" aria-hidden="true"></div><h1 class="sr-only" data-source="D7">TÍCH SẢN CÓ ĐÍCH</h1><div class="wrap hero-grid"><div class="actions">${cta(c.heroCta, "#planner", "E7")}${cta(c.secondaryCta, "#solution", "E7", "cta-quiet")}</div></div></section>`;
}

// 4 nỗi đau phổ biến: tiêu đề (2 chữ cuối tô màu), 4 thẻ có số + minh hoạ người.
// Ảnh người: images/noi-dau-01.webp … noi-dau-04.webp (vuông 800×800, nền trong suốt); thiếu file nào thì thẻ đó hiện hình vẽ SVG.
function pain(c) {
  const words = c.painTitle.split(" ");
  const title = `${escape(words.slice(0, -2).join(" "))} <span class="pain-accent">${escape(words.slice(-2).join(" "))}</span>`;
  const cards = c.pain
    .map(
      (item, i) =>
        `<article class="pain-card reveal" style="--i:${i}"><div class="pain-card-head"><span class="pain-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div>${copy("h3", item.title, "D8")}${item.body ? copy("p", item.body, "D8") : ""}</div></div><div class="pain-visual">${painArt(i)}<img class="pain-photo" src="images/noi-dau-${String(i + 1).padStart(2, "0")}.webp" alt="" width="800" height="800" decoding="async">${painOverlay(i)}</div></article>`,
    )
    .join("");
  return `<section id="pain" class="section pain-section loop-zone"><div class="wrap"><div class="section-heading reveal"><h2 data-source="D8">${title}</h2></div><div class="pain-grid">${cards}</div><div class="bridge reveal">${emblem()}${copy("p", c.bridge, "D9")}</div></div></section>`;
}

// Các cụm được in đậm trong phần mô tả giải pháp.
const SOLUTION_BOLD = ["AAS Tích sản", "AAS Gia sản"];
// Hình thức đầu tư linh hoạt: nội dung khối dưới quỹ đạo mục tiêu (sửa chữ tại đây).
const FLEX_PLANS = {
  title: "HÌNH THỨC ĐẦU TƯ LINH HOẠT",
  monthly: {
    name: "AAS TÍCH SẢN",
    text: "Nạp định kỳ hàng tháng để hướng tới những mục tiêu tài chính cụ thể.",
    goals: [["Mua nhà", 0], ["Mua xe", 1], ["Du học", 4], ["Khởi nghiệp", 2], ["Hưu trí", 3], ["Mục tiêu khác", 5]],
  },
  allocation: {
    name: "AAS GIA SẢN",
    text: "Đầu tư một lần với nguồn vốn sẵn có, lựa chọn chiến lược phù hợp với mục tiêu và khẩu vị rủi ro.",
    // Thứ tự hiển thị 4 chiến lược (tên + lợi suất lấy từ STRATEGIES trong domain.js).
    strategies: [
      ["breakthrough", "<path class=\"fill\" d=\"M24 6c6 4 9 11 9 18l-4 7H19l-4-7c0-7 3-14 9-18z\"/><path d=\"M24 6c6 4 9 11 9 18l-4 7H19l-4-7c0-7 3-14 9-18z\"/><circle cx=\"24\" cy=\"19\" r=\"3.5\"/><path d=\"M19 31l-5 6 6-1M29 31l5 6-6-1M22 36l2 6 2-6\"/>", "#203567"],
      ["growth", "<path d=\"M8 38h32\"/><path class=\"fill\" d=\"M10 34l9-9 7 5 12-14v18H10z\"/><path d=\"m10 34 9-9 7 5 12-14\"/><path d=\"M32 16h6v6\"/>", "#203567"],
      ["balanced", "<path d=\"M24 8v32M14 40h20\"/><path d=\"M10 14h28\"/><path class=\"fill\" d=\"M10 14 5 26h10z\"/><path d=\"M10 14 5 26h10zM38 14l-5 12h10z\"/><path class=\"fill\" d=\"M38 14l-5 12h10z\"/>", "#203567"],
      ["sustainable", "<path class=\"fill\" d=\"M24 7 38 12v10c0 9-6 16-14 19-8-3-14-10-14-19V12z\"/><path d=\"M24 7 38 12v10c0 9-6 16-14 19-8-3-14-10-14-19V12z\"/><path d=\"m18 24 4 4 8-8\"/>", "#203567"],
    ],
  },
};
function boldPhrases(text) {
  let html = escape(text);
  for (const phrase of SOLUTION_BOLD) html = html.replace(escape(phrase), `<strong>${escape(phrase)}</strong>`);
  return html;
}
function flexPlans(c) {
  const { monthly, allocation } = FLEX_PLANS;
  // Ảnh minh hoạ mục tiêu: images/muc-tieu-01.webp … 06.webp (vuông 520×520, theo thứ tự goals), khung bo góc.
  const goals = monthly.goals
    .map(([name], i) => `<li><span class="plan-goal-photo"><img src="images/muc-tieu-0${i + 1}.webp" alt="" width="520" height="520" loading="lazy" decoding="async"></span><span class="plan-goal-name">${name}</span></li>`)
    .join("");
  const strategies = allocation.strategies
    .map(([key, icon, accent]) => `<li style="--accent:${accent}"><span class="goal-icon" aria-hidden="true"><svg viewBox="4 4 40 40">${icon}</svg></span><div><strong>${STRATEGIES[key].name.toLocaleUpperCase("vi-VN")}</strong><span class="plan-strategy-rate">Kỳ vọng lợi suất: <b>${STRATEGIES[key].rate * 100}%/năm</b></span></div></li>`)
    .join("");
  return `<div class="flex-plans reveal"><h3 class="flex-plans-title">${FLEX_PLANS.title}</h3><div class="flex-plans-box"><article class="plan-card"><span class="plan-card-number" aria-hidden="true">01</span><h4>${monthly.name}</h4><p>${monthly.text}</p><ul class="plan-goals">${goals}</ul></article><article class="plan-card"><span class="plan-card-number" aria-hidden="true">02</span><h4>${allocation.name}</h4><p>${allocation.text}</p><ul class="plan-strategies">${strategies}</ul></article></div><div class="center">${cta(c.cells.E10.trim(), "#planner", "E10")}</div></div>`;
}
function solution(c) {
  const at = (degrees, radius) => {
    const angle = degrees * (Math.PI / 180);
    return `--x:${(50 + radius * Math.cos(angle)).toFixed(2)}%;--y:${(50 + radius * Math.sin(angle)).toFixed(2)}%`;
  };
  // Quỹ đạo chỉ còn các mục tiêu xoay quanh tâm (không viền ngoài, không chấm đặc điểm).
  const half = Math.ceil(c.features.length / 2);
  const goals = goalNames.map((name, i) => `<button class="orbit-goal" data-orbit-goal="${i}" style="${at(-90 + i * 72, 34)};--accent:${goalIcons[i][1]}" aria-pressed="false"><span class="orbit-upright"><span class="goal-icon" aria-hidden="true"><svg viewBox="4 4 40 40">${goalIcons[i][0]}</svg></span><span>${name}</span></span></button>`).join("");
  // Thẻ đặc điểm cùng kích thước: chỉ hiện số + tiêu đề; rê chuột hoặc bấm/chạm vào box mới hiện mô tả.
  const card = (f, i) => `<article class="feature-card" id="feature-${i}" data-feature-card="${i}" style="--step:${i}" tabindex="0" role="button" aria-expanded="false"><span class="feature-number" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div class="feature-copy">${copy("h3", f.title, "D10")}${copy("p", f.body, "D10")}</div></article>`;
  const intro = `<div class="solution-intro reveal">${copy("h2", c.solutionTitle, "D10", "solution-title")}${c.solutionIntro.map((line) => `<p data-source="D10">${boldPhrases(line)}</p>`).join("")}</div>`;
  return `<section id="solution" class="section solution-section loop-zone has-brand-deco">${brandDeco([["band", "tl"], ["coins", "mr"]])}<div class="wrap">${intro}<div class="solution-grid"><div class="feature-col feature-col-left">${c.features.slice(0, half).map((f, i) => card(f, i)).join("")}</div><div class="orbit-stage tilt-surface" data-tilt role="group" aria-label="Các mục tiêu tài chính"><div class="orbit-system"><div class="orbit-ring ring-inner"></div><div class="orbit-track track-goals">${goals}</div></div><div class="orbit-center"><svg class="orbit-target" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26"/><circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="8"/><path d="M32 32 52 12M46 10h7v7"/></svg><span class="goal-icon orbit-icon" id="orbit-image" aria-hidden="true" hidden><svg viewBox="4 4 40 40"></svg></span><strong id="orbit-goal">Mục tiêu tài chính</strong></div></div><div class="feature-col feature-col-right">${c.features.slice(half).map((f, i) => card(f, i + half)).join("")}</div></div>${flexPlans(c)}</div></section>`;
}

// Hoạ tiết nhận diện AAS (nét mảnh, chỉ trang trí — aria-hidden):
// - band: chuỗi chữ "A" lồng nhau theo tín hiệu nhận diện, có vệt sáng chạy dọc nét (motion.css);
// - coin / coins: mặt đồng xu và chồng xu.
// Mỗi section chọn hoạ tiết và vị trí (slot) qua brandDeco([[loại, slot], …]).
const A_PATH = (x) => `M${x} 156L${x + 70} 0H${x + 105}L${x + 175} 156H${x + 138}L${x + 88} 43L${x + 37} 156Z`;
const DECO = {
  band: () => {
    const d = [0, 140, 280].map(A_PATH).join("");
    return `<svg class="bd-band" viewBox="-2 -2 459 160"><path class="bd-line bd-base" d="${d}"/><path class="bd-line bd-draw" d="${d}" pathLength="1"/><path class="bd-run" d="${d}" pathLength="1"/></svg>`;
  },
  coin: () =>
    `<svg class="bd-coin" viewBox="0 0 80 80"><g class="bd-face"><circle class="bd-line" cx="40" cy="40" r="36"/><circle class="bd-line" cx="40" cy="40" r="28" stroke-dasharray="3 4"/><path class="bd-accent bd-glint" d="M40 22v36M47 28c-2-3-12-4-13 2s13 4 13 10-11 6-14 2"/></g></svg>`,
  coins: () =>
    `<svg class="bd-coins" viewBox="0 0 120 110">${[0, 1, 2, 3].map((k) => `<g class="bd-layer" style="--k:${k}"><path class="bd-line" d="M10 ${86 - k * 16}c0-7 22-12 50-12s50 5 50 12v10c0 7-22 12-50 12S10 ${103 - k * 16} 10 ${96 - k * 16}z"/><path class="bd-line" d="M10 ${86 - k * 16}c0 7 22 12 50 12s50-5 50-12"/></g>`).join("")}<ellipse class="bd-accent" cx="60" cy="38" rx="20" ry="4.5"/></svg>`,
};
const brandDeco = (items) =>
  `<div class="brand-deco" aria-hidden="true">${items.map(([type, slot]) => `<div class="bd-item bd-${slot}">${DECO[type]()}</div>`).join("")}</div>`;
// Icon nét cho 6 lý do chọn AAS (lần lượt theo 2 nhóm).
const advantageIcons = [
  '<path d="M24 6 40 12v11c0 10-7 17-16 20-9-3-16-10-16-20V12z"/><path class="fill" d="M24 6 40 12v11c0 10-7 17-16 20-9-3-16-10-16-20V12z"/><path d="m17 24 5 5 9-10"/>',
  '<circle cx="18" cy="16" r="6"/><circle cx="32" cy="18" r="5"/><path class="fill" d="M6 38c0-7 5-12 12-12s12 5 12 12z"/><path d="M6 38c0-7 5-12 12-12s12 5 12 12M28 28c6-1 12 3 13 10"/>',
  '<path d="M8 38h32"/><path d="M12 34V22M20 34V14M28 34V24M36 34V10"/><path d="m10 18 8-6 8 8 12-10"/>',
  '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="9"/><circle class="fill" cx="24" cy="24" r="3"/><circle cx="24" cy="24" r="3"/>',
  '<path d="M8 38h32"/><path class="fill" d="M10 34l9-9 7 5 12-14v18H10z"/><path d="m10 34 9-9 7 5 12-14"/><path d="M32 16h6v6"/>',
  '<rect x="8" y="8" width="32" height="32" rx="5"/><path d="M15 30v-6M22 30V18M29 30v-9"/><path d="M34 14h-5"/>',
];
// Vì sao chọn AAS: chia đôi 2 khối — Nền tảng AAS (deep blue) | Lợi thế giải pháp (xanh lá),
// mỗi khối 3 lý do có icon + tiêu đề + mô tả.
function advantages(c) {
  let n = 0;
  const blocks = c.advantageGroups
    .map(
      (group, g) =>
        `<article class="why-block ${g ? "is-green" : "is-blue"} reveal"><header class="why-block-head"><span class="why-block-num" aria-hidden="true">0${g + 1}</span>${copy("h3", group.title, "D11")}</header><ul class="why-list">${group.items
          .map(([title, body]) => {
            const i = n++;
            return `<li class="why-item"><span class="why-icon" aria-hidden="true"><svg viewBox="4 4 40 40">${advantageIcons[i] ?? advantageIcons[0]}</svg></span><div>${copy("h4", title, "D11")}${copy("p", body, "D11")}</div></li>`;
          })
          .join("")}</ul></article>`,
    )
    .join("");
  return `<section id="advantages" class="section light-zone has-brand-deco">${brandDeco([["band", "tr"], ["coin", "ml"], ["coins", "bl"]])}<div class="wrap">${heading(c.advantagesTitle, "D11")}<div class="why-blocks">${blocks}</div></div></section>`;
}

// Tiêu đề phụ khối Mô hình: "04 LỚP TÀI SẢN – HƯỚNG TỚI …" → số xanh chanh, tên, vạch ngăn, phụ đề chữ thường.
// Giữ nguyên dấu gạch trong DOM (ẩn chữ, hiện thành vạch) để nội dung vẫn khớp ô D11.
function modelTitle(text) {
  const [main, dash, sub = ""] = text.split(/\s([–-])\s/);
  const [num, ...rest] = main.trim().split(" ");
  const lower = sub.toLocaleLowerCase("vi-VN");
  const sentence = lower.charAt(0).toLocaleUpperCase("vi-VN") + lower.slice(1);
  return `<h3 class="mb-title" data-source="D11"><span><b>${escape(num)}</b> ${escape(rest.join(" "))}</span>${dash ? `<span class="mb-sep"> ${dash} </span><small>${escape(sentence)}</small>` : ""}</h3>`;
}
function model(c) {
  const m = c.model;
  const words = m.title.split(" ");
  const title = `<div class="section-heading mb-heading reveal"><h2 data-source="D11">${escape(words.slice(0, -3).join(" "))} <span class="mb-accent">${escape(words.slice(-3).join(" "))}</span></h2>${copy("p", m.intro, "D11", "lead")}</div>`;
  // Ba khối xếp dọc: giới thiệu, 04 lớp tài sản, 03 tầng quản trị.
  const assets = m.assets.map((asset, i) => {
    const [number, name] = asset[0].split("|").map((part) => part.trim());
    const [icon, accent] = assetIcons[i] ?? assetIcons[0];
    return `<article class="asset-card" style="--accent:${accent};--spot:${i}"><span class="asset-num" aria-hidden="true">${number}</span><span class="asset-icon" aria-hidden="true"><svg viewBox="4 4 40 40">${icon}</svg></span>${copy("h4", name, "D11")}${copy("p", asset.slice(1).join(" "), "D11")}</article>`;
  }).join("");
  // Kim tự tháp SVG bên trái, 3 tầng là vùng bấm phủ lên hình; thẻ thông tin của từng tầng nằm bên phải.
  const tierButtons = m.layers.map((layer, i) => `<button data-layer="${i}" class="pyramid-layer layer-${i}" style="${tierBox(TIER_RANGES[i])}" aria-pressed="${i === 0}" aria-controls="layer-panel-${i}"><span>${["SAA", "TAA", "AAA"][i]}</span><small>${escape(layer[2])}</small></button>`).join("");
  const tierPanels = m.layers.map((layer, i) => {
    const [, name] = layer[0].split("|").map((part) => part.trim());
    const [icon, accent] = layerIcons[i] ?? layerIcons[0];
    return `<article id="layer-panel-${i}" class="layer-panel${i === 0 ? " is-active" : ""}" style="--accent:${accent};--order:${m.layers.length - 1 - i}"><span class="asset-icon" aria-hidden="true"><svg viewBox="4 4 40 40">${icon}</svg></span><div class="layer-meta">${copy("h4", name, "D11")}${copy("p", layer[1], "D11", "layer-english")}${copy("span", layer[2], "D11", "period")}</div>${copy("p", layer.slice(3).join(" "), "D11", "layer-body")}</article>`;
  }).join("");
  return `<section id="model" class="section navy-zone loop-zone">${orb()}<div class="wrap">${title}<div class="model-block model-assets reveal"><div class="model-block-head">${modelTitle(m.assetsTitle)}</div><div class="asset-grid">${assets}</div></div><div class="model-block governance reveal"><div class="model-block-head">${modelTitle(m.layersTitle)}</div><div class="pyramid" role="group" aria-label="03 TẦNG QUẢN TRỊ"><svg class="pyr-links" aria-hidden="true">${m.layers.map((_, i) => `<g class="pyr-link${i === 0 ? " is-active" : ""}" data-link="${i}" style="--accent:${(layerIcons[i] ?? layerIcons[0])[1]}"><path class="pyr-link-base"/><path class="pyr-link-draw" pathLength="1"/><path class="pyr-link-flow" pathLength="1"/><circle class="pyr-link-start" r="4.5"/><circle class="pyr-link-end" r="3.5"/></g>`).join("")}</svg><div class="pyramid-art">${pyramidSvg(m.layers)}<div class="pyramid-tiers">${tierButtons}</div></div><div class="layer-panels">${tierPanels}</div></div></div><div class="center">${cta(c.cells.E11.trim(), "#planner", "E11")}</div></div></section>`;
}

// Số liệu trong ảnh backtest (images/backtest-hieu-suat.png). Máy tính hiện ảnh; điện thoại hiện
// biểu đồ thanh ngang cùng phong cách để chữ đủ lớn. Đổi ảnh thì sửa lại số ở đây cho khớp.
const BACKTEST = {
  title: "Tổng hiệu suất — Thuật toán đầu tư AAS vs. Top 12 quỹ",
  subtitle: "Lợi nhuận tích lũy toàn kỳ, theo dữ liệu công bố gần nhất",
  period: "AAS: backtest 2021-12-31 → 2026-08-20 (~4,5 năm, không gồm 2021) · Quỹ đối chiếu: 5 năm (gồm 2021), NAV 31/07/2026",
  source: "Nguồn: AAS Research và FiinGroup",
  maximum: 300,
  entries: [["AAS", 271.9], ["LVF", 48.2], ["VCBF-BCF", 45.7], ["MBVF", 44.5], ["VFMVSF", 40.6], ["SSI-SCA", 39.7], ["E1VFVN30", 38.0], ["KIMVGF", 37.7], ["MAGEF", 37.2], ["DCDS", 37.0], ["VNC-TT", 36.6], ["BVFED", 36.4], ["FUEVN100", 36.2]],
};
function backtest(c) {
  const b = c.backtest;
  const t = BACKTEST;
  const vi = (value) => value.toFixed(1).replace(".", ",");
  const caption = `${t.title}, ${t.subtitle.toLowerCase()}: ${t.entries.map(([name, value]) => `${name} ${vi(value)}%`).join("; ")}. ${t.period}. ${t.source}.`;
  const rows = t.entries.map(([name, value], i) => `<li class="${i ? "" : "is-aas"}"><span class="btm-name">${name}</span><span class="btm-track"><i style="width:${((value / t.maximum) * 100).toFixed(1)}%"></i></span><b>${value.toFixed(1)}%</b></li>`).join("");
  const mobile = `<div class="backtest-mobile"><p class="btm-title">${t.title}</p><p class="btm-sub">${t.subtitle}</p><ul class="btm-bars">${rows}</ul><p class="btm-note">${t.period}</p><p class="btm-note">${t.source}</p><button type="button" class="btm-zoom" data-zoom-backtest>Xem ảnh gốc <span aria-hidden="true">↗</span></button></div>`;
  const image = `<button type="button" class="backtest-zoom" id="zoom-backtest" data-zoom-backtest aria-label="Phóng to biểu đồ backtest"><img src="images/backtest-hieu-suat.png" alt="" width="3788" height="2042" loading="lazy" decoding="async"><span class="icon-button" aria-hidden="true">↗</span></button>`;
  return `<section id="backtest" class="section light-zone has-brand-deco">${brandDeco([["band", "br"], ["coin", "mr"]])}<div class="wrap"><div class="backtest-grid"><div class="reveal">${copy("h2", b[0], "D12")}${copy("p", b[1], "D12", "lead")}</div><figure class="backtest-figure reveal"><figcaption class="sr-only">${caption}</figcaption>${image}${mobile}</figure></div>${copy("p", b.at(-1), "D12", "notice reveal")}</div></section>`;
}

function comparison(c) {
  const [title, headers, ...rows] = c.comparison;
  return `<section id="comparison" class="section comparison-section navy-zone"><div class="wrap">${heading(title[0], "D13")}<div class="table-scroll reveal" role="region" tabindex="0" aria-label="SO SÁNH VỚI CÁC KÊNH ĐẦU TƯ TRUYỀN THỐNG"><table><thead><tr>${headers.map((text) => copy("th", text, "D13")).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((text, i) => (i ? `<td data-source="D13" data-label="${escape(headers[i])}"${i === row.length - 1 ? ' class="is-aas"' : ""}>${escape(text)}</td>` : copy("th", text, "D13"))).join("")}</tr>`).join("")}</tbody></table></div></div></section>`;
}

function compound(c) {
  const s = c.compound;
  return `<section id="compound" class="section compound-section loop-zone has-brand-deco">${brandDeco([["coins", "tr"], ["band", "bl"], ["coin", "ml"]])}<div class="wrap">${heading(s.title, "D14", s.intro)}<div class="compound-grid"><div class="compound-factors reveal">${copy("h3", s.factorsTitle, "D14")}${s.factors.map((f, i) => `<article><span class="factor-orb" aria-hidden="true"><svg viewBox="4 4 40 40">${compoundIcons[i][0]}</svg></span><div>${copy("h4", f[0], "D14")}${copy("p", f[1], "D14")}</div></article>`).join("")}</div>${compoundArt()}</div><div class="stock-area reveal"><div class="stock-intro">${copy("h3", s.exampleTitle, "D14")}${copy("p", s.exampleIntro, "D14")}</div><div class="stock-comparison"><p class="stock-caption"><strong id="stock-name">${escape(s.stocks[0][0])}</strong><span id="stock-period">${escape(s.stocks[0][1])}</span><b id="stock-multiple"></b></p><p class="stock-rate">Tăng trưởng bình quân <b id="stock-rate">${escape(s.stocks[0][2])}</b>/năm</p><svg class="stock-chart" id="stock-chart" viewBox="0 0 760 210" role="img" aria-label="Biểu đồ giá trị 100 triệu đồng theo thời gian nắm giữ"><defs><linearGradient id="stock-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc63f" stop-opacity=".32"/><stop offset="1" stop-color="#8cc63f" stop-opacity="0"/></linearGradient></defs><g class="stock-grid"></g><path class="stock-area" fill="url(#stock-fill)"/><path class="stock-capital"/><path class="stock-value" pathLength="1"/><g class="stock-marks"></g><g class="stock-axis"></g></svg><div class="stock-legend"><span class="is-capital">Vốn ban đầu <b>100tr</b></span><span class="is-value">Giá trị hiện tại <b id="stock-final">${escape(s.stocks[0][3].split("→")[1].trim())}</b></span></div><div class="stock-dots" role="group" aria-label="Cổ phiếu minh họa">${s.stocks.map((stock, i) => `<button data-stock="${i}" aria-pressed="${i === 0}" aria-label="${escape(stock[0])}"><i></i></button>`).join("")}</div></div></div>${copy("p", s.notice, "D14", "notice reveal")}<div class="center"><button class="cta" data-book data-source="E14"><span>${escape(c.cells.E14.trim())}</span>${arrow}</button></div></div></section>`;
}

// 5 bước: các nút số nằm trên một đường lượn sóng ngang, chỉ hiện số và tên bước;
// rê chuột / focus / chạm vào bước nào thì thẻ chi tiết của bước đó hiện ra.
// Màu nút số theo thứ bậc: bước 1 xanh navy đậm, nhạt dần tới bước 5.
const STEP_TONES = ["#15285a", "#233f7e", "#2f57a0", "#3f70bf", "#5a8bd4"];
const STEP_POINTS = [[100, 60], [300, 140], [500, 60], [700, 140], [900, 60]];
function stepsWave() {
  const pts = [[-20, 100], ...STEP_POINTS, [1020, 100]];
  let d = `M${pts[0]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${p2}`;
  }
  return `<svg class="steps-wave" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><path class="wave-base" d="${d}"/><path class="wave-flow" d="${d}" pathLength="1"/></svg>`;
}
function steps(c) {
  const nodes = c.steps
    .map((step, i) => {
      const [x, y] = STEP_POINTS[i] ?? STEP_POINTS.at(-1);
      const name = step[0].replace(/^\s*\d+\s*[—–-]\s*/, "");
      return `<li class="step-node ${y < 100 ? "is-high" : "is-low"}" style="--x:${x / 10}%;--y:${y}px;--step:${i};--tone:${STEP_TONES[i] ?? STEP_TONES.at(-1)}"><button type="button" class="step-token" aria-expanded="false" aria-controls="step-detail-${i}"><span class="sr-only">Bước </span>${i + 1}</button>${copy("h3", name, "D15", "step-name")}<div class="step-detail" id="step-detail-${i}">${copy("p", step[1], "D15")}</div></li>`;
    })
    .join("");
  return `<section id="steps" class="section steps-section loop-zone"><div class="wrap">${heading(c.stepsTitle, "D15")}<div class="steps-flow">${stepsWave()}<ol class="steps-grid">${nodes}</ol></div><div class="center">${cta(c.cells.E15.trim(), "#planner", "E15")}</div></div></section>`;
}

function experts(c) {
  return `<section id="experts" class="section light-zone loop-zone"><div class="wrap"><div class="carousel-heading">${heading(c.expertsTitle, "D17", c.expertsIntro)}</div><div class="experts-track" id="experts-track" tabindex="0" aria-label="Đội ngũ chuyên gia quản lý">${c.experts.map((expert, i) => `<article class="expert-card"><div class="portrait"><span class="portrait-initials" aria-hidden="true">${escape(initials(expert[0]))}</span>${PORTRAITS.has(portraitSlug(expert[0])) ? `<img src="images/chuyen-gia-${portraitSlug(expert[0])}.webp" width="480" height="480" alt="${escape(expert[0])}" loading="lazy">` : ""}</div><div class="expert-copy">${copy("h3", expert[0], "D17")}${copy("p", expert[1], "D17", "expert-role")}${copy("p", expert.slice(2).join(" "), "D17")}</div></article>`).join("")}</div><div class="carousel-nav"><button class="icon-button" data-carousel="-1" aria-label="Chuyên gia trước">←</button><div class="carousel-dots" role="group" aria-label="Chọn chuyên gia">${c.experts.map((expert, i) => `<button type="button" data-expert-dot="${i}" aria-label="${escape(expert[0])}" aria-pressed="${i === 0}"><i></i></button>`).join("")}</div><button class="icon-button" data-carousel="1" aria-label="Chuyên gia tiếp theo">→</button></div></div></section>`;
}

// FAQ: desktop là danh sách câu hỏi cuộn trong khung cố định bên trái + khung trả lời bên phải
// (mỗi lần một câu, mặc định câu 01); mobile là danh sách xổ xuống, hiện 6 câu đầu + nút "Xem thêm".
function faq(c) {
  return `<section id="faq" class="section faq-section has-brand-deco">${brandDeco([["band", "tr"]])}<div class="wrap faq-grid"><div class="faq-heading reveal">${copy("h2", c.faqTitle, "D18")}<button class="cta" data-book data-source="E18"><span>LIÊN HỆ TƯ VẤN</span>${arrow}</button></div><div class="faq-layout"><div class="faq-list" id="faq-list">${c.faqs.map(([question, answer], i) => `<details class="faq-item"><summary><span class="faq-number">${String(i + 1).padStart(2, "0")}</span>${copy("span", question, "D18")}</summary>${copy("p", answer, "D18")}</details>`).join("")}</div><div class="faq-answer" id="faq-answer" aria-live="polite"></div></div><button type="button" class="faq-more" id="faq-more" aria-controls="faq-list" aria-expanded="false">Xem thêm ${Math.max(0, c.faqs.length - 6)} câu hỏi</button></div></section>`;
}

// Thiết kế lộ trình đầu tư (bản v2): tiêu đề + mô tả (ô D16), khung video, nút Bắt đầu khảo sát bên dưới.
// Video responsive: wide (ngang 16:9) cho máy tính/tablet, tall (dọc 9:16) cho điện thoại ≤640px.
// Mỗi bản: src (file mp4 tự host trong public/video/, kèm poster là ảnh bìa) hoặc embed (link nhúng YouTube / Google Drive).
// Bỏ trống tall thì điện thoại dùng luôn bản ngang; bỏ trống cả hai thì hiện khung chờ.
// File gốc nằm ở anh-goc/ (không lên GitHub); nén lại bằng ffmpeg — lệnh trong README.
export const VIDEO = {
  wide: { src: "video/lo-trinh-ngang.mp4", poster: "video/lo-trinh-ngang.jpg" }, // 2-10 Quản lý gia sản bản ngang.mp4, 1280×720
  tall: { src: "video/lo-trinh-doc.mp4", poster: "video/lo-trinh-doc.jpg" }, // 2-10 Quản lý gia sản bản dọc.mp4, 720×1280
};
// Trang khảo sát sức khỏe tài chính (nút "Bắt đầu khảo sát", mở tab mới).
export const SURVEY = { url: "https://phantich.aas.com.vn/tich-san/suc-khoe-tai-chinh" };
// Bản ngang có src thật ngay trong HTML (SEO, không JS). Bản dọc chỉ có data-src; app.js gắn src khi màn hình ≤640px,
// nên mỗi thiết bị chỉ tải video + ảnh bìa của mình; video chỉ tải khi bấm phát (preload="none").
const videoPlayer = ({ embed, src, poster } = {}, lazy = false) => {
  const attr = lazy ? "data-src" : "src";
  if (embed)
    return `<iframe ${attr}="${escape(embed)}" title="Video thiết kế lộ trình đầu tư" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  if (src)
    return `<video ${attr}="${escape(src)}"${poster ? ` ${lazy ? "data-poster" : "poster"}="${escape(poster)}"` : ""} controls controlslist="nodownload" preload="none" playsinline></video>`;
  return `<div class="video-wait" role="img" aria-label="Video thiết kế lộ trình đầu tư (sắp cập nhật)"><span class="video-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span><strong>Video thiết kế lộ trình đầu tư</strong><span>Sắp cập nhật</span></div>`;
};
function survey(c) {
  const s = c.survey;
  const hasTall = Boolean(VIDEO.tall?.embed || VIDEO.tall?.src);
  const frames = `<div class="video-frame is-wide${hasTall ? " has-tall" : ""} reveal">${videoPlayer(VIDEO.wide)}</div>${hasTall ? `<div class="video-frame is-tall reveal">${videoPlayer(VIDEO.tall, true)}</div>` : ""}`;
  const actions = `<div class="video-actions"><a class="cta" id="start-survey" href="${escape(SURVEY.url)}" target="_blank" rel="noopener" data-source="D16"><span>${escape(s.cta)}</span>${arrow}</a></div>`;
  return `<section id="planner" class="section planner-section"><div class="wrap"><div class="section-heading reveal">${copy("h2", s.title, "D16")}${copy("p", s.intro, "D16", "lead")}</div>${frames}${actions}</div></section>`;
}

export function renderPage(c) {
  return (
    hero(c) +
    pain(c) +
    solution(c) +
    advantages(c) +
    model(c) +
    backtest(c) +
    comparison(c) +
    compound(c) +
    steps(c) +
    survey(c) +
    experts(c) +
    faq(c) +
    `<section class="closing navy-zone loop-zone">${orb()}<div class="wrap closing-grid"><div class="reveal">${copy("h2", c.closing[0], "D19")}${copy("p", c.closing[1], "D19")}</div><button class="cta" data-book data-source="E19"><span>${escape(c.cells.E19.trim())}</span>${arrow}</button></div>${coin("closing-coin")}</section>`
  );
}
