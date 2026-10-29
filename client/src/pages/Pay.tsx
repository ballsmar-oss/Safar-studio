import { useState } from "react";
import { useRoute } from "wouter";
import { Check, CreditCard, Loader2, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/hooks/useLanguage";

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
  const token = params?.token ?? "";
  const [showInvoice, setShowInvoice] = useState(false);
  const [language] = useLanguage();
  const isArabic = language === "ar";
  const t = (arabic: string, english: string) => (isArabic ? arabic : english);
  const request = trpc.publicContent.getPaymentRequest.useQuery({ token }, { enabled: Boolean(token) });
  const simulate = trpc.publicContent.simulatePayment.useMutation({ onSuccess: async () => { await request.refetch(); setShowInvoice(true); playPrinterSound(); toast.success(t("تم الدفع وإصدار الفاتورة", "Paid and invoice issued")); }, onError: (error) => toast.error(error.message) });
  const startPay = trpc.publicContent.startPayment.useMutation({ onSuccess: (result) => { window.location.href = result.url; }, onError: (error) => toast.error(error.message) });
  const data = request.data;

  const saveInvoice = () => window.print();
  const shareInvoice = async () => { const text = `فاتورة سَفَر\nالخدمة: ${data?.service ?? ""}\nالمبلغ: ${data ? (data.amount / 100).toFixed(2) : ""} ر.س`; if (navigator.share) await navigator.share({ title: "فاتورة سَفَر", text, url: window.location.href }); else { await navigator.clipboard?.writeText(`${text}\n${window.location.href}`); toast.success(t("تم نسخ بيانات الفاتورة للمشاركة", "Invoice details copied to share")); } };

  return <main dir={isArabic ? "rtl" : "ltr"} className="min-h-screen overflow-hidden bg-[#742f3c] px-4 py-8 text-[#132e52] sm:px-8"><div className="mx-auto max-w-5xl"><header className="mb-8 flex items-center justify-between text-[#fff7e7]"><div><div className="text-2xl font-black">سَفَر</div><div className="text-xs opacity-70">{t('طلب مشروع ودفع آمن','Project order and secure payment')}</div></div><div className="rounded-full border border-white/20 px-4 py-2 text-xs">{t('صفحة دفع تجريبية','Test payment page')}</div></header>
    {!token || (!request.isLoading && !data) ? <section className="mx-auto max-w-xl rounded-[2rem] bg-[#fff7e7] p-6 text-center shadow-2xl sm:p-10"><ReceiptText className="mx-auto mb-4" size={36} /><h1 className="text-2xl font-black">{t('رابط الدفع غير صالح','Invalid payment link')}</h1><p className="mt-3 leading-7 text-slate-500">{t('تأكد من الرابط اللي وصلك من سَفَر، أو تواصل معنا ونرسل لك رابط جديد.','Check the link you received from SAFAR, or contact us and we will send a new one.')}</p></section> : <section className="mx-auto max-w-xl"><div id="payment-panel" className={!showInvoice ? "rounded-[2rem] bg-[#fff7e7] p-6 shadow-2xl sm:p-10" : "hidden"}><div className="mb-8 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#b9e4dc]"><CreditCard /></div><div><h1 className="text-3xl font-black">{t('الدفع الآمن','Secure payment')}</h1><p className="text-sm text-slate-500">{t('اختر وسيلة الدفع المناسبة لإتمام طلبك','Choose a payment method to complete your order')}</p></div></div><div className="mb-6 rounded-2xl bg-[#fff1d0] p-6 text-center"><p className="text-sm text-slate-500">{t('المبلغ المطلوب','Amount due')}</p><div className="mt-1 text-5xl font-black">{data ? (data.amount / 100).toFixed(2) : "—"} <small className="text-lg">{t('ر.س','SAR')}</small></div></div><div className="mb-5 grid gap-3 sm:grid-cols-3"><button className="rounded-2xl border-2 border-[#132e52] bg-white p-4 font-black">Apple Pay</button><button className="rounded-2xl border border-[#132e52]/15 bg-white p-4 font-black">مدى</button><button className="rounded-2xl border border-[#132e52]/15 bg-white p-4 font-black">{t('بطاقة بنكية','Bank card')}</button></div><p className="mb-5 text-center text-xs leading-6 text-slate-500">{data?.testMode ? "هذه نسخة تجريبية؛ لن يُخصم أي مبلغ." : "الدفع يتم عبر بوابة Moyasar الآمنة."}</p>{data?.status === "paid" && !showInvoice ? <p className="rounded-xl bg-[#b9e4dc] p-4 text-center font-bold">{t('تم دفع هذا الطلب مسبقًا. شكرًا لك!','This order was already paid. Thank you!')}</p> : data?.testMode && !data?.testKeysReady ? <button disabled={simulate.isPending || !data} onClick={() => simulate.mutate({ token })} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#132e52] px-5 py-4 font-bold text-white">{simulate.isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}إتمام الدفع التجريبي</button> : data && <button disabled={startPay.isPending} onClick={() => startPay.mutate({ token })} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f47763] px-5 py-4 font-black text-[#132e52] disabled:opacity-60">{startPay.isPending ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}ادفع الآن بأمان</button>}</div>{showInvoice && data?.status === "paid" && <div className="receipt-paper rounded-[2rem] bg-[#fff7e7] p-6 shadow-2xl sm:p-10"><div className="mb-8 flex items-start justify-between border-b border-dashed border-[#132e52]/25 pb-6"><div><div className="mb-2 text-xs font-bold tracking-[0.2em] text-[#f47763]">SAFAR / RECEIPT</div><h1 className="text-3xl font-black">{t('فاتورة الدفع','Payment invoice')}</h1><p className="mt-1 text-sm text-slate-500">{t('تم الدفع بنجاح','Payment successful')}</p></div><ReceiptText size={42} /></div><div className="receipt-scroll space-y-5"><Row label={t("العميل", "Client")} value={data.name} /><Row label={t("البريد", "Email")} value={data.email} /><Row label={t("الخدمة", "Service")} value={data.service} /><Row label={t("الوصف", "Description")} value={data.description || "—"} /><div className="border-y border-dashed border-[#132e52]/25 py-5"><div className="text-sm text-slate-500">{t('الإجمالي المدفوع','Total paid')}</div><div className="mt-1 text-4xl font-black">{(data.amount / 100).toFixed(2)} <small className="text-base">{t('ر.س','SAR')}</small></div></div></div><div className="mt-8 flex gap-3"><button onClick={saveInvoice} className="flex-1 rounded-xl bg-[#132e52] px-4 py-3 font-bold text-white">{t('حفظ الفاتورة','Save invoice')}</button><button onClick={shareInvoice} className="flex-1 rounded-xl border border-[#132e52]/20 px-4 py-3 font-bold">{t('مشاركة','Share')}</button></div></div>}</section>}
    <footer className="mt-8 text-center text-xs text-white/60">{t('سَفَر · نحول الأفكار إلى تجارب واضحة','SAFAR · We turn ideas into clear experiences')}</footer></div></main>;
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-5 border-b border-[#132e52]/10 pb-3"><span className="text-sm text-slate-500">{label}</span><strong className="max-w-[70%] text-left text-sm">{value}</strong></div>; }
