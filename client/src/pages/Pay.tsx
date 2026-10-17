import { useState } from "react";
import { useRoute } from "wouter";
import { ArrowUpLeft, Check, Copy, CreditCard, Loader2, ReceiptText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const inputClass = "w-full rounded-xl border border-[#132e52]/15 bg-white px-4 py-3 outline-none focus:border-[#f47763]";

function playPrinterSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const start = audio.currentTime;
    for (let index = 0; index < 10; index += 1) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = index % 2 ? 170 : 115;
      gain.gain.setValueAtTime(0.0001, start + index * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.018, start + index * 0.055 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.055 + 0.045);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start + index * 0.055);
      oscillator.stop(start + index * 0.055 + 0.05);
    }
    window.setTimeout(() => void audio.close(), 900);
  } catch { /* الصوت تحسين اختياري ولا يمنع إصدار الفاتورة */ }
}

export default function Pay() {
  const [, params] = useRoute("/pay/:token");
  const [token, setToken] = useState(params?.token && params.token !== "demo" ? params.token : "");
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "تصميم هوية بصرية", description: "", amount: "1500" });
  const [created, setCreated] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const request = trpc.publicContent.getPaymentRequest.useQuery({ token }, { enabled: Boolean(token) });
  const create = trpc.publicContent.createPaymentRequest.useMutation({ onSuccess: (result) => { setToken(result.publicToken); setCreated(true); window.history.replaceState({}, "", `/pay/${result.publicToken}`); toast.success("تم إنشاء الطلب وإرساله للوحة التحكم"); }, onError: (error) => toast.error(error.message) });
  const simulate = trpc.publicContent.simulatePayment.useMutation({ onSuccess: async () => { await request.refetch(); setShowInvoice(true); playPrinterSound(); toast.success("تم الدفع وإصدار الفاتورة"); }, onError: (error) => toast.error(error.message) });
  const data = request.data;

  const submit = (event: React.FormEvent) => { event.preventDefault(); create.mutate({ ...form, phone: form.phone || undefined, description: form.description || undefined, amount: Math.round(Number(form.amount) * 100) }); };
  const copyLink = async () => { await navigator.clipboard?.writeText(window.location.href); toast.success("تم نسخ رابط الطلب"); };
  const saveInvoice = () => window.print();
  const shareInvoice = async () => { const text = `فاتورة سَفَر\nالخدمة: ${data?.service || form.service}\nالمبلغ: ${data ? (data.amount / 100).toFixed(2) : Number(form.amount).toFixed(2)} ر.س`; if (navigator.share) await navigator.share({ title: "فاتورة سَفَر", text, url: window.location.href }); else { await navigator.clipboard?.writeText(`${text}\n${window.location.href}`); toast.success("تم نسخ بيانات الفاتورة للمشاركة"); } };

  return <main dir="rtl" className="min-h-screen overflow-hidden bg-[#742f3c] px-4 py-8 text-[#132e52] sm:px-8"><div className="mx-auto max-w-5xl"><header className="mb-8 flex items-center justify-between text-[#fff7e7]"><div><div className="text-2xl font-black">سَفَر</div><div className="text-xs opacity-70">طلب مشروع ودفع آمن</div></div><div className="rounded-full border border-white/20 px-4 py-2 text-xs">صفحة دفع تجريبية</div></header>
    {!token && !created ? <section className="mx-auto max-w-xl rounded-[2rem] bg-[#fff7e7] p-6 shadow-2xl sm:p-10"><div className="mb-8 flex items-start justify-between"><div><span className="mb-3 inline-flex rounded-full bg-[#ff927f] px-3 py-1 text-xs font-bold">ابدأ الطلب</span><h1 className="text-3xl font-black">أرسل طلبك الآن</h1><p className="mt-2 leading-7 text-slate-500">عبّئ بياناتك كعميل تجريبي، وسيظهر الطلب مباشرة في لوحة تحكم سَفَر.</p></div><ReceiptText size={36} /></div><form onSubmit={submit}><Field label="الاسم الكامل"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="مثال: أحمد محمد" /></Field><Field label="البريد الإلكتروني"><input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required type="email" placeholder="name@company.com" /></Field><Field label="رقم الجوال"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="الخدمة"><select className={inputClass} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}><option>تصميم هوية بصرية</option><option>موشن جرافيك</option><option>تصميم واجهة وموقع</option><option>استشارة إبداعية</option></select></Field><Field label="المبلغ بالريال"><input className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required type="number" min="1" /></Field></div><Field label="وصف الطلب"><textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="اكتب تفاصيل بسيطة عن المشروع" /></Field><button disabled={create.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#132e52] px-5 py-4 font-bold text-white transition hover:bg-[#f47763] hover:text-[#132e52]">{create.isPending ? <Loader2 className="animate-spin" size={18} /> : <ArrowUpLeft size={18} />}إرسال الطلب وإنشاء رابط الدفع</button></form></section> : <section className="mx-auto max-w-xl"><div id="payment-panel" className={!showInvoice ? "rounded-[2rem] bg-[#fff7e7] p-6 shadow-2xl sm:p-10" : "hidden"}><div className="mb-8 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#b9e4dc]"><CreditCard /></div><div><h1 className="text-3xl font-black">الدفع الآمن</h1><p className="text-sm text-slate-500">اختر وسيلة الدفع المناسبة لإتمام طلبك</p></div></div><div className="mb-6 rounded-2xl bg-[#fff1d0] p-6 text-center"><p className="text-sm text-slate-500">المبلغ المطلوب</p><div className="mt-1 text-5xl font-black">{data ? (data.amount / 100).toFixed(2) : Number(form.amount).toFixed(2)} <small className="text-lg">ر.س</small></div></div><div className="mb-5 grid gap-3 sm:grid-cols-3"><button className="rounded-2xl border-2 border-[#132e52] bg-white p-4 font-black">Apple Pay</button><button className="rounded-2xl border border-[#132e52]/15 bg-white p-4 font-black">مدى</button><button className="rounded-2xl border border-[#132e52]/15 bg-white p-4 font-black">بطاقة بنكية</button></div><p className="mb-5 text-center text-xs leading-6 text-slate-500">هذه نسخة تجريبية؛ سيظهر Apple Pay ومدى فعليًا بعد ربط بوابة الدفع.</p><button disabled={simulate.isPending || !data} onClick={() => simulate.mutate({ token })} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#132e52] px-5 py-4 font-bold text-white">{simulate.isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}إتمام الدفع التجريبي</button></div>{showInvoice && data?.status === "paid" && <div className="receipt-paper rounded-[2rem] bg-[#fff7e7] p-6 shadow-2xl sm:p-10"><div className="mb-8 flex items-start justify-between border-b border-dashed border-[#132e52]/25 pb-6"><div><div className="mb-2 text-xs font-bold tracking-[0.2em] text-[#f47763]">SAFAR / RECEIPT</div><h1 className="text-3xl font-black">فاتورة الدفع</h1><p className="mt-1 text-sm text-slate-500">تم الدفع بنجاح</p></div><ReceiptText size={42} /></div><div className="receipt-scroll space-y-5"><Row label="العميل" value={data.name} /><Row label="البريد" value={data.email} /><Row label="الخدمة" value={data.service} /><Row label="الوصف" value={data.description || "—"} /><div className="border-y border-dashed border-[#132e52]/25 py-5"><div className="text-sm text-slate-500">الإجمالي المدفوع</div><div className="mt-1 text-4xl font-black">{(data.amount / 100).toFixed(2)} <small className="text-base">ر.س</small></div></div></div><div className="mt-8 flex gap-3"><button onClick={saveInvoice} className="flex-1 rounded-xl bg-[#132e52] px-4 py-3 font-bold text-white">حفظ الفاتورة</button><button onClick={shareInvoice} className="flex-1 rounded-xl border border-[#132e52]/20 px-4 py-3 font-bold">مشاركة</button></div></div>}</section>}
    <footer className="mt-8 text-center text-xs text-white/60">سَفَر · نحول الأفكار إلى تجارب واضحة</footer></div></main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="mb-4 block text-sm font-bold">{label}<div className="mt-2">{children}</div></label>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-5 border-b border-[#132e52]/10 pb-3"><span className="text-sm text-slate-500">{label}</span><strong className="max-w-[70%] text-left text-sm">{value}</strong></div>; }
