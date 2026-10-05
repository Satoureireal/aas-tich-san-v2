import http from "node:http";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { TIME_SLOTS, PLAN, STRATEGIES } from "./public/domain.js";

const root = dirname(fileURLToPath(import.meta.url));
const publicRoot = resolve(root, "public");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".md": "text/plain; charset=utf-8",
};

export function validateContact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Vui lòng kiểm tra thông tin.");
  // Đăng ký nhận bản tin ở footer: chỉ cần email.
  if (input.kind === "newsletter") {
    const email = typeof input.email === "string" ? input.email.trim() : "";
    if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("Email chưa đúng định dạng.");
    return { kind: "newsletter", email };
  }
  const fields = {};
  for (const [key, max] of [
    ["name", 100],
    ["email", 160],
    ["phone", 20],
  ]) {
    if (
      typeof input[key] !== "string" ||
      input[key].length > max ||
      /[\u0000-\u001f]/.test(input[key])
    )
      throw new Error("Vui lòng kiểm tra thông tin.");
    fields[key] = input[key].trim();
  }
  if (
    fields.name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) ||
    !/^\+?[0-9 ()-]{9,20}$/.test(fields.phone) ||
    fields.phone.replace(/\D/g, "").length < 9
  )
    throw new Error("Vui lòng kiểm tra họ và tên, số điện thoại, email.");
  if (input.kind === "booking") {
    if (input.slot !== undefined && !TIME_SLOTS.includes(input.slot))
      throw new Error("Chọn khung giờ liên hệ phù hợp với bạn:");
    return { ...fields, kind: "booking", ...(input.slot ? { slot: input.slot } : {}) };
  }
  // Form ở công cụ "Thiết kế lộ trình đầu tư": liên hệ + phương án khách vừa mô phỏng,
  // purpose "advice" (Tư vấn lộ trình riêng) hoặc "survey" (Hiểu khẩu vị của tôi → sang trang khảo sát).
  if (input.kind === "plan") {
    const plan = input.plan;
    if (
      !["advice", "survey"].includes(input.purpose) ||
      !plan ||
      typeof plan !== "object" ||
      !["tich-san", "gia-san"].includes(plan.product)
    )
      throw new Error("Yêu cầu không hợp lệ.");
    const clean = { product: plan.product };
    for (const key of ["initial", "capital", "target", "years", "rate", "monthly"]) {
      if (plan[key] === undefined) continue;
      if (typeof plan[key] !== "number" || !Number.isFinite(plan[key]) || plan[key] < 0 || plan[key] > 1e14)
        throw new Error("Yêu cầu không hợp lệ.");
      clean[key] = plan[key];
    }
    if (plan.goal !== undefined) {
      if (!PLAN.goals.includes(plan.goal)) throw new Error("Yêu cầu không hợp lệ.");
      clean.goal = plan.goal;
    }
    if (plan.strategy !== undefined) {
      if (!Object.hasOwn(STRATEGIES, plan.strategy)) throw new Error("Yêu cầu không hợp lệ.");
      clean.strategy = plan.strategy;
    }
    return { ...fields, kind: "plan", purpose: input.purpose, plan: clean };
  }
  throw new Error("Yêu cầu không hợp lệ.");
}

export function createApp({
  dataDir = resolve(root, "data"),
  adminToken = process.env.ADMIN_TOKEN || "",
} = {}) {
  const dataFile = resolve(dataDir, "requests.json");
  let queue = Promise.resolve();
  const rates = new Map();
  async function readRequests() {
    try {
      return JSON.parse(await readFile(dataFile, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  function change(callback) {
    const job = queue.then(async () => {
      const data = await readRequests();
      const result = callback(data);
      await mkdir(dataDir, { recursive: true });
      await writeFile(`${dataFile}.tmp`, JSON.stringify(data, null, 2), {
        mode: 0o600,
      });
      await rename(`${dataFile}.tmp`, dataFile);
      return result;
    });
    queue = job.catch(() => {});
    return job;
  }
  const json = (response, status, body) => {
    response.writeHead(status, {
      "Content-Type": mime[".json"],
      "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(body));
  };
  async function body(request) {
    if (!request.headers["content-type"]?.startsWith("application/json"))
      throw Object.assign(new Error("Chỉ hỗ trợ JSON."), { status: 415 });
    let size = 0;
    const buffers = [];
    for await (const buffer of request) {
      size += buffer.length;
      if (size > 16384)
        throw Object.assign(new Error("Dữ liệu quá lớn."), { status: 413 });
      buffers.push(buffer);
    }
    try {
      return JSON.parse(Buffer.concat(buffers).toString("utf8"));
    } catch {
      throw Object.assign(new Error("Dữ liệu không hợp lệ."), { status: 400 });
    }
  }
  return http.createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; object-src 'none'; frame-src https://drive.google.com https://www.youtube.com https://www.youtube-nocookie.com; media-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    );
    try {
      const url = new URL(request.url, "http://localhost");
      if (url.pathname.startsWith("/api/")) {
        if (
          request.headers.origin &&
          new URL(request.headers.origin).host !== request.headers.host
        )
          return json(response, 403, { error: "Nguồn gửi không hợp lệ." });
        if (request.method === "POST") {
          const now = Date.now();
          for (const [key, value] of rates)
            if (value.until < now) rates.delete(key);
          const ip = request.socket.remoteAddress;
          const rate = rates.get(ip) || { count: 0, until: now + 600000 };
          rate.count++;
          rates.set(ip, rate);
          if (rate.count > 30)
            return json(response, 429, {
              error: "Vui lòng thử lại sau 10 phút.",
            });
          const input = await body(request);
          if (url.pathname === "/api/requests") {
            let clean;
            try {
              clean = validateContact(input);
            } catch (error) {
              return json(response, 400, { error: error.message });
            }
            const item = {
              ...clean,
              id: randomUUID(),
              createdAt: new Date().toISOString(),
              status: "Mới",
            };
            await change((data) => data.push(item));
            return json(response, 201, { id: item.id });
          }
        }
        if (
          url.pathname === "/api/admin/requests" &&
          request.method === "GET"
        ) {
          const actual = Buffer.from(request.headers.authorization || "");
          const expected = Buffer.from(`Bearer ${adminToken}`);
          if (
            adminToken.length < 24 ||
            actual.length !== expected.length ||
            !timingSafeEqual(actual, expected)
          )
            return json(response, 401, { error: "Không có quyền truy cập." });
          return json(response, 200, { requests: await readRequests() });
        }
        return json(response, 404, { error: "Không tìm thấy API." });
      }
      if (!["GET", "HEAD"].includes(request.method))
        return json(response, 405, { error: "Phương thức không hợp lệ." });
      const pathname = decodeURIComponent(url.pathname);
      const file = resolve(
        publicRoot,
        `.${pathname === "/" ? "/index.html" : pathname}`,
      );
      if (!file.startsWith(publicRoot + sep))
        return json(response, 403, { error: "Không được phép truy cập." });
      const content = await readFile(file);
      response.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch (error) {
      if (response.headersSent) return response.end();
      const status =
        error.status ||
        (["ENOENT", "EISDIR"].includes(error.code)
          ? 404
          : error instanceof URIError
            ? 400
            : 500);
      json(response, status, {
        error:
          status === 500
            ? "Chưa gửi được yêu cầu. Vui lòng thử lại."
            : status === 404
              ? "Không tìm thấy trang."
              : error.message,
      });
    }
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 3002);
  createApp().listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log(`AAS V2: http://localhost:${port}`),
  );
}
