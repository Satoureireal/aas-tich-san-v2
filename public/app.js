import { $, $$, escape, arrow } from "./ui.js";
import { parseCopy } from "./copy.js";
import { renderPage } from "./render.js";
import { initMotion, motionEnabled } from "./motion.js";
import { loadSaved, saveState } from "./storage.js";

let context,
  copyData,
  returnFocus,
  submitting = false;
const dialog = $("#contact-dialog");

// Bản demo tĩnh (GitHub Pages, Vercel, hoặc thêm ?demo=static khi chạy local): không có server,
// nên form được xử lý ngay trên trình duyệt và KHÔNG gửi dữ liệu đi đâu.
const STATIC_DEMO =
  location.hostname.endsWith("github.io") ||
  location.hostname.endsWith("vercel.app") ||
  new URLSearchParams(location.search).get("demo") === "static";

async function post(path, payload) {
  if (STATIC_DEMO) return { id: crypto.randomUUID() };
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Chưa gửi được yêu cầu. Vui lòng thử lại.");
  return data;
}

// Popup nhận tư vấn: tên, số điện thoại, email.
function openContact() {
  if (submitting) return;
  context = { kind: "booking" };
  returnFocus = document.activeElement;
  closeMenu();
  $("#contact-title").textContent = copyData.bookingTitle;
  $("#contact-intro").hidden = true;
  $("#name-label").textContent = "Tên của bạn";
  $("#contact-name").placeholder = "Tên của bạn";
  $("#contact-phone").placeholder = "Nhập số điện thoại";
  $("#contact-email").placeholder = "Nhập email";
  $("#contact-submit").innerHTML = `<span>NHẬN TƯ VẤN</span>${arrow}`;
  // Điền sẵn thông tin liên hệ đã dùng lần trước (chỉ vào ô còn trống).
  const saved = loadSaved().contact ?? {};
  for (const field of ["name", "phone", "email"]) {
    const input = $(`#contact-${field}`);
    if (!input.value && typeof saved[field] === "string") input.value = saved[field];
  }
  $("#contact-form").hidden = false;
  $("#contact-success").hidden = true;
  $("#contact-error").textContent = "";
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeMenu() {
  $("#navigation").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
}
$("#menu-toggle").addEventListener("click", () => {
  const open = $("#navigation").classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
});
$("#navigation").addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-book]")) openContact();
  if (event.target.closest("[data-close]") && !submitting)
    event.target.closest("dialog").close();
});
$$("dialog").forEach((element) => {
  element.addEventListener("cancel", (event) => {
    if (submitting) event.preventDefault();
  });
  element.addEventListener("click", (event) => {
    if (event.target !== element || submitting) return;
    const bounds = element.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      element.close();
  });
  element.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    returnFocus?.focus();
  });
});

$("#contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting) return;
  const form = new FormData(event.currentTarget);
  const payload = {
    ...context,
    name: form.get("name").trim(),
    phone: form.get("phone").trim(),
    email: form.get("email").trim(),
  };
  const submit = $("#contact-submit");
  submitting = true;
  submit.disabled = true;
  submit.setAttribute("aria-busy", "true");
  dialog.querySelector("[data-close]").disabled = true;
  $("#contact-error").textContent = "";
  try {
    await post("/api/requests", payload);
    saveState({ contact: { name: payload.name, phone: payload.phone, email: payload.email } });
    $("#contact-form").hidden = true;
    $("#contact-title").textContent = "ĐĂNG KÝ THÀNH CÔNG";
    $("#contact-success").hidden = false;
    $("#contact-success").innerHTML =
      `<span class="success-check" aria-hidden="true">✓</span><p>Chuyên gia của chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất!</p>`;
    $("#contact-success").focus();
    event.target.reset();
  } catch (error) {
    $("#contact-error").textContent =
      error.name === "TimeoutError"
        ? "Kết nối quá thời gian. Vui lòng thử lại."
        : error.message;
  } finally {
    submitting = false;
    submit.disabled = false;
    submit.removeAttribute("aria-busy");
    dialog.querySelector("[data-close]").disabled = false;
  }
});

// Mã QR ở footer: chưa có file ảnh thì bỏ thẻ ảnh, giữ ô chờ.
$$(".footer-app .qr img").forEach((img) => {
  if (img.complete && !img.naturalWidth) img.remove();
  else img.addEventListener("error", () => img.remove(), { once: true });
});

// Footer: đăng ký nhận bản tin AAS Research (bản demo không gửi đi đâu).
$("#newsletter-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = $("#newsletter-email");
  const status = $("#newsletter-status");
  const button = $("button", event.currentTarget);
  status.classList.remove("is-error");
  if (!input.checkValidity() || !input.value.trim()) {
    status.textContent = "Vui lòng nhập email đúng định dạng.";
    status.classList.add("is-error");
    input.focus();
    return;
  }
  button.disabled = true;
  try {
    await post("/api/requests", { kind: "newsletter", email: input.value.trim() });
    status.textContent = "Cảm ơn bạn! AAS sẽ gửi bản tin phân tích mới nhất tới email của bạn.";
    input.value = "";
  } catch (error) {
    status.textContent = error.name === "TimeoutError" ? "Kết nối quá thời gian. Vui lòng thử lại." : error.message;
    status.classList.add("is-error");
  } finally {
    button.disabled = false;
  }
});

// Adds .is-revealed once the element is in view, so CSS can play its entrance sequence.
function revealOnce(element, threshold) {
  if (!("IntersectionObserver" in window)) {
    element.classList.add("is-revealed");
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      element.classList.add("is-revealed");
      observer.disconnect();
    },
    { threshold },
  );
  observer.observe(element);
}

function interactions(c) {
  const goalButtons = $$("[data-orbit-goal]");
  let selectedGoal = -1;
  function showOrbitGoal(goal) {
    // Tâm quỹ đạo hiện icon lớn của mục tiêu đang trỏ/chọn.
    const icon = $("#orbit-image");
    const active = goal >= 0 && goal < goalButtons.length;
    if (active) {
      $("svg", icon).innerHTML = $(".goal-icon svg", goalButtons[goal]).innerHTML;
      icon.style.setProperty("--accent", goalButtons[goal].style.getPropertyValue("--accent"));
    }
    icon.hidden = !active;
    $(".orbit-center").classList.toggle("has-goal", active);
    $("#orbit-goal").textContent = active
      ? goalButtons[goal].textContent.trim()
      : "Mục tiêu tài chính";
  }
  goalButtons.forEach((button, index) => {
    button.addEventListener("mouseenter", () => showOrbitGoal(index));
    button.addEventListener("focus", () => showOrbitGoal(index));
    for (const event of ["mouseleave", "blur"])
      button.addEventListener(event, () => showOrbitGoal(selectedGoal));
    button.addEventListener("click", () => {
      selectedGoal = selectedGoal === index ? -1 : index;
      goalButtons.forEach((item, idx) =>
        item.setAttribute("aria-pressed", String(idx === selectedGoal)),
      );
      showOrbitGoal(selectedGoal === -1 ? index : selectedGoal);
    });
  });
  // Nhãn nổi (Cổ phiếu, BĐS…): đo chữ thật rồi đặt độ rộng khung cho đều lề hai bên.
  const fitChips = (root) =>
    $$(".art-chip", root).forEach((chip) => {
      const width = $("text", chip).getComputedTextLength();
      if (width) $("rect", chip).setAttribute("width", (width + 25 + 13).toFixed(1));
    });
  $$(".pain-art").forEach(fitChips);
  document.fonts?.ready.then(() => $$(".pain-art, .pain-overlay").forEach(fitChips));
  // Ảnh người của thẻ nỗi đau: tải được thì thay hình vẽ, không có file thì bỏ thẻ ảnh, giữ hình vẽ.
  $$(".pain-photo").forEach((photo) => {
    const show = () => {
      photo.closest(".pain-visual").classList.add("has-photo");
      fitChips(photo.closest(".pain-visual"));
    };
    if (photo.complete && photo.naturalWidth) show();
    else {
      photo.addEventListener("load", show, { once: true });
      photo.addEventListener("error", () => photo.remove(), { once: true });
    }
  });
  // The feature boxes appear one after another once the section is in view.
  revealOnce($(".solution-grid"), 0.3);
  const stage = $(".orbit-stage");
  $$("[data-tilt]").forEach((surface) => {
    const reset = () => {
      surface.style.setProperty("--tilt-x", "0deg");
      surface.style.setProperty("--tilt-y", "0deg");
      surface.style.transform = "";
    };
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;
      surface.style.setProperty("--tilt-x", `${rotateX}deg`);
      surface.style.setProperty("--tilt-y", `${rotateY}deg`);
      surface.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    surface.addEventListener("pointerleave", reset);
    surface.addEventListener("pointercancel", reset);
    surface.addEventListener("blur", reset);
  });
  // 03 tầng quản trị: tầng đang chọn và thẻ của nó được làm nổi bật, tự chuyển lần lượt.
  const layerButtons = $$("[data-layer]");
  const layerPanels = layerButtons.map((button) => $(`#${button.getAttribute("aria-controls")}`));
  function selectLayer(target) {
    layerButtons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === target));
      layerPanels[index].classList.toggle("is-active", index === target);
      $(`.pyr-tier-${index}`)?.classList.toggle("is-active", index === target);
      $(`[data-link="${index}"]`)?.classList.toggle("is-active", index === target);
    });
  }
  // Đường nối từ từng tầng tháp tới thẻ của nó. Tính bằng offset (không bị lệch bởi hiệu ứng trượt),
  // vẽ lại mỗi khi khung đổi kích thước. Thẻ nằm bên phải: đường cong ngang;
  // thẻ xếp bên dưới (mobile): đường đi dọc mép trái rồi rẽ vào thẻ.
  const pyramid = $(".governance .pyramid");
  const pyramidFrame = $(".pyramid-art", pyramid);
  const links = $$(".pyr-link", pyramid);
  const offsetIn = (element) => {
    let [x, y] = [0, 0];
    for (let node = element; node && node !== pyramid; node = node.offsetParent)
      [x, y] = [x + node.offsetLeft, y + node.offsetTop];
    return [x, y];
  };
  function drawLinks() {
    const svg = $(".pyr-links", pyramid);
    svg.setAttribute("viewBox", `0 0 ${pyramid.clientWidth} ${pyramid.clientHeight}`);
    const scale = pyramidFrame.clientWidth / 400;
    const frame = offsetIn(pyramidFrame);
    const stacked = offsetIn(layerPanels[0])[1] >= frame[1] + pyramidFrame.offsetHeight - 1;
    pyramid.classList.toggle("links-stacked", stacked);
    links.forEach((link, index) => {
      const tier = $(`.pyr-tier-${index}`, pyramid);
      const [ax, ay] = tier.dataset[stacked ? "anchorLeft" : "anchorRight"].split(",").map(Number);
      const start = [frame[0] + ax * scale, frame[1] + ay * scale];
      const panel = layerPanels[index];
      const [px, py] = offsetIn(panel);
      const end = [px, py + panel.offsetHeight / 2];
      let d;
      if (stacked) {
        const rail = Math.max(6, end[0] - 12);
        const r = Math.min(14, (end[1] - start[1]) / 2);
        d = `M${start[0]},${start[1]} H${rail + r} Q${rail},${start[1]} ${rail},${start[1] + r} V${end[1] - r} Q${rail},${end[1]} ${rail + r},${end[1]} H${end[0]}`;
      } else {
        const bend = start[0] + (end[0] - start[0]) * 0.55;
        d = `M${start[0]},${start[1]} C${bend},${start[1]} ${bend},${end[1]} ${end[0]},${end[1]}`;
      }
      $$("path", link).forEach((element) => element.setAttribute("d", d));
      const [dot, tip] = $$("circle", link);
      dot.setAttribute("cx", start[0]);
      dot.setAttribute("cy", start[1]);
      tip.setAttribute("cx", end[0]);
      tip.setAttribute("cy", end[1]);
    });
  }
  new ResizeObserver(drawLinks).observe(pyramid);
  drawLinks();
  let layerTimer;
  function scheduleLayer() {
    clearInterval(layerTimer);
    layerTimer = setInterval(() => {
      if (
        !motionEnabled() ||
        !$(".governance").classList.contains("is-revealed") ||
        !$(".governance .pyramid").classList.contains("is-visible") ||
        $(".governance .pyramid").matches(":hover,:focus-within")
      )
        return;
      const current = layerButtons.findIndex(
        (item) => item.getAttribute("aria-pressed") === "true",
      );
      selectLayer((current + 1) % layerButtons.length);
    }, 3800);
  }
  layerButtons.forEach((button, index) => {
    const pick = () => {
      selectLayer(index);
      scheduleLayer();
    };
    button.addEventListener("click", pick);
    layerPanels[index].addEventListener("mouseenter", pick);
  });
  scheduleLayer();
  // Kim tự tháp dựng dần từ đáy lên khi khối quản trị vào màn hình.
  revealOnce($(".governance"), 0.25);
  // Minh hoạ lãi kép: cột mọc lên, đường cong vẽ ra rồi các ô icon sáng lần lượt.
  revealOnce($(".compound-art"), 0.3);
  // Hình thức đầu tư linh hoạt: ô mục tiêu và ô chiến lược tự sáng lần lượt từ trái sang phải
  // (giống trạng thái rê chuột); dừng khi khách rê chuột / focus vào hàng đó hoặc khối chưa hiện trên màn hình.
  $$(".plan-goals, .plan-strategies").forEach((list) => {
    const items = $$("li", list);
    let index = -1;
    setInterval(() => {
      if (!motionEnabled() || !list.closest("#solution").classList.contains("is-visible") || list.matches(":hover,:focus-within")) return;
      index = (index + 1) % items.length;
      items.forEach((item, i) => item.classList.toggle("is-auto", i === index));
    }, 1600);
    list.addEventListener("mouseenter", () => items.forEach((item) => item.classList.remove("is-auto")));
  });
  $$("[data-zoom-backtest]").forEach((button) =>
    button.addEventListener("click", () => {
      returnFocus = document.activeElement;
      $("#image-dialog").showModal();
      document.body.classList.add("dialog-open");
    }),
  );
  const finalAmounts = [816, 1776, 10437, 4982];
  // Đường minh hoạ lãi kép: 100tr tăng đều theo tỷ lệ gộp để đúng bằng số cuối kỳ trong tài liệu
  // (không phải đường giá lịch sử). Chấm tại mỗi mốc 5 năm; vốn ban đầu là đường nét đứt ngang.
  const shortMoney = (million) =>
    million >= 1000
      ? `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: million >= 10000 ? 1 : 2 }).format(million / 1000)} tỷ`
      : `${Math.round(million)}tr`;
  let stockDrawn = null;
  function drawStockChart(final, years) {
    stockDrawn = [final, years];
    const svg = $("#stock-chart");
    const width = Math.max(300, Math.round(svg.clientWidth) || 760);
    const height = width < 520 ? 190 : 210;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const [left, right, top, bottom] = [44, width - 14, 26, height - 32];
    const growth = (final / 100) ** (1 / years);
    const value = (t) => 100 * growth ** t;
    const maximum = final * 1.12;
    const x = (t) => left + (t / years) * (right - left);
    const y = (v) => bottom - (v / maximum) * (bottom - top);
    const steps = 48;
    const line = Array.from({ length: steps + 1 }, (_, i) => {
      const t = (i / steps) * years;
      return `${i ? "L" : "M"}${x(t).toFixed(1)},${y(value(t)).toFixed(1)}`;
    }).join(" ");
    $(".stock-value", svg).setAttribute("d", line);
    $(".stock-area", svg).setAttribute("d", `${line} L${right},${bottom} L${left},${bottom}Z`);
    $(".stock-capital", svg).setAttribute("d", `M${left},${y(100).toFixed(1)} H${right}`);
    $(".stock-grid", svg).innerHTML = [1, 2, 3]
      .map((k) => {
        const gy = bottom - (k / 3) * (bottom - top);
        return `<path d="M${left} ${gy.toFixed(1)}H${right}"/><text x="${left - 6}" y="${(gy + 4).toFixed(1)}" text-anchor="end">${shortMoney((maximum * k) / 3)}</text>`;
      })
      .join("");
    const marks = Array.from({ length: years / 5 }, (_, i) => (i + 1) * 5);
    $(".stock-marks", svg).innerHTML = marks
      .map((t) => {
        const last = t === years;
        return `<circle cx="${x(t).toFixed(1)}" cy="${y(value(t)).toFixed(1)}" r="${last ? 5 : 3.5}" class="${last ? "is-last" : ""}"/><text x="${x(t).toFixed(1)}" y="${(y(value(t)) - 10).toFixed(1)}" text-anchor="${last ? "end" : "middle"}" class="${last ? "is-last" : ""}">${last ? shortMoney(final) : `≈${shortMoney(value(t))}`}</text>`;
      })
      .join("");
    $(".stock-axis", svg).innerHTML = [0, ...marks]
      .map((t, i, all) => `<text x="${x(t).toFixed(1)}" y="${bottom + 20}" text-anchor="${i === 0 ? "start" : i === all.length - 1 ? "end" : "middle"}">${t === 0 ? "Năm 0" : `Năm ${t}`}</text>`)
      .join("");
  }
  const multiple = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
  const stockBox = $(".stock-comparison");
  const stockDots = $$("[data-stock]");
  let stockIndex = 0;
  function showStock(index, animate) {
    const stock = c.compound.stocks[index];
    stockIndex = index;
    stockDots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === index)));
    $("#stock-name").textContent = stock[0];
    $("#stock-period").textContent = stock[1];
    $("#stock-rate").textContent = stock[2];
    $("#stock-multiple").textContent = `×${multiple.format(finalAmounts[index] / 100)} lần`;
    $("#stock-final").textContent = stock[3].split("→")[1].trim();
    drawStockChart(finalAmounts[index], Number(stock[1].match(/\d+/)[0]));
    if (animate && motionEnabled()) {
      $("#stock-chart .stock-value").animate(
        [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: 900, easing: "cubic-bezier(.3,.6,.2,1)" },
      );
      for (const el of $$(".stock-caption, .stock-rate, .stock-legend b, .stock-marks"))
        el.animate([{ opacity: 0, translate: "0 6px" }, { opacity: 1, translate: "0 0" }], {
          duration: 450,
          easing: "ease-out",
        });
    }
  }
  // Tự chuyển lần lượt các cổ phiếu: thanh tiến trình của chấm đang chọn là bộ đếm giờ,
  // nên nó tự dừng khi rê chuột/focus, khi khung ra khỏi màn hình hoặc khi tắt chuyển động.
  stockDots.forEach((dot, index) => {
    dot.addEventListener("click", () => showStock(index, true));
    $("i", dot).addEventListener("animationend", (event) => {
      if (
        event.animationName === "stock-progress" &&
        dot.getAttribute("aria-pressed") === "true"
      )
        showStock((index + 1) % stockDots.length, true);
    });
  });
  showStock(0, false);
  new ResizeObserver(() => stockDrawn && drawStockChart(...stockDrawn)).observe($("#stock-chart"));
  const faqItems = $$(".faq-item");
  const faqAnswer = $("#faq-answer");
  const wide = matchMedia("(min-width: 1025px)");
  // Desktop: câu trả lời của câu đang mở hiện ở khung bên phải.
  const showAnswer = () => {
    const open = faqItems.find((item) => item.open);
    faqAnswer.innerHTML = open
      ? `<p class="faq-answer-q">${escape($("summary [data-source]", open).textContent)}</p>${$("p", open).outerHTML}`
      : "";
  };
  faqItems.forEach((item) =>
    item.addEventListener("toggle", () => {
      if (item.open) faqItems.forEach((other) => other !== item && (other.open = false));
      else if (wide.matches && !faqItems.some((other) => other.open)) item.open = true;
      showAnswer();
    }),
  );
  const ensureFaq = () => {
    if (wide.matches && !faqItems.some((item) => item.open)) faqItems[0].open = true;
    showAnswer();
  };
  ensureFaq();
  wide.addEventListener("change", ensureFaq);
  // Desktop: tự chuyển lần lượt câu 01 → 02 → 03… (mỗi câu 4,9 giây), hết thì quay lại câu 01.
  // Dừng khi rê chuột/focus vào khu FAQ, khi section ngoài màn hình hoặc khi tắt chuyển động;
  // người dùng tự bấm chọn câu thì nghỉ 12 giây rồi mới chạy tiếp từ câu đó.
  const faqList = $("#faq-list");
  const FAQ_INTERVAL = 4900;
  let faqVisible = false,
    faqPauseUntil = 0,
    faqAutoOpen = false;
  if ("IntersectionObserver" in window)
    new IntersectionObserver((entries) => {
      faqVisible = entries[0].isIntersecting;
    }, { threshold: 0.3 }).observe(faqList);
  faqList.addEventListener("click", () => {
    if (!faqAutoOpen) faqPauseUntil = performance.now() + 12000;
  });
  setInterval(() => {
    if (
      !wide.matches ||
      !faqVisible ||
      !motionEnabled() ||
      performance.now() < faqPauseUntil ||
      $(".faq-layout").matches(":hover, :focus-within")
    )
      return;
    const current = faqItems.findIndex((item) => item.open);
    const next = faqItems[(current + 1) % faqItems.length];
    faqAutoOpen = true;
    next.open = true;
    faqAutoOpen = false;
    // Giữ câu đang mở trong tầm nhìn của khung danh sách (chỉ cuộn khung, không cuộn trang).
    const top = next.offsetTop - faqList.offsetTop;
    if (top < faqList.scrollTop || top + next.offsetHeight > faqList.scrollTop + faqList.clientHeight)
      faqList.scrollTo({ top: Math.max(0, top - faqList.clientHeight / 3), behavior: "smooth" });
  }, FAQ_INTERVAL);
  // Mobile/tablet: ẩn bớt, bấm "Xem thêm" để hiện đủ danh sách.
  $("#faq-more").addEventListener("click", (event) => {
    const expanded = $("#faq-list").classList.toggle("is-expanded");
    event.currentTarget.setAttribute("aria-expanded", String(expanded));
    event.currentTarget.textContent = expanded ? "Thu gọn" : `Xem thêm ${faqItems.length - 6} câu hỏi`;
    if (!expanded) $("#faq").scrollIntoView({ block: "start", behavior: motionEnabled() ? "smooth" : "instant" });
  });
  // 5 bước: chạm/bấm nút số để mở chi tiết (mỗi lần một bước); Esc hoặc bấm ra ngoài để đóng.
  const stepNodes = $$(".step-node");
  function openStep(target) {
    stepNodes.forEach((node) => {
      const open = node === target;
      node.classList.toggle("is-open", open);
      $(".step-token", node).setAttribute("aria-expanded", String(open));
    });
  }
  stepNodes.forEach((node) =>
    $(".step-token", node).addEventListener("click", () =>
      openStep(node.classList.contains("is-open") ? null : node),
    ),
  );
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".step-node")) openStep(null);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") openStep(null);
  });
  // Box đặc điểm giải pháp: bấm/chạm (hoặc Enter/Space) để mở mô tả, mỗi lần một box.
  const featureCards = $$(".feature-card");
  const toggleFeature = (card) => {
    const open = !card.classList.contains("is-open");
    featureCards.forEach((other) => {
      other.classList.toggle("is-open", other === card && open);
      other.setAttribute("aria-expanded", String(other === card && open));
    });
  };
  featureCards.forEach((card) => {
    card.addEventListener("click", () => toggleFeature(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleFeature(card);
    });
  });
  $$(".portrait img").forEach((img) => {
    if (img.complete && !img.naturalWidth) img.remove();
    else img.addEventListener("error", () => img.remove(), { once: true });
  });
  const track = $("#experts-track");
  const cards = $$(".expert-card", track);
  const dots = $$("[data-expert-dot]");
  // Bước dịch = khoảng cách giữa 2 thẻ; chấm phân trang theo vị trí cuộn.
  const cardStep = () => cards[1].offsetLeft - cards[0].offsetLeft;
  function syncDots() {
    const first = Math.round(track.scrollLeft / cardStep());
    const shown = Math.max(1, Math.round(track.clientWidth / cardStep()));
    dots.forEach((dot, index) => {
      dot.setAttribute("aria-pressed", String(index === first));
      dot.classList.toggle("in-view", index > first && index < first + shown);
    });
  }
  let dotFrame = 0;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(dotFrame);
    dotFrame = requestAnimationFrame(syncDots);
  }, { passive: true });
  dots.forEach((dot, index) =>
    dot.addEventListener("click", () =>
      track.scrollTo({ left: index * cardStep(), behavior: motionEnabled() ? "smooth" : "instant" }),
    ),
  );
  syncDots();
  function moveCarousel(direction) {
    const distance = cardStep();
    const atEnd =
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    const left =
      direction > 0 && atEnd
        ? 0
        : Math.max(0, track.scrollLeft + distance * direction);
    track.scrollTo({ left, behavior: motionEnabled() ? "smooth" : "instant" });
  }
  $$("[data-carousel]").forEach((button) =>
    button.addEventListener("click", () => {
      moveCarousel(Number(button.dataset.carousel));
    }),
  );
  track.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      moveCarousel(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  setInterval(() => {
    if (
      motionEnabled() &&
      $("#experts").classList.contains("is-visible") &&
      !track.matches(":hover,:focus-within") &&
      !$(".carousel-nav").matches(":hover,:focus-within")
    )
      moveCarousel(1);
  }, 6000);
}

// Hoạ tiết nền parallax: trượt chậm hơn nội dung khi cuộn (chuỗi chữ "A" chậm, đồng xu nhanh hơn
// và xoay nhẹ). Tính theo vị trí section so với giữa màn hình; tắt khi giảm chuyển động.
function initParallax() {
  const items = $$(".bd-item").map((item) => {
    const type = item.firstElementChild?.classList[0];
    return { item, section: item.closest("section"), speed: type === "bd-band" ? 0.12 : 0.22, spin: type === "bd-coin" ? 0.06 : 0 };
  });
  if (!items.length) return;
  let queued = false;
  function update() {
    queued = false;
    const center = innerHeight / 2;
    for (const { item, section, speed, spin } of items) {
      const box = section.getBoundingClientRect();
      if (box.bottom < -200 || box.top > innerHeight + 200) continue;
      const offset = motionEnabled() ? box.top + box.height / 2 - center : 0;
      item.style.setProperty("--py", `${(offset * speed).toFixed(1)}px`);
      if (spin) item.style.setProperty("--pr", `${(offset * spin).toFixed(1)}deg`);
    }
  }
  const schedule = () => {
    if (!queued) requestAnimationFrame(update);
    queued = true;
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  update();
}

try {
  const response = await fetch("content.json");
  if (!response.ok) throw new Error("Không tải được nội dung.");
  const { cells } = await response.json();
  copyData = parseCopy(cells);
  // Bản dựng sẵn (npm run build) đã có HTML các section cho SEO: chỉ gắn tương tác, không vẽ lại.
  if (!$("#main").hasAttribute("data-prerendered")) {
    $("#main").innerHTML = renderPage(copyData);
    $(".header-book").innerHTML =
      `<span data-source="B2">${escape(copyData.bookingTitle)}</span>${arrow}`;
  }
  interactions(copyData);
  initMotion();
  initParallax();
  if (location.hash) {
    requestAnimationFrame(() =>
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ behavior: "instant" }),
    );
  }
} catch (error) {
  // Bản dựng sẵn vẫn còn nội dung đầy đủ: chỉ báo lỗi ra console, không xoá trang.
  if ($("#main").hasAttribute("data-prerendered")) throw error;
  $("#main").innerHTML =
    `<div class="wrap section"><p class="error" role="alert">${escape(error.message)}</p><button class="cta" id="reload">Tải lại</button></div>`;
  $("#reload").addEventListener("click", () => location.reload());
}
