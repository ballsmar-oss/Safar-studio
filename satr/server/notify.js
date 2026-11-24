import { addLog, getSettings } from "./db.js";
import { formatSar } from "./util.js";
import { getConfig, trackingUrl } from "./integrations/index.js";
import * as email from "./integrations/email.js";
import * as sms from "./integrations/sms.js";
import * as telegram from "./integrations/telegram.js";
import * as webhook from "./integrations/webhook.js";
import * as whatsapp from "./integrations/whatsapp.js";

const STAGES = { kg: "روضة", primary: "ابتدائي", middle: "متوسط", high: "ثانوي" };
const PAYMENT = { cod: "عند الاستلام", online: "إلكتروني (ميسّر)", tabby: "تابي" };

// يشغّل كل الإرسالات بالخلفية، وأي فشل ينكتب في سجل التكاملات بدون ما يوقف الطلب
function run(integration, event, task) {
  const { active, values } = getConfig(integration);
  if (!active) return;
  Promise.resolve()
    .then(() => task(values))
    .then(() => addLog(integration, event, true, "تم الإرسال"))
    .catch((error) => {
      addLog(integration, event, false, error?.message ?? String(error));
      console.error(`[${integration}] ${event}: ${error?.message ?? error}`);
    });
}

const orderText = (order) =>
  [
    `طلب جديد ${order.number} 🛍️`,
    `${order.customer.name} — ${order.customer.phone}`,
    `${order.customer.city}، ${order.customer.district}، ${order.customer.address}`,
    "",
    ...order.items.map((i) => `• ${i.name}${i.color ? ` (${i.color})` : ""} × ${i.qty}`),
    "",
    `الإجمالي: ${formatSar(order.total)} — الدفع: ${PAYMENT[order.paymentProvider ?? order.paymentMethod] ?? order.paymentMethod}`,
  ].join("\n");

const publicOrder = (order) => ({
  number: order.number,
  status: order.status,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  paymentProvider: order.paymentProvider,
  customer: order.customer,
  items: order.items,
  subtotal: order.subtotal,
  shipping: order.shipping,
  total: order.total,
  carrier: order.carrier,
  trackingNumber: order.trackingNumber,
  createdAt: order.createdAt,
});

function storeLink(path) {
  const base = getSettings().storeUrl.replace(/\/+$/, "");
  return base ? `${base}/#${path}` : "";
}

export function orderCreated(order) {
  run("telegram", "order.created", (cfg) => telegram.send(cfg, orderText(order)));
  run("email", "order.created", (cfg) => email.send(cfg, { subject: `طلب جديد ${order.number} — ${formatSar(order.total)}`, text: orderText(order) }));
  run("webhook", "order.created", (cfg) => webhook.deliver(cfg, "order.created", publicOrder(order)));
  // رسالة التأكيد للعميل: طلبات الدفع الإلكتروني تنتظر لين يتم الدفع
  if (order.paymentMethod === "cod") customerConfirmed(order);
}

function customerConfirmed(order) {
  run("whatsapp", "order.confirmed", (cfg) =>
    cfg.templateCreated ? whatsapp.sendTemplate(cfg, order.customer.phone, cfg.templateCreated, [order.customer.name, order.number, formatSar(order.total)]) : null,
  );
  run("sms", "order.confirmed", (cfg) =>
    sms.send(cfg, order.customer.phone, `هلا ${order.customer.name}، استلمنا طلبك ${order.number} بإجمالي ${formatSar(order.total)}. نبلغك أول ما ينشحن. ${storeLink("/track")}`.trim()),
  );
}

export function orderPaid(order) {
  run("telegram", "payment.paid", (cfg) => telegram.send(cfg, `💳 تم دفع الطلب ${order.number} — ${formatSar(order.total)}`));
  run("email", "payment.paid", (cfg) => email.send(cfg, { subject: `تم دفع الطلب ${order.number}`, text: orderText(order) }));
  run("webhook", "payment.paid", (cfg) => webhook.deliver(cfg, "payment.paid", publicOrder(order)));
  customerConfirmed(order);
}

export function orderStatusChanged(order, previous) {
  run("webhook", "order.updated", (cfg) => webhook.deliver(cfg, "order.updated", { ...publicOrder(order), previousStatus: previous }));
  if (order.status === "shipped") {
    const link = trackingUrl(order.carrier, order.trackingNumber) ?? storeLink("/track");
    run("whatsapp", "order.shipped", (cfg) =>
      cfg.templateShipped ? whatsapp.sendTemplate(cfg, order.customer.phone, cfg.templateShipped, [order.customer.name, order.number, link || order.number]) : null,
    );
    run("sms", "order.shipped", (cfg) =>
      sms.send(cfg, order.customer.phone, `طلبك ${order.number} انشحن 🚚${order.trackingNumber ? ` رقم الشحنة ${order.trackingNumber}` : ""} ${link}`.trim()),
    );
  }
  if (order.status === "delivered") {
    run("whatsapp", "order.delivered", (cfg) =>
      cfg.templateDelivered ? whatsapp.sendTemplate(cfg, order.customer.phone, cfg.templateDelivered, [order.customer.name, order.number]) : null,
    );
    run("sms", "order.delivered", (cfg) => sms.send(cfg, order.customer.phone, `طلبك ${order.number} وصل. شكرًا لك من سطر 💚`));
  }
}

export function schoolListCreated(list) {
  const text = [`قائمة مدرسة جديدة #${list.id} 📋`, `${list.name} — ${list.phone}`, `المرحلة: ${STAGES[list.stage] ?? list.stage}`, list.text ? `\n${list.text}` : "", list.file ? "\n(فيها ملف مرفوع، افتحه من لوحة التحكم)" : ""].join("\n");
  run("telegram", "school_list.created", (cfg) => telegram.send(cfg, text));
  run("email", "school_list.created", (cfg) => email.send(cfg, { subject: `قائمة مدرسة جديدة #${list.id}`, text }));
  run("webhook", "school_list.created", (cfg) => webhook.deliver(cfg, "school_list.created", { id: list.id, name: list.name, phone: list.phone, stage: list.stage, text: list.text, hasFile: Boolean(list.file) }));
}
