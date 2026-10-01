// Lưu thông tin liên hệ khách đã nhập ngay trên trình duyệt này (localStorage) để lần sau điền sẵn.
// Không gửi đi đâu; trình duyệt chặn lưu trữ (chế độ riêng tư…) thì trang vẫn chạy bình thường.
const KEY = "aas-tich-san:v1";

export function loadSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function saveState(patch) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...loadSaved(), ...patch, savedAt: Date.now() }),
    );
  } catch {
    // Không lưu được thì bỏ qua.
  }
}

