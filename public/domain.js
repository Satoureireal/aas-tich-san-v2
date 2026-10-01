// Bốn chiến lược của gói AAS Gia sản (khối "Hình thức đầu tư linh hoạt" và tab Gia sản của công cụ lộ trình).
export const STRATEGIES = {
  breakthrough: { name: "Bứt phá", rate: 0.18 },
  growth: { name: "Tăng trưởng", rate: 0.15 },
  balanced: { name: "Cân bằng", rate: 0.12 },
  sustainable: { name: "Bền vững", rate: 0.1 },
};
// Khung giờ liên hệ API còn chấp nhận nếu có gửi kèm (form hiện không hỏi khung giờ).
export const TIME_SLOTS = ["9-11h", "13h-15h", "15h-18h"];

// Công cụ "Thiết kế lộ trình đầu tư" (theo file ke-hoach-muc-tieu.standalone.html).
// Tích sản: lợi suất cố định 12%/năm, lãi tháng danh nghĩa i = r/12.
// Gia sản: lợi suất theo chiến lược, lãi tháng quy đổi i = (1+r)^(1/12) - 1.
export const PLAN = {
  goals: ["Mua nhà", "Mua xe", "Du học", "Khởi nghiệp", "Hưu trí", "Đầu tư khác"],
  depositRate: 0.12,
  minDeposit: 200_000_000,
  minAlloc: 1_000_000_000,
  minYears: 1,
  maxYears: 30,
};

const monthlyRate = (rate, mode) => (mode === "effective" ? (1 + rate) ** (1 / 12) - 1 : rate / 12);

// Giá trị tài sản và vốn đã góp cuối mỗi năm (năm 0 → năm cuối), dùng cho biểu đồ.
function yearly(initial, monthly, months, i) {
  const series = [{ year: 0, value: initial, capital: initial }];
  let value = initial;
  for (let m = 1; m <= months; m++) {
    value = value * (1 + i) + monthly;
    if (m % 12 === 0 || m === months) series.push({ year: m / 12, value, capital: initial + monthly * m });
  }
  return series;
}

/** Tích sản: số tiền cần nạp mỗi tháng để đạt mục tiêu. PMT = (FV - P0·(1+i)^n) / (((1+i)^n - 1) / i) */
export function planDeposit({ initial, target, years }) {
  const months = Math.round(years * 12);
  const i = monthlyRate(PLAN.depositRate);
  const growth = (1 + i) ** months;
  const monthly = Math.max(0, (target - initial * growth) / ((growth - 1) / i));
  const capital = initial + monthly * months;
  const final = initial * growth + monthly * ((growth - 1) / i);
  return { months, monthly, capital, profit: final - capital, final, series: yearly(initial, monthly, months, i) };
}

/** Gia sản: vốn khởi điểm cần có hôm nay. P0 = FV / (1+i)^n */
export function planAlloc({ target, years, rate }) {
  const months = Math.round(years * 12);
  const i = monthlyRate(rate, "effective");
  const initial = target / (1 + i) ** months;
  return { months, initial, profit: target - initial, final: target, series: yearly(initial, 0, months, i) };
}

// Điều kiện tham gia: trả về câu báo lỗi (chuỗi rỗng nếu hợp lệ).
const yearsError = (years) =>
  !Number.isFinite(years) || years < PLAN.minYears || years > PLAN.maxYears
    ? `Thời gian đầu tư từ ${PLAN.minYears} đến ${PLAN.maxYears} năm.`
    : "";
export function checkDeposit({ initial, target, years }) {
  if (!(initial >= PLAN.minDeposit)) return "Vốn ban đầu tối thiểu 200 triệu đồng.";
  if (!(target > initial)) return "Số tiền mục tiêu cần lớn hơn vốn ban đầu.";
  const error = yearsError(years);
  if (error) return error;
  if (planDeposit({ initial, target, years }).monthly <= 0)
    return "Vốn ban đầu đã đủ đạt mục tiêu này mà không cần nạp thêm. Hãy đặt mục tiêu lớn hơn.";
  return "";
}
export function checkAlloc({ capital, target, years, rate }) {
  if (!(capital >= PLAN.minAlloc)) return "Vốn dự định đầu tư tối thiểu 1 tỷ đồng.";
  if (!(target > 0)) return "Vui lòng nhập số tiền mục tiêu.";
  const error = yearsError(years);
  if (error) return error;
  if (planAlloc({ target, years, rate }).initial < PLAN.minAlloc)
    return "Mục tiêu này cần vốn khởi điểm dưới 1 tỷ đồng. Hãy tăng số tiền mục tiêu hoặc rút ngắn thời gian.";
  return "";
}
