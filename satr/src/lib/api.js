// كل طلبات الواجهة للسيرفر تمر من هنا.
// في وضع المعاينة (VITE_STATIC_PREVIEW=1) ما فيه سيرفر، والبيانات تنحفظ في متصفحك فقط (static-api.js).
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const STATIC_PREVIEW = import.meta.env.VITE_STATIC_PREVIEW === "1";

export async function api(path, options = {}) {
  if (STATIC_PREVIEW) {
    const { staticApi } = await import("./static-api");
    return staticApi(path, options);
  }
  const headers = {};
  if (options.json !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  let response;
  try {
    response = await fetch(path, {
      method: options.method ?? "GET",
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : undefined,
    });
  } catch {
    throw new ApiError(0, "ما قدرنا نوصل للسيرفر، تأكد من الإنترنت وجرّب مرة ثانية.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? "صار خطأ، جرّب مرة ثانية.");
  }
  return data;
}

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
