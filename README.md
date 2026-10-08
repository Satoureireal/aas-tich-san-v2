# AAS Quản lý tài sản — Landing page "Tích sản có đích"

Landing page giới thiệu giải pháp **AAS Quản lý tài sản**: giới thiệu giải pháp, mô hình quản lý tài sản, khảo sát sức khỏe tài chính và nhận tư vấn chuyên gia.

## Chạy trên máy

Cần Node.js 22 trở lên. Server không cần thư viện runtime bên ngoài.

```powershell
npm start
```

Mở **http://localhost:3002**. Server lưu yêu cầu liên hệ vào `data/` (đã `.gitignore`, không đưa lên GitHub).

## Bản demo trên GitHub Pages / Vercel

GitHub Pages và Vercel chỉ phục vụ file tĩnh trong `public/` (không chạy `server.mjs`), nên khi mở trên `*.github.io` hoặc `*.vercel.app` trang tự chuyển sang **chế độ demo tĩnh**:

- Toàn bộ giao diện, biểu đồ và hiệu ứng chạy đầy đủ.
- Form liên hệ / đặt lịch / đăng ký **không gửi dữ liệu đi đâu**; hộp thoại có ghi chú "Bản demo".
- Muốn thử chế độ này ở máy: mở http://localhost:3002/?demo=static

Vercel: cấu hình sẵn trong [`vercel.json`](vercel.json) (không build, thư mục xuất `public`) và [`.vercelignore`](.vercelignore) (không upload `server.mjs`, tránh Vercel tự biến nó thành serverless function rồi lỗi 500). Import repo vào Vercel là chạy, mỗi lần push lên `master` Vercel tự deploy lại.

GitHub Pages: deploy tự động bằng GitHub Actions ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) mỗi khi push lên nhánh `master`/`main`: chạy unit test rồi đăng thư mục `public/`. Bật một lần: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Nội dung và cập nhật Excel

- `public/content.json` lưu 59 ô nguyên văn từ sheet Landing page.
- `public/copy.js` chỉ chia nội dung thành section, nhóm bullet, bảng và FAQ; không viết lại câu chữ.
- `public/render.js` tạo giao diện từ nội dung đã đọc. Các đoạn tĩnh có `data-source` để đối chiếu ô Excel.
- Các ghi chú thiết kế, điều hướng như “Click vào CTA”, dấu ngoặc bao placeholder, mô tả hình ảnh ở cột F được chuyển thành hành vi/chỗ hiển thị tương ứng; không dùng làm nội dung quảng cáo mới.
- Có kiểm tra tự động đối chiếu các tiêu đề, đoạn văn, bảng với nguồn Excel, và kiểm tra đủ 4 nỗi đau, 4 đặc điểm giải pháp, 4 ưu điểm, 3 lớp tài sản, 3 tầng quản trị, 4 mã cổ phiếu, 5 bước, 6 chuyên gia, 19 FAQ.

Sửa chữ trực tiếp trong `public/content.json` (đã có nhiều chỉnh sửa so với file Excel gốc nên không còn script nhập lại từ Excel). Biểu đồ backtest là ảnh `public/images/backtest-hieu-suat.png`.

## Tương tác và motion

- Hero Deep Blue với mô hình cột tăng trưởng 3D, đồng tiền nổi, thẻ mục tiêu và phản hồi theo vị trí chuột.
- Gradient nhiều lớp, lưới tài chính mờ, vòng sáng và hình đồng tiền theo ngữ cảnh từng section.
- CTA có vệt sáng lặp và mũi tên nhịp nhẹ; dừng khi hover/focus hoặc khi tắt chuyển động.
- Section/card xuất hiện lệch nhịp khi cuộn; nội dung vẫn hiển thị nếu không có animation.
- Giải pháp: tiêu đề "AAS QUẢN LÝ TÀI SẢN" + mô tả (in đậm "AAS Tích sản", "AAS Gia sản"); quỹ đạo chỉ còn 5 mục tiêu xoay quanh tâm; 4 thẻ đặc điểm cùng kích thước, chỉ hiện số + tiêu đề, rê chuột hoặc bấm/chạm vào box mới hiện mô tả. Khối "Hình thức đầu tư linh hoạt" (AAS Tích sản, AAS Gia sản, nút XEM CÁCH MAY ĐO DANH MỤC) sửa chữ ở `FLEX_PLANS` trong `public/render.js`.
- Vì sao chọn AAS: chia đôi 2 khối — Nền tảng AAS (deep blue) và Lợi thế giải pháp (xanh lá), mỗi khối 3 lý do có icon; mobile xếp dọc.
- Backtest dựng bằng HTML/CSS: 13 cột có mặt trước, mặt trên, mặt bên và bóng nhẹ; chiều cao theo trục 0–300%. Số liệu chép từ biểu đồ tài liệu, không phải dự báo. Hover, chạm hoặc dùng phím mũi tên để xem từng cột; có popup mở rộng. Tablet hiện đủ 13 cột; mobile (≤640px) đổi thành 13 thanh ngang xếp dọc, không cần cuộn ngang. Giữ nguyên lưu ý về hai giai đoạn so sánh khác nhau.
- Lãi kép có 4 lựa chọn FRT/ANV/CAP/BMP; biểu đồ đường so sánh **vốn ban đầu 100tr (nét đứt) với giá trị theo từng mốc 5 năm**, điểm cuối đúng số tiền trong tài liệu; các mốc giữa (≈) tính theo tỷ lệ tăng gộp, không phải đường giá lịch sử. Các chồng tiền là minh họa trang trí. Minh họa lãi kép dựng bằng SVG theo phong cách thẻ 04 lớp tài sản (cột tăng dần, đường cong, 3 ô icon kính), có animation khi cuộn tới.
- 5 bước dạng từng bước trên đường lượn sóng ngang: chỉ hiện số và tên bước, rê chuột/focus/chạm vào bước để hiện thẻ chi tiết; vệt sáng chạy dọc đường, các nút số sáng lần lượt. Mobile: danh sách dọc, chạm để mở chi tiết.
- Chuyên gia chạy carousel một hàng; điều khiển bằng nút/chấm phân trang/bàn phím/swipe, tự chuyển 6 giây một lần và dừng khi hover/focus, ra khỏi màn hình hoặc giảm chuyển động. Mobile: ảnh ở trên, thông tin bên dưới.
- Nút Ⅱ ở góc trang tắt toàn bộ vòng lặp. Tôn trọng `prefers-reduced-motion`, dừng khi tab ẩn và section nằm ngoài màn hình.
- "4 nỗi đau phổ biến": nhãn viền, tiêu đề tô màu 3 chữ cuối, 4 thẻ có số tròn và minh hoạ người vẽ bằng SVG (`public/pain-art.js`), nhãn nổi quanh nhân vật trôi nhẹ; nội dung ở ô D8, mỗi thẻ một dòng `- Câu hỏi`. 4 cột desktop, 2 cột tablet, 1 cột mobile.
- Giải pháp: 4 đặc điểm chỉ hiện tiêu đề, bấm mới mở mô tả; quỹ đạo tự xoay liên tục và có hiệu ứng khi cuộn tới; thêm khối "02 hình thức đầu tư linh hoạt" (một box, chỉ hiển thị thông tin, nội dung sửa ở `FLEX_PLANS` trong `public/render.js`).
- Quỹ đạo mục tiêu dùng icon nét trong khung tròn kính (nhà, ô tô, tên lửa, hoàng hôn, mũ tốt nghiệp), mỗi mục tiêu một màu; trỏ/chọn thì tâm quỹ đạo hiện icon lớn.
- Form nhận tư vấn điền sẵn tên/SĐT/email khách đã nhập lần trước (localStorage, `public/storage.js`, chỉ lưu trên trình duyệt đó).
- So sánh với các kênh truyền thống: bảng trên desktop/tablet, mobile đổi thành thẻ theo từng tiêu chí.
- Các focus outline, selected state, radio và trạng thái lỗi không phụ thuộc riêng vào màu hoặc animation.

## Section 16: Thiết kế lộ trình đầu tư (bản v2)

Section gồm tiêu đề và mô tả (ô D16), khung video và nút **BẮT ĐẦU KHẢO SÁT** (mở `SURVEY.url` ở tab mới, hiện là https://test-admin.aichatbot.website/tich-san/suc-khoe-tai-chinh).

Video ở `VIDEO` trong `public/render.js`, tự host trong `public/video/` (không qua Google Drive) và tự đổi theo màn hình:

- `wide`: `video/lo-trinh-ngang.mp4` (1280×720, khung 16:9) cho máy tính / tablet;
- `tall`: `video/lo-trinh-doc.mp4` (720×1280, khung 9:16) cho điện thoại ≤640px.

Mỗi thiết bị chỉ tải video của mình; ảnh bìa `.jpg` cùng tên. File gốc (80–100MB) để trong `anh-goc/` (không lên GitHub). Khi có video mới, chép bản gốc vào `anh-goc/` rồi nén (cần ffmpeg):

```bash
ffmpeg -y -i "anh-goc/<bản ngang>.mp4" -vf "scale=1280:720:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 23 -maxrate 2200k -bufsize 4400k -profile:v high -level 4.0 -c:a aac -b:a 128k -ac 2 -movflags +faststart public/video/lo-trinh-ngang.mp4
ffmpeg -y -i "anh-goc/<bản dọc>.mp4" -vf "scale=720:1280:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 23 -maxrate 2200k -bufsize 4400k -profile:v high -level 4.0 -c:a aac -b:a 128k -ac 2 -movflags +faststart public/video/lo-trinh-doc.mp4
ffmpeg -y -ss 1 -i public/video/lo-trinh-ngang.mp4 -frames:v 1 -q:v 4 public/video/lo-trinh-ngang.jpg
ffmpeg -y -ss 1 -i public/video/lo-trinh-doc.mp4 -frames:v 1 -q:v 4 public/video/lo-trinh-doc.jpg
```

## SEO: HTML dựng sẵn (prerender)

`npm run build` chạy `scripts/prerender.mjs`: ghép nội dung các section (từ `public/content.json` qua `render.js`) vào thẳng `public/index.html`, nên Google, Facebook, Zalo, nền tảng quảng cáo đọc được nội dung mà không cần chạy JavaScript. `app.js` thấy `data-prerendered` thì chỉ gắn tương tác, không vẽ lại. Nội dung hiển thị giữ nguyên như bản chạy bằng JavaScript.

Script cũng sinh:

- trong `<head>`: description (câu giới thiệu ở hero), canonical, Open Graph / Twitter, JSON-LD `FinancialService` (tên, logo, tổng đài, email, 2 địa chỉ) và `FAQPage` (19 câu hỏi);
- `public/robots.txt` và `public/sitemap.xml`.

**Mỗi lần sửa `content.json` hoặc `render.js` cần chạy lại `npm run build`** (Vercel tự chạy khi deploy nhờ `buildCommand` trong `vercel.json`).

Tên miền dùng trong canonical / sitemap: biến môi trường `SITE_URL` (vd `https://tichsan.aas.com.vn`, đặt trong Vercel → Settings → Environment Variables). Không đặt thì dùng tên miền production Vercel, cuối cùng là link .vercel.app hiện tại.

## Tiếp nhận hồ sơ

- Nhận tư vấn: form chỉ gồm tên, số điện thoại, email (không còn chọn khung giờ); thành công hiện "ĐĂNG KÝ THÀNH CÔNG". API vẫn nhận `slot` nếu gửi (phải đúng 3 khung 9-11h / 13h-15h / 15h-18h).
- Dữ liệu lưu trong `data/requests.json`.
- API: `POST /api/requests` — loại `booking` (tên, số điện thoại, email) và loại `plan` từ công cụ lộ trình (thêm `purpose`: `advice` / `survey`, và `plan`: sản phẩm, mục tiêu hoặc chiến lược, các số liệu đã mô phỏng). Server xác thực dữ liệu và giới hạn số lần gửi theo IP.
- Bản trên Vercel / GitHub Pages là **bản demo tĩnh**, không có server nên hồ sơ **không được lưu**. Muốn lưu hồ sơ thật (hoặc đẩy về web sale / CRM) cần chạy `server.mjs` hoặc nối `POST /api/requests` sang hệ thống đó.
- `GET /api/admin/requests` cần `Authorization: Bearer <ADMIN_TOKEN>`, khóa tối thiểu 24 ký tự. Chưa dựng thêm trang quản trị riêng cho V2 vì không nằm trong sheet Landing page.
- Chưa tích hợp CRM, lịch làm việc thật hoặc gửi email. Đặt lịch là yêu cầu liên hệ, đăng ký là trạng thái tiếp nhận để chuyên gia xác nhận.
- Khi triển khai public: cấu hình HTTPS, `HOST`, `PORT`, `ADMIN_TOKEN`, sao lưu dữ liệu và dùng một tiến trình ghi file. Nếu chạy nhiều instance cần chuyển sang database. Rate limit hiện theo IP kết nối trực tiếp, cần đặt ở proxy nếu deploy sau reverse proxy.

## Ảnh

Toàn bộ ảnh runtime ở `public/images/`. Thay PNG đúng tên; xem bảng kích thước trong `public/images/README.md`. Không có trang kho ảnh riêng.

Ảnh chuyên gia vẫn là placeholder chữ viết tắt do nguồn livestream AAS chưa truy cập được từ môi trường triển khai. Cần thay bằng chân dung được duyệt. FAQ 07 trong Excel hiện là ghi chú đề xuất đường dẫn hướng dẫn nộp tiền; giữ nguyên câu chữ đó, chưa tự gán đường dẫn không được cung cấp.

## Kiểm tra

```powershell
npm install
npx playwright install chromium
npm test
npm run test:e2e
```

Playwright chạy server riêng ở **3102** và dữ liệu tạm riêng; không ghi hồ sơ thử vào server 3002. Có kiểm tra responsive 320/768/1024/1440px, ảnh, nguyên văn nội dung, các tương tác, báo cáo/đăng ký, lỗi API, giảm chuyển động và accessibility tự động.

Kết quả bàn giao: **6/6 kiểm tra unit/API và 14/14 kiểm tra E2E đạt**. Hai kiểm tra backtest xác nhận ảnh biểu đồ hiện đủ khung trên desktop/mobile (không cuộn ngang), có mô tả số liệu cho trình đọc màn hình và bấm vào mở popup ảnh lớn. Kiểm tra axe tự động không phát hiện vi phạm theo nhóm WCAG 2 A/AA, 2.1 AA trên trang chính và popup được kiểm tra. Đã xem hình render thực tế trên desktop/mobile. Chưa xác nhận bằng screen reader thực hoặc trên Safari/Firefox; kiểm tra tự động không thay thế đánh giá accessibility đầy đủ.

`npm run clean` xóa ảnh chụp test trong `test-results/`. Không xóa ảnh website hay hồ sơ khách hàng.

## Cấu trúc

```text
.
  .github/workflows/    Deploy GitHub Pages
  docs/Color.md         Bảng màu
  public/
    content.json        Nội dung nguyên văn trích từ Excel
    copy.js             Phân tích cấu trúc nội dung
    render.js           Giao diện các section
    domain.js           3 chiến lược AAS Gia sản, khung giờ liên hệ
    app.js              Điều phối tương tác và gửi yêu cầu
    motion.js/css       Vòng lặp, reveal, tilt, giảm chuyển động
    images/backtest-hieu-suat.png  Ảnh biểu đồ backtest (bấm để phóng to)
    styles.css          Bố cục, typography và responsive
    ui.js               Hàm render/định dạng dùng chung
    images/             Ảnh có thể thay theo tên
  server.mjs            Static server và API độc lập
  tests/                Unit/API và E2E
```
