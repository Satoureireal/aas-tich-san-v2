// Minh hoạ người cho 4 thẻ "nỗi đau" (vector phẳng, cùng tông màu web). Khung 400×260.
// Mỗi cảnh: một nhân vật nửa người sau bàn làm việc + đồ vật + nhãn nổi quanh đầu.
const SKIN = "#f3cdb0";
const SKIN_SHADE = "#e4b393";

// Nhãn nổi dạng viên thuốc (chữ + icon nhỏ tuỳ chọn).
const chip = (x, y, text, delay = 0) =>
  `<g class="art-chip" style="--d:${delay}s" transform="translate(${x} ${y})"><rect x="0" y="-17" width="${text.length * 8.6 + 30}" height="34" rx="17"/><circle cx="14" cy="0" r="4.5"/><text x="25" y="5.5">${text}</text></g>`;

// Nhân vật: tóc dài (nữ) hoặc ngắn (nam), áo, tư thế tay.
function person({ cx = 200, hair, long, shirt, collar, pose, frown = true }) {
  const hy = 92; // tâm đầu
  const back = long
    ? `<path fill="${hair}" d="M${cx - 38},${hy - 6} C${cx - 44},${hy + 40} ${cx - 52},${hy + 78} ${cx - 34},${hy + 92} L${cx + 34},${hy + 92} C${cx + 52},${hy + 78} ${cx + 44},${hy + 40} ${cx + 38},${hy - 6} Z"/>`
    : "";
  const torso = `<path fill="${shirt}" d="M${cx - 64},260 L${cx - 60},${hy + 86} C${cx - 58},${hy + 64} ${cx - 34},${hy + 56} ${cx - 14},${hy + 54} L${cx + 14},${hy + 54} C${cx + 34},${hy + 56} ${cx + 58},${hy + 64} ${cx + 60},${hy + 86} L${cx + 64},260 Z"/><path fill="${collar}" d="M${cx - 14},${hy + 54} L${cx},${hy + 80} L${cx + 14},${hy + 54} Z"/>`;
  const neck = `<rect x="${cx - 10}" y="${hy + 22}" width="20" height="36" rx="8" fill="${SKIN_SHADE}"/>`;
  const head = `<ellipse cx="${cx}" cy="${hy}" rx="29" ry="33" fill="${SKIN}"/>`;
  const front = long
    ? `<path fill="${hair}" d="M${cx - 31},${hy + 2} C${cx - 34},${hy - 34} ${cx - 8},${hy - 44} ${cx + 8},${hy - 40} C${cx + 30},${hy - 36} ${cx + 38},${hy - 14} ${cx + 32},${hy + 6} C${cx + 18},${hy - 14} ${cx},${hy - 20} ${cx - 16},${hy - 18} C${cx - 22},${hy - 10} ${cx - 26},${hy - 2} ${cx - 31},${hy + 2} Z"/>`
    : `<path fill="${hair}" d="M${cx - 30},${hy - 2} C${cx - 34},${hy - 30} ${cx - 14},${hy - 44} ${cx + 6},${hy - 42} C${cx + 30},${hy - 40} ${cx + 36},${hy - 20} ${cx + 30},${hy - 2} C${cx + 26},${hy - 18} ${cx + 12},${hy - 22} ${cx - 2},${hy - 22} C${cx - 16},${hy - 22} ${cx - 26},${hy - 16} ${cx - 30},${hy - 2} Z"/>`;
  const brow = frown ? 3 : 0;
  const face = `<g class="art-face" stroke="#3a2a22" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M${cx - 17},${hy - 6 + brow} L${cx - 6},${hy - 8}"/><path d="M${cx + 6},${hy - 8} L${cx + 17},${hy - 6 + brow}"/><path d="M${cx - 6},${hy + 18} Q${cx},${hy + 15} ${cx + 6},${hy + 18}"/></g><circle cx="${cx - 11}" cy="${hy + 1}" r="2.6" fill="#3a2a22"/><circle cx="${cx + 11}" cy="${hy + 1}" r="2.6" fill="#3a2a22"/><ellipse cx="${cx - 29}" cy="${hy + 4}" rx="4" ry="7" fill="${SKIN_SHADE}"/><ellipse cx="${cx + 29}" cy="${hy + 4}" rx="4" ry="7" fill="${SKIN_SHADE}"/>`;
  const arm = (d) => `<path d="${d}" fill="none" stroke="${shirt}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`;
  const hand = (x, y, rx = 11, ry = 10) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${SKIN}"/>`;
  const arms = {
    // Tay chống cằm, tay kia cầm bút trên sổ.
    chin: arm(`M${cx - 52},${hy + 78} C${cx - 64},${hy + 120} ${cx - 44},${hy + 150} ${cx - 16},${hy + 26}`) + hand(cx - 14, hy + 28) + arm(`M${cx + 52},${hy + 80} C${cx + 60},${hy + 130} ${cx + 70},${hy + 150} ${cx + 92},${hy + 150}`) + hand(cx + 96, hy + 150),
    // Một tay cầm điện thoại, tay kia chống cằm.
    phone: arm(`M${cx - 52},${hy + 78} C${cx - 60},${hy + 120} ${cx - 40},${hy + 146} ${cx - 14},${hy + 30}`) + hand(cx - 12, hy + 30) + arm(`M${cx + 52},${hy + 80} C${cx + 64},${hy + 116} ${cx + 52},${hy + 132} ${cx + 30},${hy + 110}`) + `<rect x="${cx + 12}" y="${hy + 78}" width="26" height="44" rx="5" fill="#1d2a44"/><rect x="${cx + 15}" y="${hy + 82}" width="20" height="34" rx="3" fill="#8fbaee"/>` + hand(cx + 28, hy + 112, 12, 11),
    // Nhún vai, hai lòng bàn tay ngửa lên.
    shrug: arm(`M${cx - 54},${hy + 76} C${cx - 76},${hy + 104} ${cx - 90},${hy + 130} ${cx - 118},${hy + 118}`) + hand(cx - 124, hy + 116, 15, 7) + arm(`M${cx + 54},${hy + 76} C${cx + 76},${hy + 104} ${cx + 90},${hy + 130} ${cx + 118},${hy + 118}`) + hand(cx + 124, hy + 116, 15, 7),
    // Tay ôm trán, tay kia đặt trên bàn phím.
    forehead: arm(`M${cx + 52},${hy + 76} C${cx + 84},${hy + 40} ${cx + 60},${hy - 10} ${cx + 18},${hy - 22}`) + hand(cx + 10, hy - 22, 14, 11) + arm(`M${cx - 52},${hy + 80} C${cx - 56},${hy + 130} ${cx - 40},${hy + 150} ${cx - 8},${hy + 152}`) + hand(cx - 2, hy + 152),
  };
  return `<g class="art-person" transform="translate(${cx} 260) scale(1.14) translate(${-cx} -260)">${back}${torso}${neck}${head}${front}${face}${arms[pose]}</g>`;
}

const desk = `<rect x="0" y="236" width="400" height="24" fill="#e6efe0"/><rect x="0" y="236" width="400" height="3" fill="#cfdcc6"/>`;
const laptop = (x, flip = false) =>
  `<g transform="translate(${x} 0)${flip ? " scale(-1 1)" : ""}"><path d="M0,236 L10,176 L96,176 L90,236 Z" fill="#c7d0d8"/><path d="M14,182 L92,182 L87,230 L6,230 Z" fill="#e9eef2"/><rect x="-6" y="234" width="112" height="6" rx="3" fill="#aeb8c2"/></g>`;
const mug = (x) => `<g transform="translate(${x} 206)"><rect width="22" height="30" rx="4" fill="#fff" stroke="#d3ddd0" stroke-width="2"/><path d="M22,8 q10,0 10,8 t-10,8" fill="none" stroke="#d3ddd0" stroke-width="3"/></g>`;
const notebook = `<g transform="translate(250 226) rotate(-6)"><rect width="90" height="14" rx="2" fill="#f6f1e6" stroke="#d8cfbd" stroke-width="1.5"/><path d="M45,1 V13" stroke="#d8cfbd"/></g>`;
const question = (x, y, s = 1) => `<text class="art-q" x="${x}" y="${y}" font-size="${28 * s}">?</text>`;

const SCENES = [
  // 01 — trăn trở kế hoạch mục tiêu: chống cằm, sổ ghi, danh sách mục tiêu và hồng tâm.
  () =>
    desk + notebook + laptop(-20) + person({ cx: 150, hair: "#2b1d18", long: true, shirt: "#e7dccb", collar: "#ffffff", pose: "chin" }) +
    `<g class="art-float" style="--d:.2s"><circle cx="290" cy="46" r="20" fill="none" stroke="#456a24" stroke-width="2.5"/><circle cx="290" cy="46" r="11" fill="none" stroke="#456a24" stroke-width="2.5"/><circle cx="290" cy="46" r="3.5" fill="#456a24"/><path d="M290,46 L312,24" stroke="#456a24" stroke-width="2.5"/></g>` +
    `<g class="art-list">${["Mua nhà?", "Du học?", "Hưu trí?"].map((t, i) => `<g class="art-float" style="--d:${0.5 + i * 0.3}s" transform="translate(${262 + i * 10} ${92 + i * 32}) rotate(-8)"><rect x="0" y="-11" width="16" height="16" rx="3" fill="none" stroke="#456a24" stroke-width="2"/><path d="M3,-3 l4,4 l7,-9" fill="none" stroke="#456a24" stroke-width="2.2"/><text x="24" y="3">${t}</text></g>`).join("")}</g>`,
  // 02 — băn khoăn đầu tư vào đâu: cầm điện thoại, 4 nhãn kênh đầu tư.
  () =>
    desk + person({ cx: 140, hair: "#1f1a18", long: false, shirt: "#2f5e3c", collar: "#f4f6f2", pose: "phone" }) + question(58, 70) +
    chip(244, 50, "Cổ phiếu?", 0.2) + chip(250, 96, "Trái phiếu?", 0.5) + chip(282, 142, "Quỹ?", 0.8) + chip(276, 188, "BĐS?", 1.1),
  // 03 — lúng túng phân bổ: nhún vai, nhãn các kênh hai bên, biểu đồ tròn và cột.
  () =>
    desk + person({ cx: 200, hair: "#2b1d18", long: true, shirt: "#ece3d3", collar: "#ffffff", pose: "shrug" }) + question(120, 60, 0.9) + question(262, 50, 0.9) +
    `<g class="art-float" style="--d:.1s" transform="translate(38 20)"><rect width="56" height="50" rx="12" fill="#fff"/><circle cx="28" cy="25" r="15" fill="#cfe3bd"/><path d="M28,25 V10 A15,15 0 0 1 42,30 Z" fill="#5f8f33"/></g>` +
    `<g class="art-float" style="--d:.4s" transform="translate(306 20)"><rect width="56" height="50" rx="12" fill="#fff"/>${[14, 22, 30, 38].map((x, i) => `<rect x="${x - 3}" y="${36 - i * 6}" width="6" height="${6 + i * 6}" rx="1.5" fill="#5f8f33"/>`).join("")}</g>` +
    chip(6, 100, "Cổ phiếu", 0.3) + chip(4, 150, "Trái phiếu", 0.6) + chip(292, 100, "Tiền mặt", 0.4) + chip(318, 150, "BĐS", 0.7),
  // 04 — thiếu định hướng: ôm trán trước laptop, nến biến động phía sau, bong bóng "Biến động thị trường".
  () =>
    `<g class="art-candles" opacity=".55">${Array.from({ length: 16 }, (_, i) => {
      const x = 20 + i * 14;
      const up = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1][i];
      const mid = 150 - i * 5 + (i % 3) * 10;
      return `<path d="M${x},${mid - 22} V${mid + 22}" stroke="${up ? "#5f8f33" : "#d9695f"}" stroke-width="1.5"/><rect x="${x - 3.5}" y="${mid - 10}" width="7" height="${16 + (i % 4) * 3}" fill="${up ? "#5f8f33" : "#d9695f"}"/>`;
    }).join("")}</g>` +
    desk + mug(40) + person({ cx: 200, hair: "#1f1a18", long: false, shirt: "#22325a", collar: "#f4f6f2", pose: "forehead" }) + laptop(150) +
    `<g class="art-float" style="--d:.3s" transform="translate(300 40)"><path d="M0,14 a14,14 0 1 1 28,0 a14,14 0 1 1 -28,0 M14,0 C4,10 24,18 14,28 M0,14 C10,4 18,24 28,14" fill="none" stroke="#456a24" stroke-width="2"/></g>` +
    `<g class="art-float" style="--d:.6s" transform="translate(296 92)"><rect x="-8" width="104" height="50" rx="14" fill="#fff"/><text x="4" y="21" class="art-note">Biến động</text><text x="4" y="39" class="art-note">thị trường...</text></g>`,
];

export function painArt(index) {
  const scene = SCENES[index] ?? SCENES[0];
  return `<svg class="pain-art" viewBox="0 0 400 260" aria-hidden="true">${scene()}</svg>`;
}

// Nhãn nổi đặt lên ảnh người thật (ảnh vuông, khung 400×400), vào vùng trống của từng ảnh.
const target = (x, y) =>
  `<g class="art-float" style="--d:.2s" transform="translate(${x} ${y})"><circle r="20" fill="none" stroke="#456a24" stroke-width="2.5"/><circle r="11" fill="none" stroke="#456a24" stroke-width="2.5"/><circle r="3.5" fill="#456a24"/><path d="M0,0 L22,-22" stroke="#456a24" stroke-width="2.5"/></g>`;
const checklist = (x, y, items) =>
  items.map((t, i) => `<g class="art-float art-list" style="--d:${0.5 + i * 0.3}s" transform="translate(${x + i * 10} ${y + i * 34}) rotate(-8)"><rect x="0" y="-11" width="16" height="16" rx="3" fill="#ffffffcc" stroke="#456a24" stroke-width="2"/><path d="M3,-3 l4,4 l7,-9" fill="none" stroke="#456a24" stroke-width="2.2"/><text x="24" y="3">${t}</text></g>`).join("");
const icon = (x, y, body, delay) => `<g class="art-float" style="--d:${delay}s" transform="translate(${x} ${y})"><rect width="54" height="48" rx="12" fill="#fff" filter="drop-shadow(0 4px 6px #2f6e461f)"/>${body}</g>`;
const OVERLAYS = [
  () => target(318, 64) + checklist(262, 118, ["Mua nhà?", "Du học?", "Hưu trí?"]),
  () => question(70, 110) + chip(262, 44, "Cổ phiếu?", 0.2) + chip(270, 88, "Trái phiếu?", 0.5) + chip(302, 132, "Quỹ?", 0.8) + chip(300, 176, "BĐS?", 1.1),
  () =>
    icon(30, 30, `<circle cx="27" cy="24" r="14" fill="#cfe3bd"/><path d="M27,24 V10 A14,14 0 0 1 40,29 Z" fill="#5f8f33"/>`, 0.1) +
    icon(316, 30, [13, 21, 29, 37].map((x, i) => `<rect x="${x - 3}" y="${34 - i * 6}" width="6" height="${6 + i * 6}" rx="1.5" fill="#5f8f33"/>`).join(""), 0.4) +
    question(112, 64, 0.9) + question(272, 58, 0.9) +
    chip(6, 118, "Cổ phiếu", 0.3) + chip(4, 166, "Trái phiếu", 0.6) + chip(290, 118, "Tiền mặt", 0.4) + chip(318, 166, "BĐS", 0.7),
  () =>
    `<g opacity=".5">${Array.from({ length: 11 }, (_, i) => {
      const x = 22 + i * 15;
      const up = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1][i];
      const mid = 150 - i * 7 + (i % 3) * 12;
      return `<path d="M${x},${mid - 22} V${mid + 22}" stroke="${up ? "#5f8f33" : "#d9695f"}" stroke-width="1.5"/><rect x="${x - 3.5}" y="${mid - 10}" width="7" height="${16 + (i % 4) * 3}" fill="${up ? "#5f8f33" : "#d9695f"}"/>`;
    }).join("")}</g>` +
    `<g class="art-float" style="--d:.3s" transform="translate(246 12)"><path d="M0,14 a14,14 0 1 1 28,0 a14,14 0 1 1 -28,0 M14,0 C4,10 24,18 14,28 M0,14 C10,4 18,24 28,14" fill="none" stroke="#456a24" stroke-width="2"/></g>` +
    `<g class="art-float" style="--d:.6s" transform="translate(292 8)"><rect x="-6" width="112" height="52" rx="14" fill="#fff" filter="drop-shadow(0 4px 6px #2f6e461f)"/><text x="6" y="22" class="art-note">Biến động</text><text x="6" y="41" class="art-note">thị trường...</text></g>`,
];

export function painOverlay(index) {
  const overlay = OVERLAYS[index] ?? OVERLAYS[0];
  return `<svg class="pain-overlay" viewBox="0 0 400 400" aria-hidden="true">${overlay()}</svg>`;
}
