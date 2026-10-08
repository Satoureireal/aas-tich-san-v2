# Ảnh V2 — thay file cùng tên

Chỉ cần ghi đè file đúng tên và đúng định dạng (PNG/JPG) dưới đây rồi tải lại bằng **Ctrl + F5**.

| Tên file | Vị trí | Kích thước khuyến nghị (rộng × cao) |
|---|---|---|
| `bieu-tuong.png` | Biểu tượng tab trình duyệt (favicon) | vuông, tối thiểu 180 × 180 |
| `hero-banner.jpg` | Hero desktop/tablet (chữ nằm sẵn trong ảnh) | 2500 × 1000 (5:2), JPG |
| `hero-banner-mobile.jpg` | Hero mobile (≤640px), 2 CTA đặt giữa vùng trời | 1080 × 1441 (3:4), JPG ≤ 300KB |
| `noi-dau-01.webp` … `noi-dau-04.webp` | Ảnh người ở 4 thẻ "4 nỗi đau phổ biến" (01 → 04 theo thứ tự thẻ). Thiếu file nào thì thẻ đó hiện hình vẽ | Vuông 800 × 800, WebP nền trong suốt (≈40KB); người đặt giữa-dưới khung |
| `logo-aas.png` | Logo header/footer | 888 × 315; bản gốc hiện tại 296 × 105 |
| `chuyen-gia-<tên-không-dấu>.webp` (vd `chuyen-gia-ngo-thi-thuy-linh.webp`, `chuyen-gia-hoang-anh-nhat.webp`) | Ảnh chuyên gia (cắt tròn), tên file theo tên đầy đủ trong ô D17 bỏ danh xưng (Ông/Bà/TS.). Thêm ảnh mới thì thêm tên vào `PORTRAITS` trong `render.js`; ai chưa có ảnh hiện chữ viết tắt. Ảnh gốc ở `anh-goc/` | Vuông 480 × 480, khuôn mặt ở giữa, WebP |

Chân dung hiện là placeholder chữ viết tắt; thay bằng ảnh chính thức với khuôn mặt gần giữa khung. Ảnh hero có các lớp 3D nằm phía trước, nên tránh đặt chữ quan trọng ở phần dưới/phải.

Đồng tiền, các cột 3D, tháp quản trị, icon mục tiêu, minh hoạ lãi kép và biểu đồ mô phỏng là CSS/SVG động. Giữ chúng trong code để còn tương tác. Biểu đồ backtest là ảnh `backtest-hieu-suat.png` (thiết kế sẵn, 3788 × 2042): muốn đổi số liệu thì xuất lại ảnh và sửa luôn phần mô tả chữ (figcaption trong `render.js`, alt trong `index.html`).

