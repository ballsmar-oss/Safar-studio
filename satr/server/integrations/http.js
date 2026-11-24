// طلب HTTP مع مهلة ورسالة خطأ واضحة تظهر في سجل التكاملات
export async function request(url, { method = "GET", headers = {}, json, body, timeout = 20_000 } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: json !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
      body: json !== undefined ? JSON.stringify(json) : body,
      signal: AbortSignal.timeout(timeout),
    });
  } catch (error) {
    const host = new URL(url).host;
    if (error?.name === "TimeoutError") throw new Error(`الخدمة (${host}) ما ردّت خلال ${timeout / 1000} ثانية`);
    throw new Error(`ما قدرنا نتصل بـ ${host} — تأكد إن السيرفر متصل بالإنترنت وإن الرابط صحيح`);
  }
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const detail = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`${response.status} ${detail ?? ""}`.slice(0, 300));
  }
  return data;
}
