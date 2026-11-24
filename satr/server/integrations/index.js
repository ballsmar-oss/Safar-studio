import { getIntegrationRow, saveIntegrationRow } from "../db.js";
import { decryptSecret, encryptSecret } from "../secrets.js";
import * as email from "./email.js";
import * as moyasar from "./moyasar.js";
import * as sms from "./sms.js";
import * as tabby from "./tabby.js";
import * as telegram from "./telegram.js";
import * as webhook from "./webhook.js";
import * as whatsapp from "./whatsapp.js";

const DEFAULT_CARRIERS = [
  "سمسا | https://www.smsaexpress.com/sa/ar/trackingdetails?tracknumbers={number}",
  "أرامكس | https://www.aramex.com/sa/ar/track/results?ShipmentNumber={number}",
  "سبل (البريد السعودي) | https://splonline.com.sa/ar/shipmentdetailstracking/?tid={number}",
  "جي آند تي | https://www.jtexpress.sa/trajectoryQuery?waybillNo={number}",
  "ريدبوكس | https://redboxsa.com/ar/track?awb={number}",
].join("\n");

// كل تكامل: حقوله تظهر في لوحة التحكم. الحقول من نوع secret تنحفظ مشفّرة وما ترجع للمتصفح.
export const INTEGRATIONS = [
  {
    key: "moyasar",
    group: "payments",
    name: "ميسّر",
    description: "الدفع الإلكتروني: مدى، Apple Pay، STC Pay، فيزا وماستركارد. العميل يدفع في صفحة ميسّر الآمنة ويرجع لطلبه.",
    docs: "https://dashboard.moyasar.com",
    fields: [{ name: "secretKey", label: "المفتاح السري (Secret key)", type: "secret", placeholder: "sk_test_… أو sk_live_…", required: true }],
    test: moyasar.test,
  },
  {
    key: "tabby",
    group: "payments",
    name: "تابي",
    description: "اشترِ الحين وادفع على ٤ دفعات بدون فوائد. يظهر كخيار دفع إضافي في صفحة إتمام الطلب.",
    docs: "https://merchant.tabby.ai",
    fields: [
      { name: "secretKey", label: "المفتاح السري (Secret key)", type: "secret", placeholder: "sk_test_…", required: true },
      { name: "merchantCode", label: "رمز التاجر (Merchant code)", type: "text", placeholder: "مثلاً: satr", required: true },
    ],
    test: tabby.test,
  },
  {
    key: "whatsapp",
    group: "notifications",
    name: "واتساب للأعمال",
    description: "رسائل تلقائية للعميل على واتساب: تأكيد الطلب، الشحن مع رابط التتبع، والتوصيل. يحتاج حساب WhatsApp Cloud API وقوالب معتمدة من Meta.",
    docs: "https://business.facebook.com/wa/manage/message-templates/",
    fields: [
      { name: "phoneNumberId", label: "معرّف رقم الهاتف (Phone number ID)", type: "text", required: true },
      { name: "accessToken", label: "رمز الوصول الدائم (Access token)", type: "secret", required: true },
      { name: "language", label: "لغة القوالب", type: "text", placeholder: "ar", help: "رمز اللغة كما هو في القالب، غالبًا ar" },
      { name: "templateCreated", label: "قالب تأكيد الطلب", type: "text", placeholder: "order_confirmation", help: "قيم القالب بالترتيب: {{1}} الاسم، {{2}} رقم الطلب، {{3}} الإجمالي. اتركه فاضي إذا ما تبغاه." },
      { name: "templateShipped", label: "قالب الشحن", type: "text", placeholder: "order_shipped", help: "{{1}} الاسم، {{2}} رقم الطلب، {{3}} رابط التتبع" },
      { name: "templateDelivered", label: "قالب التوصيل", type: "text", placeholder: "order_delivered", help: "{{1}} الاسم، {{2}} رقم الطلب" },
    ],
    test: whatsapp.test,
  },
  {
    key: "sms",
    group: "notifications",
    name: "رسائل SMS (تقنيات)",
    description: "رسالة نصية للعميل عند تأكيد الطلب وشحنه وتوصيله، عن طريق تقنيات (Taqnyat).",
    docs: "https://portal.taqnyat.sa",
    fields: [
      { name: "apiKey", label: "مفتاح API (Bearer token)", type: "secret", required: true },
      { name: "sender", label: "اسم المرسل المعتمد", type: "text", placeholder: "Satr", required: true },
    ],
    test: sms.test,
  },
  {
    key: "telegram",
    group: "notifications",
    name: "تنبيهات تيليجرام",
    description: "توصلك أنت رسالة فورية على تيليجرام مع كل طلب جديد، دفع، أو قائمة مدرسة.",
    docs: "https://t.me/BotFather",
    fields: [
      { name: "botToken", label: "توكن البوت", type: "secret", help: "من @BotFather", required: true },
      { name: "chatId", label: "معرّف المحادثة (Chat ID)", type: "text", help: "رقمك أو رقم القروب. ارسل للبوت أي رسالة وبعدين افتح @userinfobot لمعرفة رقمك.", required: true },
    ],
    test: telegram.test,
  },
  {
    key: "email",
    group: "notifications",
    name: "البريد الإلكتروني (Resend)",
    description: "يوصلك بريد بكل طلب جديد وكل قائمة مدرسة.",
    docs: "https://resend.com/api-keys",
    fields: [
      { name: "apiKey", label: "مفتاح Resend", type: "secret", placeholder: "re_…", required: true },
      { name: "from", label: "المرسل", type: "text", placeholder: "سطر <orders@satr.sa>", help: "لازم يكون من دومين موثّق في Resend", required: true },
      { name: "ownerEmail", label: "بريدك (المستلم)", type: "text", placeholder: "you@example.com", required: true },
    ],
    test: email.test,
  },
  {
    key: "shipping",
    group: "shipping",
    name: "شركات الشحن",
    description: "أضف رقم الشحنة من صفحة الطلبات، ويظهر للعميل رابط التتبع في صفحة تتبع الطلب ورسالة الشحن.",
    fields: [
      { name: "carriers", label: "الشركات وروابط التتبع", type: "textarea", default: DEFAULT_CARRIERS, help: "سطر لكل شركة: الاسم | رابط التتبع، و{number} مكان رقم الشحنة. تأكد من الروابط مع شركتك." },
    ],
  },
  {
    key: "analytics",
    group: "marketing",
    name: "التحليلات وبكسلات الإعلانات",
    description: "يتتبع الزيارات والإضافة للسلة وبدء الدفع والشراء، ويرسلها لـ Google وMeta وتيك توك وسناب شات. حط المعرّفات اللي تستخدمها بس.",
    fields: [
      { name: "ga4", label: "Google Analytics 4 (Measurement ID)", type: "text", placeholder: "G-XXXXXXXXXX" },
      { name: "gtm", label: "Google Tag Manager (Container ID)", type: "text", placeholder: "GTM-XXXXXXX" },
      { name: "googleAds", label: "Google Ads (معرّف التحويل)", type: "text", placeholder: "AW-XXXXXXXXX/xxxxxxxx", help: "معرّف التحويل مع التسمية، يرسل حدث الشراء لإعلانات Google" },
      { name: "metaPixel", label: "Meta Pixel (فيسبوك وانستقرام)", type: "text", placeholder: "123456789012345" },
      { name: "tiktokPixel", label: "TikTok Pixel", type: "text", placeholder: "CXXXXXXXXXXXXXXXXX" },
      { name: "snapPixel", label: "Snap Pixel", type: "text", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
    ],
  },
  {
    key: "feed",
    group: "marketing",
    name: "ملف المنتجات (كتالوج)",
    description: "رابط ملف XML فيه كل منتجاتك، تربطه مع Google Merchant Center وكتالوج Meta وتيك توك وسناب للإعلانات والتسوق. يحتاج رابط الموقع في الإعدادات، والمنتجات اللي ما لها صورة ما تطلع فيه.",
    fields: [],
  },
  {
    key: "webhook",
    group: "automation",
    name: "Webhook (أتمتة)",
    description: "نرسل كل حدث لرابط تختاره: طلب جديد، تغيّر حالة، دفع، قائمة مدرسة. اربطه مع Zapier أو Make أو n8n أو Google Sheets.",
    fields: [
      { name: "url", label: "الرابط", type: "text", placeholder: "https://hooks.zapier.com/…", required: true },
      { name: "secret", label: "مفتاح التوقيع (اختياري)", type: "secret", help: "يجي في الهيدر X-Satr-Signature كـ sha256=HMAC" },
    ],
    test: webhook.test,
  },
];

const byKey = Object.fromEntries(INTEGRATIONS.map((i) => [i.key, i]));
export const getDefinition = (key) => byKey[key];

// الإعدادات بعد فك التشفير — للاستخدام داخل السيرفر فقط
export function getConfig(key) {
  const def = byKey[key];
  const { enabled, config } = getIntegrationRow(key);
  const values = {};
  for (const field of def.fields) {
    const raw = config[field.name];
    values[field.name] = field.type === "secret" ? decryptSecret(raw) : raw ?? field.default ?? "";
  }
  const ready = def.fields.filter((f) => f.required).every((f) => String(values[f.name] ?? "").trim());
  return { enabled, ready, active: enabled && ready, values };
}

// نفس الإعدادات بس آمنة للعرض في لوحة التحكم (المفاتيح السرية تظهر كـ "محفوظ")
export function adminView() {
  return INTEGRATIONS.map((def) => {
    const { enabled, ready, values } = getConfig(def.key);
    return {
      key: def.key,
      group: def.group,
      name: def.name,
      description: def.description,
      docs: def.docs,
      testable: Boolean(def.test),
      enabled,
      ready,
      fields: def.fields.map(({ name, label, type, placeholder, help, required }) => ({
        name, label, type, placeholder, help, required,
        value: type === "secret" ? "" : values[name],
        saved: type === "secret" ? Boolean(values[name]) : undefined,
      })),
    };
  });
}

// حفظ: الحقل السري الفاضي يعني "خلّ القديم"، و clear يمسحه
export function saveConfig(key, { enabled, values = {}, clear = [] }) {
  const def = byKey[key];
  const { config } = getIntegrationRow(key);
  const next = { ...config };
  for (const field of def.fields) {
    const value = values[field.name];
    if (field.type === "secret") {
      if (clear.includes(field.name)) delete next[field.name];
      else if (typeof value === "string" && value.trim()) next[field.name] = encryptSecret(value.trim());
    } else if (value !== undefined) {
      next[field.name] = String(value).trim();
    }
  }
  saveIntegrationRow(key, Boolean(enabled), next);
}

export async function testIntegration(key) {
  const def = byKey[key];
  if (!def.test) return "ما يحتاج اختبار";
  const { ready, values } = getConfig(key);
  if (!ready) throw new Error("كمّل الحقول المطلوبة واحفظ أول");
  return def.test(values);
}

// ───────── قيم تستخدمها الواجهة (بدون أي أسرار) ─────────
export function parseCarriers(text) {
  return String(text ?? "")
    .split("\n")
    .map((line) => line.split("|").map((p) => p.trim()))
    .filter(([name]) => name)
    .map(([name, url]) => ({ name, url: url ?? "" }));
}

export function carriers() {
  const { enabled, values } = getConfig("shipping");
  return parseCarriers(enabled ? values.carriers : DEFAULT_CARRIERS);
}

export function trackingUrl(carrierName, number) {
  if (!carrierName || !number) return null;
  const carrier = carriers().find((c) => c.name === carrierName);
  return carrier?.url ? carrier.url.replace("{number}", encodeURIComponent(number)) : null;
}

export function publicConfig() {
  const analytics = getConfig("analytics");
  const tracking = analytics.enabled
    ? Object.fromEntries(Object.entries(analytics.values).filter(([, v]) => String(v).trim()))
    : {};
  return {
    onlinePayment: getConfig("moyasar").active,
    tabby: getConfig("tabby").active,
    tracking,
  };
}
