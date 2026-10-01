# AAS Brand Color Guide --- AI-Readable

> Nguồn: **AAS Brand Identity Guidelines**.\
> Mục đích: cung cấp bảng màu và quy tắc sử dụng ở dạng Markdown để
> AI/code agent có thể đọc và áp dụng khi thiết kế UI, website,
> dashboard, slide hoặc tài liệu AAS.
>
> **Lưu ý:** Brand Manual thể hiện rõ vai trò màu nhưng bản PDF không
> cung cấp text máy đọc được cho mã HEX. Các HEX bên dưới là giá trị
> **xấp xỉ theo màu hiển thị trong Brand Manual**, không nên coi là
> thông số màu in ấn chính thức nếu chưa đối chiếu file thiết kế gốc.

------------------------------------------------------------------------

## 1. Core Brand Colors

  ------------------------------------------------------------------------------
  Token             Tên màu              HEX xấp xỉ Vai trò        Mức ưu tiên
  ----------------- ------------- ----------------- -------------- -------------
  `aas-deep-blue`   AAS Deep Blue         `#203567` Màu nhận diện  Primary
                                                    chính, logo,   
                                                    tiêu đề,       
                                                    navbar, nút    
                                                    chính          

  `aas-green`       AAS Green             `#8CC63F` Màu nhấn       Accent
                                                    thương hiệu,   
                                                    CTA, trạng     
                                                    thái tích cực, 
                                                    highlight      

  `aas-off-white`   AAS Off White         `#F1F7F3` Nền sáng phụ,  Secondary
                                                    card, vùng     
                                                    nghỉ thị giác  

  `aas-white`       White                 `#FFFFFF` Nền chính,     Neutral
                                                    logo đảo màu   

  `aas-black`       Black                 `#000000` Phiên bản logo Neutral
                                                    đơn sắc/nền    
                                                    đen            

  `aas-gold`        AAS Gold              `#D79537` Phiên bản nhận Special
                                                    diện           
                                                    Gold/premium   
  ------------------------------------------------------------------------------

### Ý nghĩa màu theo Brand Manual

-   **Deep Blue:** đại diện cho sự tin cậy, minh bạch, nền tảng vững
    chắc, chuyên nghiệp và ổn định.
-   **Green:** thể hiện năng lượng, tăng trưởng và tinh thần đổi mới.
-   Hệ màu bổ trợ giúp cân bằng tổng thể, tăng tính linh hoạt và tạo sự
    nhất quán trong các ứng dụng nhận diện.

------------------------------------------------------------------------

## 2. Extended Palette

Các màu dưới đây được xây dựng theo palette trực quan xuất hiện trong
trang `COLOR` của Brand Manual và dùng làm màu hỗ trợ.

  Token                  HEX xấp xỉ Gợi ý sử dụng
  -------------------- ------------ ----------------------------
  `aas-green-500`         `#8CC63F` Accent chính
  `aas-green-600`         `#669F3F` Hover / active green
  `aas-green-300`         `#B4CA82` Highlight nhẹ
  `aas-green-muted`       `#83AA83` Chart / data visualization
  `aas-sage`              `#A6C394` Background phụ
  `aas-sage-light`        `#C0D0C1` Surface / panel
  `aas-yellow-green`      `#C3C75C` Chart accent
  `aas-yellow`            `#E2C85F` Warning nhẹ / chart
  `aas-bronze`            `#A98531` Premium / chart
  `aas-orange`            `#D18B32` Data / status
  `aas-orange-light`      `#FFCA76` Highlight
  `aas-pink-light`        `#F6E5EC` Background phụ rất nhẹ

------------------------------------------------------------------------

## 3. Recommended UI Semantic Tokens

AI/code agent nên ưu tiên semantic token thay vì hard-code màu trực
tiếp.

  Semantic token                Giá trị đề xuất Dùng cho
  --------------------------- ----------------- --------------------------------
  `--color-primary`                   `#203567` Button chính, navbar, heading
  `--color-primary-hover`             `#17284F` Hover primary
  `--color-accent`                    `#8CC63F` CTA, selected state, icon nhấn
  `--color-accent-hover`              `#669F3F` Hover accent
  `--color-background`                `#FFFFFF` Background chính
  `--color-background-soft`           `#F1F7F3` Background phụ
  `--color-surface`                   `#FFFFFF` Card / modal / input
  `--color-text-primary`              `#203567` Heading / text quan trọng
  `--color-text-body`                 `#263238` Nội dung dài
  `--color-text-inverse`              `#FFFFFF` Text trên Deep Blue
  `--color-border`                    `#DDE5E1` Border nhẹ
  `--color-premium`                   `#D79537` Gold/premium

------------------------------------------------------------------------

## 4. Recommended Color Hierarchy

Khi AI tự thiết kế giao diện AAS, ưu tiên tỷ lệ thị giác:

-   **60--70%:** White / Off White
-   **20--30%:** Deep Blue
-   **5--10%:** AAS Green
-   **Gold:** chỉ dùng có chủ đích cho nội dung premium hoặc phiên bản
    nhận diện đặc biệt

Không biến Green thành màu nền chủ đạo của toàn giao diện. Deep Blue
phải giữ vai trò màu nhận diện chính.

------------------------------------------------------------------------

## 5. Logo Color Rules

### Nền Deep Blue

-   Logo/cụm chữ sử dụng **White**.
-   Có thể giữ yếu tố Green theo phiên bản chuẩn nếu đảm bảo tương phản.

### Nền sáng / Off White / White

-   Logo sử dụng **Deep Blue + AAS Green**.

### Nền Black

-   Dùng logo **White** cho phiên bản đơn sắc.
-   Phiên bản **Gold** có thể dùng trên nền Black.

### Phiên bản Gold

-   Gold trên nền Black hoặc nền White theo đúng biến thể nhận diện.
-   Không tự ý phối Gold với Green trong logo nếu không có mẫu chuẩn.

------------------------------------------------------------------------

## 6. AI Design Rules

Khi được yêu cầu tạo giao diện theo nhận diện AAS:

1.  Luôn dùng `AAS Deep Blue` làm màu thương hiệu chính.
2.  Dùng `AAS Green` làm accent, CTA hoặc điểm nhấn.
3.  Ưu tiên nền trắng hoặc Off White để giao diện sạch và chuyên nghiệp.
4.  Không thay đổi màu logo tùy ý.
5.  Không dùng gradient cho logo.
6.  Không đặt logo lên nền có độ tương phản kém.
7.  Không bóp méo, kéo giãn hoặc thay đổi tỷ lệ logo.
8.  Không dùng quá nhiều màu bổ trợ cùng lúc.
9.  Với dashboard tài chính, Deep Blue là màu cấu trúc; Green dành cho
    positive/growth/selected state.
10. Gold chỉ dùng cho phiên bản premium hoặc điểm nhấn đặc biệt.

------------------------------------------------------------------------

## 7. CSS Variables

``` css
:root {
  /* AAS Core */
  --aas-deep-blue: #203567;
  --aas-green: #8CC63F;
  --aas-off-white: #F1F7F3;
  --aas-white: #FFFFFF;
  --aas-black: #000000;
  --aas-gold: #D79537;

  /* UI */
  --color-primary: var(--aas-deep-blue);
  --color-primary-hover: #17284F;
  --color-accent: var(--aas-green);
  --color-accent-hover: #669F3F;

  --color-background: var(--aas-white);
  --color-background-soft: var(--aas-off-white);
  --color-surface: var(--aas-white);

  --color-text-primary: var(--aas-deep-blue);
  --color-text-body: #263238;
  --color-text-inverse: var(--aas-white);

  --color-border: #DDE5E1;
}
```

------------------------------------------------------------------------

## 8. Example AI Prompt

``` text
Thiết kế giao diện theo AAS Brand Identity.

Color system:
- Primary / Deep Blue: #203567
- Accent / Green: #8CC63F
- Soft Background: #F1F7F3
- White: #FFFFFF
- Premium Gold: #D79537

Rules:
- Deep Blue là màu nhận diện chính.
- Green chỉ dùng làm accent/CTA/highlight.
- Ưu tiên background trắng hoặc off-white.
- Giữ giao diện tài chính chuyên nghiệp, sạch, hiện đại.
- Không tự ý đổi màu hoặc tỷ lệ logo AAS.
- Không dùng quá nhiều màu bổ trợ cùng lúc.
```

------------------------------------------------------------------------

## 9. Machine-Readable Palette

``` yaml
brand: AAS
palette:
  primary:
    name: Deep Blue
    hex: "#203567"
    status: approximate_from_brand_manual
  accent:
    name: AAS Green
    hex: "#8CC63F"
    status: approximate_from_brand_manual
  secondary:
    name: Off White
    hex: "#F1F7F3"
    status: approximate_from_brand_manual
  neutral:
    white: "#FFFFFF"
    black: "#000000"
  special:
    gold: "#D79537"
    status: approximate_from_brand_manual

usage:
  primary: [logo, navbar, heading, primary_button]
  accent: [cta, selected_state, highlight, positive_state]
  secondary: [soft_background, card_background]
  gold: [premium, special_brand_variant]
```

------------------------------------------------------------------------

**Source:** AAS Brand Identity Guidelines --- Color, Logo Color
Variations & Brand Asset.
