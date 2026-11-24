import { request } from "./http.js";
import { internationalPhone } from "../util.js";

// تابي: اشترِ الحين وادفع على ٤ دفعات — https://docs.tabby.ai
const API = "https://api.tabby.ai/api/v2";
const auth = (cfg) => ({ Authorization: `Bearer ${cfg.secretKey}` });

// نسوي جلسة دفع؛ لو العميل مؤهل ترجع رابط صفحة تابي
export async function createSession(cfg, { order, successUrl, cancelUrl, failureUrl }) {
  const session = await request(`${API}/checkout`, {
    method: "POST",
    headers: auth(cfg),
    json: {
      payment: {
        amount: order.total.toFixed(2),
        currency: "SAR",
        description: `طلب ${order.number}`,
        buyer: { phone: `+${internationalPhone(order.customer.phone)}`, name: order.customer.name, email: order.customer.email || undefined },
        shipping_address: { city: order.customer.city, address: `${order.customer.district}، ${order.customer.address}`, zip: "00000" },
        order: {
          reference_id: order.number,
          tax_amount: "0.00",
          shipping_amount: order.shipping.toFixed(2),
          items: order.items.map((item) => ({
            title: item.color ? `${item.name} (${item.color})` : item.name,
            quantity: item.qty,
            unit_price: item.price.toFixed(2),
            reference_id: item.id,
            category: "Stationery",
          })),
        },
        buyer_history: { registered_since: new Date().toISOString(), loyalty_level: 0 },
        order_history: [],
      },
      lang: "ar",
      merchant_code: cfg.merchantCode,
      merchant_urls: { success: successUrl, cancel: cancelUrl, failure: failureUrl },
    },
  });
  const url = session?.configuration?.available_products?.installments?.[0]?.web_url;
  if (session?.status !== "created" || !url) {
    const reason = session?.configuration?.products?.installments?.rejection_reason;
    throw new Error(reason === "order_amount_too_high" ? "المبلغ أعلى من الحد المسموح في تابي" : reason === "order_amount_too_low" ? "المبلغ أقل من الحد الأدنى في تابي" : "تابي ما وافق على هذا الطلب، جرّب طريقة دفع ثانية");
  }
  return { url, paymentId: session.payment.id };
}

export const getPayment = (cfg, id) => request(`${API}/payments/${encodeURIComponent(id)}`, { headers: auth(cfg) });

export const capturePayment = (cfg, id, amount) =>
  request(`${API}/payments/${encodeURIComponent(id)}/captures`, { method: "POST", headers: auth(cfg), json: { amount: amount.toFixed(2) } });

export async function test(cfg) {
  if (!/^sk_/.test(cfg.secretKey)) throw new Error("المفتاح السري لازم يبدأ بـ sk_");
  if (!cfg.merchantCode) throw new Error("اكتب رمز التاجر (Merchant code)");
  // تابي ما عنده طلب اختبار مباشر بدون إنشاء جلسة؛ نتأكد من شكل البيانات فقط
  return cfg.secretKey.startsWith("sk_test_") ? "البيانات مكتملة (وضع تجريبي). جرّب طلب فعلي للتأكد." : "البيانات مكتملة. جرّب طلب فعلي للتأكد.";
}
