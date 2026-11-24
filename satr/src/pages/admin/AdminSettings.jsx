import { useEffect, useState } from "react";
import { Field } from "../../components/Field";
import { api } from "../../lib/api";
import { useAdminData } from "./useAdminData";

// إعدادات المتجر العامة: رابط الموقع، رسوم التوصيل، التوصيل المجاني، وتنبيه المخزون
export function AdminSettings({ token }) {
  const { data, error } = useAdminData("/api/admin/settings", token);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ ok: true, text: "" });

  useEffect(() => {
    if (data) setForm({ ...data, shippingFee: String(data.shippingFee), freeShippingMin: String(data.freeShippingMin), lowStock: String(data.lowStock) });
  }, [data]);

  if (error) return <p role="alert" className="font-bold text-[#b0354f]">{error}</p>;
  if (!form) return <p className="lead">جاري التحميل…</p>;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage({ ok: true, text: "" });
    try {
      await api("/api/admin/settings", { method: "PUT", json: form, token });
      setMessage({ ok: true, text: "انحفظت الإعدادات ✓" });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel p-6 grid gap-5 sm:grid-cols-2 max-w-[820px]" onSubmit={save} noValidate>
      <h2 className="m-0 sm:col-span-2 text-[20px] font-extrabold">إعدادات المتجر</h2>
      <Field id="s-name" label="اسم المتجر" value={form.storeName} onChange={set("storeName")} />
      <div>
        <Field id="s-url" label="رابط الموقع" dir="ltr" placeholder="https://satr.sa" value={form.storeUrl} onChange={set("storeUrl")} />
        <p className="m-0 mt-1.5 text-[14px] text-ink-soft">يُستخدم في روابط الدفع والرسائل وملف المنتجات.</p>
      </div>
      <Field id="s-fee" label="رسوم التوصيل (ر.س)" type="number" min={0} dir="ltr" value={form.shippingFee} onChange={set("shippingFee")} />
      <Field id="s-free" label="التوصيل مجاني للطلبات فوق (ر.س)" type="number" min={0} dir="ltr" value={form.freeShippingMin} onChange={set("freeShippingMin")} />
      <Field id="s-low" label="نبّهني إذا المخزون أقل من أو يساوي" type="number" min={0} dir="ltr" value={form.lowStock} onChange={set("lowStock")} />
      <Field id="s-wa" label="رقم واتساب خدمة العملاء" dir="ltr" placeholder="9665xxxxxxxx" value={form.supportWhatsapp} onChange={set("supportWhatsapp")} />
      {message.text && (
        <p role={message.ok ? "status" : "alert"} className={`m-0 sm:col-span-2 font-bold ${message.ok ? "text-leaf" : "text-[#b0354f]"}`}>
          {message.text}
        </p>
      )}
      <div className="sm:col-span-2">
        <button className="btn" disabled={busy}>
          {busy ? "جاري الحفظ…" : "احفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}
