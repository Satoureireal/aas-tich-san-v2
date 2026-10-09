// Dựng sẵn HTML cho SEO: ghép nội dung các section (render.js + content.json) vào public/index.html,
// thêm thẻ SEO (canonical, Open Graph, JSON-LD doanh nghiệp + FAQPage), robots.txt và sitemap.xml.
// Chỉ dùng lại đúng nội dung đang có trên trang, không thêm/sửa chữ hiển thị.
// Chạy: npm run build (Vercel tự chạy khi deploy). Chạy lại bao nhiêu lần cũng cho cùng kết quả.
import { readFile, writeFile } from "node:fs/promises";
import { parseCopy } from "../public/copy.js";
import { renderPage } from "../public/render.js";
import { escape, arrow } from "../public/ui.js";

const root = new URL("../public/", import.meta.url);
// Địa chỉ trang khi chạy quảng cáo / gắn tên miền riêng: đặt biến SITE_URL (vd https://tichsan.aas.com.vn).
// Không đặt thì dùng tên miền production Vercel cấp, cuối cùng là link .vercel.app hiện tại.
const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "https://lading-page-23-09.vercel.app"
).replace(/\/+$/, "");

const { cells } = JSON.parse(await readFile(new URL("content.json", root), "utf8"));
const c = parseCopy(cells);
const clean = (text) => String(text).replace(/\s+/g, " ").trim();
const title = "AAS QUẢN LÝ TÀI SẢN — TÍCH SẢN CÓ ĐÍCH";
// Mô tả lấy nguyên câu giới thiệu ở hero (ô D7).
const description = clean(c.hero.find((line) => line.length > 60) ?? title);

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "AAS Quản lý tài sản",
    description,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/images/logo-aas.png`,
    image: `${SITE_URL}/images/og-banner.jpg`,
    telephone: "0917316891",
    sameAs: ["https://www.facebook.com/SmartInvestSecurities.chinhthuc", "https://bit.ly/AAS_ZaloOA", "https://www.tiktok.com/@smartinvestsecurities"],
    parentOrganization: { "@type": "Organization", name: "Công ty Cổ phần Chứng khoán Smart Invest (AAS)" },
    address: [
      { "@type": "PostalAddress", streetAddress: "Số 220 + 222 + 224 phố Nguyễn Lương Bằng, P. Đống Đa", addressLocality: "Hà Nội", addressCountry: "VN" },
      { "@type": "PostalAddress", streetAddress: "Tầng 25, Rox Tower, 180 - 192 Nguyễn Công Trứ, P. Bến Thành", addressLocality: "TP. Hồ Chí Minh", addressCountry: "VN" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: clean(question),
      acceptedAnswer: { "@type": "Answer", text: clean(answer) },
    })),
  },
];

const head = `<!-- seo:start (sinh tự động bởi scripts/prerender.mjs — sửa ở đó) -->
    <meta name="description" content="${escape(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${SITE_URL}/" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="vi_VN" />
    <meta property="og:site_name" content="AAS Quản lý tài sản" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:image" content="${SITE_URL}/images/og-banner.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />
    <meta name="twitter:image" content="${SITE_URL}/images/og-banner.jpg" />
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>
    <!-- seo:end -->`;

const file = new URL("index.html", root);
let html = await readFile(file, "utf8");
// 1) Thẻ SEO trong <head>: thay khối seo cũ (lần chạy trước) hoặc các thẻ description / og / twitter gốc.
if (html.includes("<!-- seo:start")) {
  html = html.replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, head);
} else {
  html = html
    .replace(/\n\s*<!-- Ảnh thu nhỏ khi chia sẻ link[^\n]*/, "")
    .replace(/\n\s*<meta (name="description"|property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/g, "")
    .replace(/(<title>[^<]*<\/title>)/, `$1\n    ${head}`);
}
// 2) Nội dung các section dựng sẵn trong <main>; app.js thấy data-prerendered thì chỉ gắn tương tác.
html = html.replace(/<main id="main"[^>]*>[\s\S]*?<\/main>/, () => `<main id="main" data-prerendered>${renderPage(c)}</main>`);
// 3) Nút đặt lịch trên header.
html = html.replace(/<button class="cta header-book" data-book>[\s\S]*?<\/button>/, () =>
  `<button class="cta header-book" data-book><span data-source="B2">${escape(c.bookingTitle)}</span>${arrow}</button>`,
);
await writeFile(file, html);

await writeFile(new URL("robots.txt", root), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
await writeFile(
  new URL("sitemap.xml", root),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
);
console.log(`Prerender xong: ${SITE_URL} — ${c.faqs.length} câu FAQ trong JSON-LD`);
