import { useEffect, useMemo, useRef, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import NotFound from "@/pages/NotFound";
import AdminEmailLogin from "@/components/AdminEmailLogin";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Apple, CreditCard, Globe2, ImagePlus, KeyRound, LayoutDashboard, Laptop, Mail, MessageSquareQuote, Pencil, Save, Settings, ShieldCheck, Trash2, Upload, Video, X } from "lucide-react";

type Tab = "overview" | "content" | "covers" | "work" | "testimonials" | "leads" | "payments" | "settings";
type SettingsForm = { moyasarTestPublishableKey: string; moyasarTestSecretKey: string; moyasarTestWebhookSecret: string; brandName: string; officialDomain: string; businessEmail: string; freelanceLicenseNumber: string; businessCenterNumber: string; whatsappNumber: string; instagramUrl: string; linkedinUrl: string; tiktokUrl: string; senderName: string; dnsRecords: string; applePayAssociation: string; resendApiKey: string; moyasarPublishableKey: string; moyasarSecretKey: string; moyasarWebhookSecret: string; mode: "test" | "live"; smtpHost: string; smtpPort: string; smtpUser: string; smtpPassword: string };
const emptySettings: SettingsForm = { moyasarTestPublishableKey: "", moyasarTestSecretKey: "", moyasarTestWebhookSecret: "", brandName: "سَفَر", officialDomain: "", businessEmail: "", freelanceLicenseNumber: "", businessCenterNumber: "", whatsappNumber: "", instagramUrl: "", linkedinUrl: "", tiktokUrl: "", senderName: "", dnsRecords: "", applePayAssociation: "", resendApiKey: "", moyasarPublishableKey: "", moyasarSecretKey: "", moyasarWebhookSecret: "", mode: "test", smtpHost: "", smtpPort: "", smtpUser: "", smtpPassword: "" };
const emptyWork = { title: "", titleEn: "", description: "", descriptionEn: "", category: "موشن", categoryEn: "", mediaType: "video" as "image" | "video" | "link", mediaUrl: "", thumbnailUrl: "", projectUrl: "", tags: [] as string[], tagsEn: [] as string[], sideLabel: "", sideLabelEn: "", gallery: [] as string[], isPublished: true, sortOrder: 0 };
const emptyTestimonial = { name: "", company: "", quote: "", rating: 5, avatarUrl: "", isPublished: true, sortOrder: 0 };

export default function Admin() {
  const { isAdmin: isApprovedAdmin, deviceRegistered, loading } = useAdmin();
  const [tab, setTab] = useState<Tab>("overview");
  const [workForm, setWorkForm] = useState<any>(emptyWork);
  const [testimonialForm, setTestimonialForm] = useState<any>(emptyTestimonial);
  const [contentForm, setContentForm] = useState({ contentKey: "", label: "", contentValue: "" });
  const [settingsForm, setSettingsForm] = useState<SettingsForm>(emptySettings);
  const pendingEmail = useRef<{ email: string; name: string; service: string; amount: string; template: string } | null>(null);
  const utils = trpc.useUtils();
  const dashboard = trpc.admin.dashboard.useQuery(undefined, { enabled: Boolean(isApprovedAdmin) });
  const integrationData = trpc.admin.integrationSettings.useQuery(undefined, { enabled: Boolean(isApprovedAdmin) });
  const integrationChecks = trpc.admin.checkIntegrations.useQuery(undefined, { enabled: Boolean(isApprovedAdmin), refetchOnWindowFocus: false });
  const saveContent = trpc.admin.saveContent.useMutation({ onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const createWork = trpc.admin.createPortfolio.useMutation({ onSuccess: () => { toast.success("تمت إضافة العمل"); setWorkForm(emptyWork); refresh(); }, onError: (e) => toast.error(e.message) });
  const updateWork = trpc.admin.updatePortfolio.useMutation({ onSuccess: () => { toast.success("تم تحديث العمل"); setWorkForm(emptyWork); refresh(); }, onError: (e) => toast.error(e.message) });
  const deleteWork = trpc.admin.deletePortfolio.useMutation({ onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const createTestimonial = trpc.admin.createTestimonial.useMutation({ onSuccess: () => { toast.success("تمت إضافة التقييم"); setTestimonialForm(emptyTestimonial); refresh(); }, onError: (e) => toast.error(e.message) });
  const updateTestimonial = trpc.admin.updateTestimonial.useMutation({ onSuccess: () => { toast.success("تم تحديث التقييم"); setTestimonialForm(emptyTestimonial); refresh(); }, onError: (e) => toast.error(e.message) });
  const deleteTestimonial = trpc.admin.deleteTestimonial.useMutation({ onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const updateLead = trpc.admin.updateLeadStatus.useMutation({ onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const updatePayment = trpc.admin.updatePaymentStatus.useMutation({ onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const sendPaymentLink = trpc.admin.emailCustomer.useMutation({ onSuccess: () => { refresh(); toast.success("تم إرسال رابط الدفع للعميل"); }, onError: (e) => toast.error(e.message) });
  const sendContract = trpc.admin.emailCustomer.useMutation({ onSuccess: () => toast.success("تم إرسال العقد للعميل"), onError: (e) => toast.error(e.message) });
  const sendContractTest = (lead: any, template: string, attachmentUrl?: string) => sendContract.mutate({ attachmentUrl, to: lead.email, subject: "عقد مشروعك مع سَفَر", template, values: { name: lead.name, email: lead.email, service: lead.service || "الخدمة المطلوبة" } });
  const testEmail = trpc.admin.testEmail.useMutation({ onSuccess: () => toast.success("وصلت رسالة الاختبار إلى بريدك الرسمي"), onError: (e) => toast.error(e.message) });
  const saveSettings = trpc.admin.saveIntegrationSettings.useMutation({ onSuccess: () => { toast.success("تم حفظ إعدادات التكاملات بأمان"); integrationData.refetch(); }, onError: (e) => toast.error(e.message) });
  const createPayment = trpc.admin.createPaymentRequest.useMutation({ onSuccess: (result) => { refresh(); const link = `${window.location.origin}/pay/${result.publicToken}`; navigator.clipboard?.writeText(link).catch(() => {}); const email = pendingEmail.current; if (email) sendPaymentLink.mutate({ to: email.email, subject: `رابط الدفع — ${email.service}`, template: email.template, values: { name: email.name, email: email.email, service: email.service, amount: email.amount, link } }); else toast.success("تم إنشاء رابط الدفع ونسخه"); pendingEmail.current = null; }, onError: (e) => toast.error(e.message) });
  const uploadMedia = useUpload((url) => { setWorkForm((old: any) => ({ ...old, mediaUrl: url })); toast.success("تم رفع الملف"); });
  const uploadThumbnail = useUpload((url) => { setWorkForm((old: any) => ({ ...old, thumbnailUrl: url })); toast.success("تم رفع الغلاف"); });
  const uploadGallery = useUpload((url) => { setWorkForm((old: any) => ({ ...old, gallery: [...(old.gallery ?? []), url].slice(0, 4) })); toast.success("تمت إضافة الصورة"); });

  function refresh() { utils.admin.dashboard.invalidate(); }

  useEffect(() => {
    const data: any = integrationData.data;
    if (!data) return;
    setSettingsForm((current) => ({ ...current, brandName: data.brandName ?? "سَفَر", officialDomain: data.officialDomain ?? "", businessEmail: data.businessEmail ?? "", freelanceLicenseNumber: data.freelanceLicenseNumber ?? "", businessCenterNumber: data.businessCenterNumber ?? "", whatsappNumber: data.whatsappNumber ?? "", instagramUrl: data.instagramUrl ?? "", linkedinUrl: data.linkedinUrl ?? "", tiktokUrl: data.tiktokUrl ?? "", senderName: data.senderName ?? "", dnsRecords: data.dnsRecords ?? "", applePayAssociation: data.applePayAssociation ?? "", mode: data.mode ?? "test", smtpHost: data.smtpHost ?? "", smtpPort: data.smtpPort ? String(data.smtpPort) : "", smtpUser: data.smtpUser ?? "" }));
  }, [integrationData.data]);

  const content = dashboard.data?.content ?? [];
  const work = dashboard.data?.portfolio ?? [];
  const testimonials = dashboard.data?.testimonials ?? [];
  const leads = dashboard.data?.leads ?? [];
  const payments = dashboard.data?.payments ?? [];
  const newLeads = useMemo(() => leads.filter((lead: any) => lead.status === "new").length, [leads]);

  if (loading) return <div className="min-h-screen bg-[#fff5df]" />;
  if (!isApprovedAdmin) return deviceRegistered ? <AdminEmailLogin /> : <NotFound />;

  const nav = [{ id: "overview", label: "نظرة عامة", icon: LayoutDashboard }, { id: "content", label: "نصوص الصفحة", icon: Pencil }, { id: "covers", label: "صور الخدمات", icon: Pencil }, { id: "work", label: "الأعمال", icon: ImagePlus }, { id: "testimonials", label: "التقييمات", icon: MessageSquareQuote }, { id: "leads", label: `طلبات التواصل${newLeads ? ` (${newLeads})` : ""}`, icon: MessageSquareQuote }, { id: "payments", label: "طلبات الدفع", icon: CreditCard }, { id: "settings", label: "الإعدادات والتكاملات", icon: Settings }];
  const submitWork = (event: React.FormEvent) => { event.preventDefault(); const payload = { ...workForm, thumbnailUrl: workForm.thumbnailUrl || null, projectUrl: workForm.projectUrl || null, description: workForm.description || null, tags: workForm.tags ?? [], tagsEn: workForm.tagsEn ?? [], sideLabel: workForm.sideLabel || null, sideLabelEn: workForm.sideLabelEn || null, gallery: workForm.gallery ?? [] }; if (workForm.id) updateWork.mutate(payload); else createWork.mutate(payload); };
  const submitTestimonial = (event: React.FormEvent) => { event.preventDefault(); const payload = { ...testimonialForm, company: testimonialForm.company || null, avatarUrl: testimonialForm.avatarUrl || null }; if (testimonialForm.id) updateTestimonial.mutate(payload); else createTestimonial.mutate(payload); };
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) uploadMedia.upload(file); event.target.value = ""; };
  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) uploadThumbnail.upload(file); event.target.value = ""; };

  return <div dir="rtl" className="min-h-screen bg-[#fff5df] text-[#0d2b52]">
    <div className="mx-auto flex min-h-screen max-w-[1500px]">
      <aside className="hidden w-72 shrink-0 border-l border-[#0d2b52]/10 bg-[#0d2b52] p-5 text-[#fff5df] lg:block"><div className="mb-10 flex items-center justify-between"><div><div className="text-2xl font-black">سَفَر</div><div className="text-xs opacity-60">لوحة إدارة المحتوى</div></div><LayoutDashboard /></div><nav className="space-y-2">{nav.map((item) => <button key={item.id} onClick={() => setTab(item.id as Tab)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right transition ${tab === item.id ? "bg-[#f47763] text-[#0d2b52]" : "hover:bg-white/10"}`}><item.icon size={18} />{item.label}</button>)}</nav><a href="/" className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 opacity-80 hover:bg-white/10">← الذهاب للموقع الرئيسي</a></aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8"><header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-sm text-[#f47763]">مرحبًا بك</p><h1 className="text-3xl font-black">إدارة موقع سَفَر</h1></div><div className="flex gap-2 lg:hidden"><a href="/" className="rounded-xl border bg-white px-3 py-2 text-sm font-bold">الموقع ←</a><select value={tab} onChange={(e) => setTab(e.target.value as Tab)} className="rounded-xl border bg-white px-3 py-2">{nav.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div></header><CountersSection />
        {tab === "overview" && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="الأعمال المنشورة" value={work.filter((item: any) => item.isPublished).length} color="bg-[#b9e4dc]" /><Stat label="كل الأعمال" value={work.length} color="bg-[#ffe49d]" /><Stat label="التقييمات" value={testimonials.length} color="bg-[#ff927f]" /><Stat label="طلبات جديدة" value={newLeads} color="bg-[#d8d0f4]" /><div className="col-span-full mt-3 rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-2 text-xl font-black">من هنا تتحكم بكل شيء</h2><p className="max-w-2xl leading-8 text-slate-500">عدّل النصوص، أضف أعمالك مع الصور والفيديوهات والروابط، أضف تقييمات العملاء، وتابع بيانات كل شخص عبّأ نموذج التواصل.</p></div></section>}
        {tab === "covers" && <ServiceCoversPanel content={content} onSave={(key: string, label: string, url: string) => saveContent.mutate({ contentKey: key, label, contentValue: url })} />}
        {tab === "content" && <ContentPanel content={content} form={contentForm} setForm={setContentForm} onSave={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); saveContent.mutate(contentForm); }} onEdit={(item: any) => setContentForm({ contentKey: item.contentKey, label: item.label, contentValue: item.contentValue })} />}
        {tab === "work" && <WorkPanel work={work} form={workForm} setForm={setWorkForm} onSubmit={submitWork} onEdit={(item: any) => setWorkForm(item)} onDelete={(id: number) => deleteWork.mutate({ id })} onUpload={handleUpload} onUploadThumbnail={handleThumbnailUpload} onUploadGallery={(event: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []).slice(0, 4 - (workForm.gallery?.length ?? 0)); files.reduce((chain, file) => chain.then(() => uploadGallery.upload(file)), Promise.resolve()); event.target.value = ""; }} uploading={uploadMedia.uploading} uploadingThumbnail={uploadThumbnail.uploading} uploadingGallery={uploadGallery.uploading} />}
        {tab === "testimonials" && <TestimonialPanel items={testimonials} form={testimonialForm} setForm={setTestimonialForm} onSubmit={submitTestimonial} onEdit={(item: any) => setTestimonialForm(item)} onDelete={(id: number) => deleteTestimonial.mutate({ id })} />}
        {tab === "leads" && <LeadsPanel leads={leads} onStatus={(id: number, status: "new" | "contacted" | "closed") => updateLead.mutate({ id, status })} onContractTest={(lead: any, template: string, attachmentUrl?: string) => sendContractTest(lead, template, attachmentUrl)} onPayment={(lead: any, template: string, service: string, amount: string) => { pendingEmail.current = { email: lead.email, name: lead.name, service, amount, template }; createPayment.mutate({ name: lead.name, email: lead.email, phone: lead.phone || undefined, service, description: lead.message || undefined, amount: Math.round(Number(amount) * 100) }); }} creating={createPayment.isPending} />}
        {tab === "payments" && <PaymentsPanel payments={payments} leads={leads} onSendLink={(item: any, template: string) => sendPaymentLink.mutate({ to: item.email, subject: `رابط الدفع — ${item.service}`, template, values: { name: item.name, email: item.email, service: item.service, amount: (item.amount / 100).toFixed(2), link: `${window.location.origin}/pay/${item.publicToken}` } })} sendingLink={sendPaymentLink.isPending} onCreate={(input: any, emailData: any) => { pendingEmail.current = emailData; createPayment.mutate(input); }} creating={createPayment.isPending} onContractTest={(lead: any, template: string, attachmentUrl?: string) => sendContractTest(lead, template, attachmentUrl)} onLeadStatus={(id: number, status: "new" | "contacted" | "closed") => updateLead.mutate({ id, status })} onStatus={(id: number, status: "pending" | "paid" | "failed" | "expired") => updatePayment.mutate({ id, status })} />}
        {tab === "settings" && <SettingsPanel form={settingsForm} setForm={setSettingsForm} current={integrationData.data} checks={integrationChecks.data} saving={saveSettings.isPending} testing={testEmail.isPending} onTestEmail={() => testEmail.mutate()} onSave={(event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); saveSettings.mutate({ ...settingsForm, smtpPort: settingsForm.smtpPort ? Number(settingsForm.smtpPort) : null }); }} />}
        {tab === "settings" && <DevicesPanel />}
      </main>
    </div>
  </div>;
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) { return <div className={`rounded-3xl ${color} p-6 shadow-sm`}><div className="mb-8 text-sm opacity-70">{label}</div><div className="text-4xl font-black">{value}</div></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-5 xl:grid-cols-[1fr_1.2fr]"><div className="rounded-3xl bg-white p-6 shadow-sm">{children}</div><div className="rounded-3xl bg-[#b9e4dc] p-6"><h2 className="mb-2 text-xl font-black">{title}</h2><p className="leading-8 text-[#0d2b52]/70">التعديلات التي تحفظها هنا تظهر في الموقع العام بعد التحديث مباشرة.</p></div></section>; }
function SecretField({ label, name, value, configured, onChange, placeholder }: { label: string; name: string; value: string; configured?: boolean; onChange: (value: string) => void; placeholder: string }) { return <Field label={label}><div className="relative"><KeyRound className="absolute right-3 top-3 text-[#0d2b52]/40" size={16} /><input className={`${inputClass} pr-10`} name={name} type="password" value={value} onChange={(event) => onChange(event.target.value)} placeholder={configured ? "مفتاح محفوظ — اكتب قيمة جديدة للاستبدال" : placeholder} autoComplete="new-password" /></div>{configured && <small className="mt-1 block text-xs font-normal text-emerald-700">مُضبط ومحفوظ مشفّرًا — لن يظهر المفتاح الحالي هنا</small>}</Field>; }
function SettingsPanel({ form, setForm, current, checks, saving, testing, onTestEmail, onSave }: { checks?: Record<string, "ok" | "invalid" | "missing">;  form: SettingsForm; setForm: React.Dispatch<React.SetStateAction<SettingsForm>>; current: any; saving: boolean; testing: boolean; onTestEmail: () => void; onSave: (event: React.FormEvent<HTMLFormElement>) => void }) { const update = (key: keyof SettingsForm, value: string) => setForm((old) => ({ ...old, [key]: value })); return <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><form onSubmit={onSave} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">الإعدادات والتكاملات</h2><p className="mt-2 text-sm leading-7 text-slate-500">اجمع إعدادات الهوية والبريد والدفع والتحقق في مكان واحد. المفاتيح السرية تُشفّر قبل حفظها ولا نعرضها مرة أخرى.</p></div><Settings className="text-[#f47763]" size={28} /></div><div className="rounded-2xl bg-[#fff5df] p-4"><div className="mb-4 flex items-center gap-2 font-black"><Globe2 size={18} />بيانات الهوية والدومين</div><div className="grid gap-3 sm:grid-cols-2"><Field label="اسم العلامة"><input className={inputClass} value={form.brandName} onChange={(e) => update("brandName", e.target.value)} required /></Field><Field label="الدومين الرسمي"><input className={inputClass} dir="ltr" value={form.officialDomain} onChange={(e) => update("officialDomain", e.target.value)} placeholder="safar.com.sa" /></Field></div><div className="grid gap-3 sm:grid-cols-2"><Field label="البريد الرسمي"><input className={inputClass} dir="ltr" type="email" value={form.businessEmail} onChange={(e) => update("businessEmail", e.target.value)} placeholder="hello@safar.com.sa" /></Field><Field label="رقم وثيقة العمل الحر"><input className={inputClass} dir="ltr" value={form.freelanceLicenseNumber} onChange={(e) => update("freelanceLicenseNumber", e.target.value)} placeholder="1234567890" /></Field><Field label="رقم وثيقة مركز الأعمال"><input className={inputClass} dir="ltr" value={form.businessCenterNumber} onChange={(e) => update("businessCenterNumber", e.target.value)} placeholder="SBC-000000" /></Field><Field label="رقم واتساب بزنس"><input className={inputClass} dir="ltr" type="tel" value={form.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} placeholder="05xxxxxxxx أو +9665xxxxxxxx" /><small className="mt-1 block text-xs font-normal text-slate-500">سيظهر زر واتساب للزوار ويفتح محادثة مباشرة.</small></Field><Field label="اسم المرسل"><input className={inputClass} value={form.senderName} onChange={(e) => update("senderName", e.target.value)} placeholder="سَفَر للاستوديو" /></Field></div><div className="mt-2 grid gap-3 sm:grid-cols-3"><Field label="إنستقرام"><input className={inputClass} dir="ltr" type="url" value={form.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." /></Field><Field label="لينكدإن"><input className={inputClass} dir="ltr" type="url" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." /></Field><Field label="تيك توك"><input className={inputClass} dir="ltr" type="url" value={form.tiktokUrl} onChange={(e) => update("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@..." /></Field></div></div><div className="rounded-2xl bg-[#b9e4dc]/50 p-4"><div className="mb-4 flex items-center gap-2 font-black"><Mail size={18} />البريد — SMTP (حساب بريدك)</div><div className="grid gap-3 sm:grid-cols-2"><Field label="SMTP Host"><input className={inputClass} dir="ltr" value={form.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} placeholder="smtp.gmail.com" /></Field><Field label="المنفذ (Port)"><input className={inputClass} dir="ltr" inputMode="numeric" value={form.smtpPort} onChange={(e) => update("smtpPort", e.target.value)} placeholder="465" /></Field></div><Field label="اسم المستخدم (البريد)"><input className={inputClass} dir="ltr" type="email" value={form.smtpUser} onChange={(e) => update("smtpUser", e.target.value)} placeholder="you@example.com" /></Field><SecretField label="كلمة مرور التطبيق (App Password)" name="smtpPassword" value={form.smtpPassword} configured={current?.smtpPassword?.configured} onChange={(value) => update("smtpPassword", value)} placeholder="كلمة المرور الخاصة بالتطبيق" /><div className="-mt-2 flex flex-wrap items-center gap-3"><button type="button" disabled={testing} onClick={onTestEmail} className="rounded-xl bg-white px-4 py-2 text-sm font-bold disabled:opacity-60">{testing ? "جارٍ الإرسال…" : "إرسال رسالة اختبار لبريدي"}</button><p className="text-xs leading-6 text-slate-500">احفظ الإعدادات أولًا، ثم جرّب الإرسال. مثال Gmail: الخادم smtp.gmail.com والمنفذ 465 وكلمة مرور التطبيق من إعدادات الأمان.</p></div></div><div className="rounded-2xl bg-[#b9e4dc]/30 p-4"><div className="mb-4 flex items-center gap-2 font-black"><Mail size={18} />Resend — اختياري</div><SecretField label="Resend API Key" name="resendApiKey" value={form.resendApiKey} configured={current?.resendApiKey?.configured} onChange={(value) => update("resendApiKey", value)} placeholder="re_..." /><p className="-mt-2 text-xs leading-6 text-slate-500">بعد توثيق الدومين في Resend، ضع سجلات SPF وDKIM في قسم DNS أدناه، ثم استخدم البريد الرسمي كمرسل.</p></div><div className="rounded-2xl bg-[#d8d0f4]/60 p-4"><div className="mb-4 flex items-center gap-2 font-black"><CreditCard size={18} />Moyasar — الدفع</div><Field label="وضع التشغيل"><select className={inputClass} value={form.mode} onChange={(e) => update("mode", e.target.value)}><option value="test">Test — تجربة بدون خصم حقيقي</option><option value="live">Live — دفع حقيقي</option></select></Field><div className="rounded-2xl border border-[#0d2b52]/10 bg-white p-4"><div className="mb-4 flex items-center justify-between gap-2"><span className="font-black">الربط للبيئة الفعلية (Live)</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${form.mode === "live" ? "bg-[#b9e4dc] text-[#0d2b52]" : "bg-slate-100 text-slate-500"}`}>{form.mode === "live" ? "مفعّلة الآن" : "غير مفعّلة"}</span></div><SecretField label="Live Publishable Key" name="moyasarPublishableKey" value={form.moyasarPublishableKey} configured={current?.moyasarPublishableKey?.configured} onChange={(value) => update("moyasarPublishableKey", value)} placeholder="pk_live_..." /><SecretField label="Live Secret Key" name="moyasarSecretKey" value={form.moyasarSecretKey} configured={current?.moyasarSecretKey?.configured} onChange={(value) => update("moyasarSecretKey", value)} placeholder="sk_live_..." /><SecretField label="Live Webhook Secret" name="moyasarWebhookSecret" value={form.moyasarWebhookSecret} configured={current?.moyasarWebhookSecret?.configured} onChange={(value) => update("moyasarWebhookSecret", value)} placeholder="Live webhook secret" /></div><div className="rounded-2xl border border-[#0d2b52]/10 bg-white p-4"><div className="mb-4 flex items-center justify-between gap-2"><span className="font-black">الربط للبيئة التجريبية (Test)</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${form.mode === "test" ? "bg-[#ffe49d] text-[#0d2b52]" : "bg-slate-100 text-slate-500"}`}>{form.mode === "test" ? "مفعّلة الآن" : "غير مفعّلة"}</span></div><SecretField label="Test Publishable Key" name="moyasarTestPublishableKey" value={form.moyasarTestPublishableKey} configured={current?.moyasarTestPublishableKey?.configured} onChange={(value) => update("moyasarTestPublishableKey", value)} placeholder="pk_test_..." /><SecretField label="Test Secret Key" name="moyasarTestSecretKey" value={form.moyasarTestSecretKey} configured={current?.moyasarTestSecretKey?.configured} onChange={(value) => update("moyasarTestSecretKey", value)} placeholder="sk_test_..." /><SecretField label="Test Webhook Secret" name="moyasarTestWebhookSecret" value={form.moyasarTestWebhookSecret} configured={current?.moyasarTestWebhookSecret?.configured} onChange={(value) => update("moyasarTestWebhookSecret", value)} placeholder="Test webhook secret" /></div></div><div className="rounded-2xl bg-[#ffe49d]/60 p-4"><div className="mb-4 flex items-center gap-2 font-black"><ShieldCheck size={18} />DNS وApple Pay</div><p className="mb-3 text-xs leading-6 text-slate-600">انسخ السجلات التي يعطيك إياها Resend أو Moyasar هنا كمرجع. الإضافة الفعلية تتم في لوحة شركة الدومين.</p><Field label="سجلات DNS — SPF / DKIM / DMARC / MX"><textarea className={`${inputClass} min-h-32 font-mono text-xs`} dir="ltr" value={form.dnsRecords} onChange={(e) => update("dnsRecords", e.target.value)} placeholder={'TXT @ "v=spf1 ..."\nCNAME resend._domainkey ...'} /></Field><Field label="ملف Apple Pay association"><textarea className={`${inputClass} min-h-24 font-mono text-xs`} dir="ltr" value={form.applePayAssociation} onChange={(e) => update("applePayAssociation", e.target.value)} placeholder="الصق محتوى ملف apple-developer-merchantid-domain-association" /></Field></div><Button disabled={saving} className="w-full bg-[#0d2b52] py-6 text-base"><Save size={18} />{saving ? "جارٍ الحفظ…" : "حفظ إعدادات التكاملات"}</Button></form><aside className="space-y-4"><div className="rounded-3xl bg-[#0d2b52] p-6 text-[#fff5df]"><h3 className="mb-3 text-xl font-black">حالة الربط</h3><CheckRow label="Resend" state={checks?.resend} fallback={current?.resendApiKey?.configured} /><CheckRow label="Moyasar Live" state={checks?.moyasarLive} fallback={current?.moyasarSecretKey?.configured} />
<CheckRow label="Moyasar Test" state={checks?.moyasarTest} fallback={current?.moyasarTestSecretKey?.configured} /><StatusRow label="Moyasar Secret" configured={current?.moyasarSecretKey?.configured} /><StatusRow label="Webhook" configured={current?.moyasarWebhookSecret?.configured} />
<StatusRow label="البريد الرسمي" configured={Boolean(current?.businessEmail)} />
<StatusRow label="واتساب" configured={Boolean(current?.whatsappNumber)} />
<StatusRow label="الدومين" configured={Boolean(current?.officialDomain)} />
<StatusRow label="رقم السجل التجاري أو وثيقة العمل الحر" configured={Boolean(current?.freelanceLicenseNumber)} />
<StatusRow label="مركز الأعمال" configured={Boolean(current?.businessCenterNumber)} />
<StatusRow label="انستقرام" configured={Boolean(current?.instagramUrl)} />
<StatusRow label="لينكدإن" configured={Boolean(current?.linkedinUrl)} />
<StatusRow label="تيك توك" configured={Boolean(current?.tiktokUrl)} />
<StatusRow label="SMTP" configured={Boolean(current?.smtpHost)} /></div><div className="rounded-3xl bg-[#f47763] p-6"><h3 className="mb-3 text-xl font-black">الترتيب الصحيح</h3><ol className="space-y-3 text-sm leading-7"><li>١. احجز الدومين وأضفه هنا.</li><li>٢. وثّق الدومين في Resend وأضف سجلات DNS.</li><li>٣. أضف مفاتيح Moyasar في وضع Test.</li><li>٤. ارفع ملف Apple Pay داخل <code dir="ltr">/.well-known/</code>.</li><li>٥. اختبر ثم بدّل إلى Live.</li></ol></div><div className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-2 flex items-center gap-2 font-black"><Apple size={18} />Apple Pay</div><p className="text-sm leading-7 text-slate-500">بعد ربط الدومين، يجب تسجيله داخل لوحة Moyasar ورفع ملف التحقق. هذه الشاشة تحفظ المحتوى كمرجع ولا تعتبر التحقق مكتملًا تلقائيًا.</p></div></aside></section>; }
// "متصل" only after the key was checked and worked; a saved but wrong key shows "مفتاح غير صحيح".
function CheckRow({ label, state, fallback }: { label: string; state?: "ok" | "invalid" | "missing"; fallback?: boolean }) {
  const text = state === "ok" ? "متصل" : state === "invalid" ? "مفتاح غير صحيح" : state === "missing" ? "غير مضاف" : fallback ? "محفوظ (لم يُفحص)" : "غير مضاف";
  const color = state === "ok" ? "text-[#b9e4dc]" : state === "invalid" ? "text-[#f4a596]" : "text-white/50";
  return <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm"><span>{label}</span><span className={color}>{text}</span></div>;
}
function StatusRow({ label, configured }: { label: string; configured?: boolean }) { return <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm"><span>{label}</span><span className={configured ? "text-[#b9e4dc]" : "text-white/50"}>{configured ? "مُضبط" : "غير مضاف"}</span></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="mb-4 block text-sm font-bold">{label}<div className="mt-2">{children}</div></label>; }
const inputClass = "w-full rounded-xl border border-[#0d2b52]/15 bg-[#fffaf0] px-3 py-2.5 outline-none focus:border-[#f47763]";

function ContentPanel({ content, form, setForm, onSave, onEdit }: any) { return <Panel title="نصوص قابلة للتعديل"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-black">النصوص</h2><span className="rounded-full bg-[#fff5df] px-3 py-1 text-xs">{content.length} نص</span></div><form onSubmit={onSave}><Field label="المفتاح الداخلي"><input className={inputClass} value={form.contentKey} onChange={(e) => setForm({ ...form, contentKey: e.target.value })} placeholder="hero.title" required /></Field><Field label="اسم الحقل"><input className={inputClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="عنوان الـ Hero" required /></Field><Field label="النص"><textarea className={`${inputClass} min-h-32`} value={form.contentValue} onChange={(e) => setForm({ ...form, contentValue: e.target.value })} required /></Field><Button className="w-full bg-[#0d2b52]"><Save size={16} />حفظ النص</Button></form><div className="mt-8 space-y-2">{content.map((item: any) => <button key={item.id} onClick={() => onEdit(item)} className="flex w-full items-center justify-between rounded-xl bg-[#fff5df] p-3 text-right hover:bg-[#ffe49d]"><span><b>{item.label}</b><small className="mt-1 block max-w-xs truncate text-slate-500">{item.contentValue}</small></span><Pencil size={15} /></button>)}</div></Panel>; }

// Labels typed one at a time: Enter or comma adds a chip, × removes it.
function TagInput({ value, onChange, placeholder, dir }: { value: string[]; onChange: (next: string[]) => void; placeholder: string; dir?: "ltr" | "rtl" }) {
  const [draft, setDraft] = useState("");
  const add = () => { const tag = draft.trim(); if (tag && !value.includes(tag) && value.length < 8) onChange([...value, tag]); setDraft(""); };
  return <div className={`${inputClass} flex flex-wrap items-center gap-1.5`} dir={dir}>{value.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-[#ffd86b] px-2 py-0.5 text-sm font-bold text-[#0d2b52]">{tag}<button type="button" aria-label={`حذف ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}><X size={13} /></button></span>)}<input className="min-w-[8rem] flex-1 bg-transparent outline-none" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1)); }} onBlur={add} placeholder={value.length < 8 ? placeholder : ""} /></div>;
}

function WorkCardFields({ form, setForm, onUploadGallery, uploadingGallery }: any) {
  const gallery: string[] = form.gallery ?? [];
  return <div className="mb-4 rounded-2xl border border-[#0d2b52]/15 bg-[#f3faf8] p-4">
    <div className="mb-1 text-sm font-black">بطاقة قسم الأعمال في الصفحة الرئيسية</div>
    <p className="mb-3 text-xs text-slate-500">الليبلات الصفراء تظهر فوق يمين الصورة. اكتب الليبل واضغط Enter. إذا تركتها فارغة يظهر نوع العمل.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="الليبلات (عربي)"><TagInput value={form.tags ?? []} onChange={(tags) => setForm({ ...form, tags })} placeholder="مثال: هوية بصرية" /></Field>
      <Field label="Labels (English)"><TagInput dir="ltr" value={form.tagsEn ?? []} onChange={(tagsEn) => setForm({ ...form, tagsEn })} placeholder="e.g. Brand identity" /></Field>
      <Field label="الليبل الجانبي على اليسار (عربي، كلمة أو كلمتين)"><input className={inputClass} maxLength={16} value={form.sideLabel ?? ""} onChange={(e) => setForm({ ...form, sideLabel: e.target.value })} placeholder="سَفَر" /></Field>
      <Field label="Side label (English)"><input className={inputClass} dir="ltr" maxLength={16} value={form.sideLabelEn ?? ""} onChange={(e) => setForm({ ...form, sideLabelEn: e.target.value })} placeholder="SAFAR" /></Field>
    </div>
    <div className="mt-1 text-sm font-bold">صور إضافية حول البطاقة <span className="font-normal text-slate-500">(على الكمبيوتر فقط، حتى ٤ صور)</span></div>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {gallery.map((url, i) => <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#0d2b52]/15 bg-white"><img src={url} alt={`صورة إضافية ${i + 1}`} className="h-full w-full object-cover" /><button type="button" aria-label="حذف الصورة" onClick={() => setForm({ ...form, gallery: gallery.filter((g) => g !== url) })} className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-red-500"><X size={14} /></button></div>)}
      {gallery.length < 4 && <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border border-dashed border-[#0d2b52]/30 bg-white text-center text-xs font-bold text-[#0d2b52]"><span className="grid place-items-center gap-1"><ImagePlus size={18} />{uploadingGallery ? "جارٍ الرفع…" : "إضافة"}</span><input type="file" accept="image/*" multiple className="hidden" onChange={onUploadGallery} /></label>}
    </div>
  </div>;
}

function WorkPanel({ work, form, setForm, onSubmit, onEdit, onDelete, onUpload, onUploadThumbnail, onUploadGallery, uploading, uploadingThumbnail, uploadingGallery }: any) { return <Panel title="أضف أعمالك بصور وفيديوهات وروابط"><form onSubmit={onSubmit}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">{form.id ? "تعديل العمل" : "إضافة عمل"}</h2>{form.id && <button type="button" onClick={() => setForm(emptyWork)}><X size={18} /></button>}</div><div className="grid gap-3 sm:grid-cols-2"><Field label="عنوان العمل (عربي)"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field><Field label="Project title (English)"><input className={inputClass} dir="ltr" value={form.titleEn ?? ""} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Optional" /></Field></div><div className="grid gap-3 sm:grid-cols-2"><Field label="الوصف (عربي)"><textarea className={`${inputClass} min-h-20`} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field><Field label="Description (English)"><textarea dir="ltr" className={`${inputClass} min-h-20`} value={form.descriptionEn ?? ""} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Optional" /></Field></div><div className="grid gap-3 sm:grid-cols-2"><Field label="نوع العمل (عربي — يظهر تحت العنوان)"><input className={inputClass} list="work-types" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="مثال: سوشال ميديا" required /><datalist id="work-types"><option value="سوشال ميديا" /><option value="موشن" /><option value="موقع" /><option value="تصوير ومونتاج" /><option value="هوية بصرية" /><option value="تصميم واجهات" /></datalist></Field><Field label="Work type (English)"><input className={inputClass} dir="ltr" value={form.categoryEn ?? ""} onChange={(e) => setForm({ ...form, categoryEn: e.target.value })} placeholder="e.g. Social media" /></Field><Field label="نوع العرض"><select className={inputClass} value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })}><option value="video">فيديو</option><option value="image">صورة</option><option value="link">رابط موقع</option></select></Field></div><Field label="رابط الصورة / الفيديو / الموقع"><input className={inputClass} value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://... أو ارفع ملف من جهازك" required /></Field><div className="mb-4 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#b9e4dc] px-4 py-2 text-sm font-bold"><Upload size={16} />{uploading ? "جارٍ الرفع…" : "رفع ملف من جهازك"}<input type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} /></label><span className="self-center text-xs text-slate-500">حتى 300MB</span></div><div className="mb-4 rounded-2xl border border-dashed border-[#0d2b52]/20 bg-[#fffaf0] p-4"><div className="mb-2 text-sm font-bold">غلاف الصورة / الفيديو <span className="font-normal text-slate-500">(اختياري)</span></div><div className="flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#ffe49d] px-4 py-2 text-sm font-bold"><ImagePlus size={16} />{uploadingThumbnail ? "جارٍ رفع الغلاف…" : "اختيار غلاف من الجهاز"}<input type="file" accept="image/*" className="hidden" onChange={onUploadThumbnail} /></label>{form.thumbnailUrl && <span className="max-w-[220px] truncate text-xs text-emerald-700">تم اختيار الغلاف</span>}</div><small className="mt-2 block text-xs text-slate-500">اتركها فارغة إذا لم ترغب في إضافة غلاف. ويمكنك أيضًا لصق رابط مباشر أسفل الزر.</small><input className={`${inputClass} mt-3`} value={form.thumbnailUrl ?? ""} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="أو https://..." /></div><WorkCardFields form={form} setForm={setForm} onUploadGallery={onUploadGallery} uploadingGallery={uploadingGallery} /><Field label="رابط المشروع (اختياري)"><input className={inputClass} value={form.projectUrl ?? ""} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} /></Field><label className="mb-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />إظهار العمل في الموقع</label><Button className="w-full bg-[#0d2b52]"><Save size={16} />{form.id ? "حفظ التعديلات" : "إضافة العمل"}</Button></form><div className="mt-8 space-y-3">{work.map((item: any) => <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-[#fff5df] p-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white">{item.mediaType === "video" ? <Video size={18} /> : <ImagePlus size={18} />}</div><div className="min-w-0 flex-1"><b className="block truncate">{item.title}</b><small className="text-slate-500">{item.category} · {item.isPublished ? "منشور" : "مخفي"}</small></div><button onClick={() => onEdit(item)}><Pencil size={16} /></button><button onClick={() => onDelete(item.id)} className="text-red-500"><Trash2 size={16} /></button></div>)}</div></Panel>; }

function TestimonialPanel({ items, form, setForm, onSubmit, onEdit, onDelete }: any) { return <Panel title="أضف تقييمات العملاء"><form onSubmit={onSubmit}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">{form.id ? "تعديل التقييم" : "إضافة تقييم"}</h2>{form.id && <button type="button" onClick={() => setForm(emptyTestimonial)}><X size={18} /></button>}</div><Field label="اسم العميل"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field><Field label="الشركة / المسمى"><input className={inputClass} value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field><Field label="نص التقييم"><textarea className={`${inputClass} min-h-32`} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} required /></Field><Field label="التقييم من 5"><select className={inputClass} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}</select></Field><label className="mb-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />إظهار التقييم</label><Button className="w-full bg-[#0d2b52]"><MessageSquareQuote size={16} />{form.id ? "حفظ التعديلات" : "إضافة التقييم"}</Button></form><div className="mt-8 space-y-3">{items.map((item: any) => <div key={item.id} className="rounded-2xl bg-[#fff5df] p-4"><div className="flex items-center justify-between"><b>{item.name}</b><span className="text-[#f47763]">{"★".repeat(item.rating)}</span></div><p className="my-2 line-clamp-2 text-sm text-slate-600">{item.quote}</p><div className="flex gap-3 text-xs"><button onClick={() => onEdit(item)} className="font-bold">تعديل</button><button onClick={() => onDelete(item.id)} className="text-red-500">حذف</button></div></div>)}</div></Panel>; }

function LeadsPanel({ leads, onStatus, onContractTest, onPayment, creating }: any) {
  const [contractFiles, setContractFiles] = useState<Record<number, string>>({});
  const [contractLeadId, setContractLeadId] = useState<number | null>(null);
  const contractUpload = useUpload((url) => { if (contractLeadId !== null) setContractFiles((old) => ({ ...old, [contractLeadId]: url })); toast.success("تم إرفاق العقد"); });
  const [contractTemplate, setContractTemplate] = useState("مرحبًا {name}،\n\nيسعدنا إرسال عقد مشروعك لخدمة {service}.\n\nالعقد مرفق مع هذه الرسالة.\n\nبيانات التواصل: {email}\n\nمع تحيات فريق سَفَر.");
  const [paymentTemplate, setPaymentTemplate] = useState("مرحبًا {name}،\n\nتم تجهيز طلبك لخدمة {service} بقيمة {amount} ر.س.\n\nرابط الدفع:\n{link}\n\nشكرًا لاختيارك سَفَر.");
  const [service, setService] = useState("تصميم هوية بصرية"); const [amount, setAmount] = useState("1500");
  return <section className="space-y-5"><div className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-black">صفحة العملاء</h2><p className="mt-1 text-sm text-slate-500">كل عميل ببياناته الكاملة وزر العقد وزر الدفع.</p></div><span className="rounded-full bg-[#f47763] px-3 py-1 text-sm font-bold">{leads.length}</span></div><div className="grid gap-4 lg:grid-cols-2">{leads.length === 0 && <div className="rounded-2xl bg-[#fff5df] p-8 text-center text-slate-500 lg:col-span-2">لا توجد طلبات بعد.</div>}{leads.map((lead: any) => <article key={lead.id} className="rounded-2xl border border-[#0d2b52]/10 bg-[#fffaf0] p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-black">{lead.name}</h3><p className="text-sm text-slate-500">{lead.email}</p><p className="text-sm text-slate-500">{lead.phone || "لا يوجد جوال"}</p></div><select value={lead.status} onChange={(e) => onStatus(lead.id, e.target.value)} className="rounded-lg border bg-white px-2 py-1 text-xs"><option value="new">جديد</option><option value="contacted">قيد الاتفاق</option><option value="closed">مغلق</option></select></div><div className="mt-4 rounded-xl bg-white p-3 text-sm leading-7"><b>الخدمة:</b> {lead.service || "غير محددة"}<br /><b>التفاصيل:</b> {lead.message || "—"}</div><div className="mt-4 rounded-xl border border-dashed border-[#0d2b52]/20 bg-white p-3"><div className="mb-2 text-sm font-bold">عقد العميل <span className="font-normal text-slate-500">(PDF أو صورة، يُرفق مع الإيميل)</span></div><div className="flex flex-wrap items-center gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#ffe49d] px-3 py-2 text-xs font-bold">{contractUpload.uploading && contractLeadId === lead.id ? "جارٍ الرفع…" : "اختيار ملف العقد"}<input type="file" accept="application/pdf,image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setContractLeadId(lead.id); contractUpload.upload(file); } event.target.value = ""; }} /></label>{contractFiles[lead.id] ? <><span className="text-xs font-bold text-emerald-700">تم إرفاق العقد</span><button type="button" onClick={() => setContractFiles((old) => { const next = { ...old }; delete next[lead.id]; return next; })} className="text-xs text-red-600 underline">إزالة</button></> : <span className="text-xs text-slate-500">لم يُرفق ملف بعد</span>}</div></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => onContractTest?.(lead, contractTemplate, contractFiles[lead.id])} className="rounded-xl bg-[#f47763] px-3 py-2 text-xs font-bold text-[#0d2b52]">إرسال العقد</button><button onClick={() => onPayment?.(lead, paymentTemplate, service, amount)} disabled={creating} className="rounded-xl bg-[#0d2b52] px-3 py-2 text-xs font-bold text-white">إرسال رابط الدفع</button></div></article>)}</div></div><div className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-black">الرسائل الثابتة</h2><div className="grid gap-4 lg:grid-cols-2"><label className="text-sm font-bold">رسالة العقد <span className="font-normal text-slate-500">{`{name}`} {`{service}`} {`{email}`} {`{link}`}</span><textarea className="mt-2 min-h-32 w-full rounded-xl border p-3 leading-7" value={contractTemplate} onChange={(e) => setContractTemplate(e.target.value)} /></label><label className="text-sm font-bold">رسالة الدفع <span className="font-normal text-slate-500">{`{name}`} {`{service}`} {`{amount}`} {`{link}`}</span><textarea className="mt-2 min-h-32 w-full rounded-xl border p-3 leading-7" value={paymentTemplate} onChange={(e) => setPaymentTemplate(e.target.value)} /></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">الخدمة الافتراضية<select className="mt-2 w-full rounded-xl border p-3" value={service} onChange={(e) => setService(e.target.value)}><option>تصميم هوية بصرية</option><option>موشن جرافيك</option><option>تصميم واجهة وموقع</option><option>استشارة إبداعية</option></select></label><label className="text-sm font-bold">السعر الافتراضي<input className="mt-2 w-full rounded-xl border p-3" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} /></label></div><p className="mt-4 text-xs leading-6 text-slate-500">الرسائل تُرسل لبريد العميل من بريدك الرسمي بعد تفعيل Resend من الإعدادات.</p></div></section>;
}
function PaymentsPanel({ payments, leads, onStatus, onLeadStatus, onCreate, onContractTest, onSendLink, sendingLink, creating }: any) { const linkTemplate = "مرحبًا {name}،\n\nتم تجهيز طلبك لخدمة {service} بقيمة {amount} ر.س.\n\nرابط الدفع:\n{link}\n\nشكرًا لاختيارك سَفَر.";
  const copy = (token: string) => { navigator.clipboard?.writeText(`${window.location.origin}/pay/${token}`); toast.success("تم نسخ رابط الدفع"); };
  const [selectedId, setSelectedId] = useState<number | "">(leads[0]?.id ?? "");
  const [service, setService] = useState("تصميم هوية بصرية");
  const [amount, setAmount] = useState("1500");
  const [template, setTemplate] = useState("مرحبًا {name}،\n\nتم تجهيز طلبك لخدمة {service} بقيمة {amount} ر.س.\n\nيمكنك مراجعة تفاصيل المشروع والدفع من الرابط التالي:\n{link}\n\nشكرًا لاختيارك سَفَر.");
  const [contractTemplate, setContractTemplate] = useState("مرحبًا {name}،\n\nيسعدنا إرسال عقد مشروعك لخدمة {service}.\n\nرابط العقد:\n{link}\n\nبيانات التواصل المسجلة: {email}\n\nمع تحيات فريق سَفَر.");
  const selected = leads.find((lead: any) => lead.id === selectedId);
  const makePayment = (lead: any) => { setSelectedId(lead.id); onCreate({ name: lead.name, email: lead.email, phone: lead.phone || undefined, service, description: lead.message || undefined, amount: Math.round(Number(amount) * 100) }, { email: lead.email, name: lead.name, service, amount, template }); onLeadStatus?.(lead.id, "contacted"); };
  const send = (event: React.FormEvent) => { event.preventDefault(); if (!selected) { toast.error("اختر عميلًا أولًا"); return; } makePayment(selected); };
  return <section className="space-y-5">
    <div className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-xl font-black">العملاء والطلبات</h2><p className="mt-1 text-sm text-slate-500">كل بطاقة تحتوي بيانات العميل وحالته وزري إرسال العقد ورابط الدفع.</p></div><div className="grid gap-4 lg:grid-cols-2">{leads.length === 0 && <div className="rounded-2xl bg-[#fff5df] p-6 text-center text-slate-500 lg:col-span-2">لا يوجد عملاء مدخلون بعد.</div>}{leads.map((lead: any) => <article key={lead.id} className="rounded-2xl border border-[#0d2b52]/10 bg-[#fffaf0] p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-black">{lead.name}</h3><p className="text-sm text-slate-500">{lead.email}</p><p className="text-sm text-slate-500">{lead.phone || "لا يوجد جوال"}</p></div><select value={lead.status} onChange={(e) => onLeadStatus?.(lead.id, e.target.value)} className="rounded-lg border bg-white px-2 py-1 text-xs"><option value="new">جديد</option><option value="contacted">قيد الاتفاق</option><option value="closed">مغلق</option></select></div><div className="mt-4 rounded-xl bg-white p-3 text-sm leading-7"><b>الخدمة المطلوبة:</b> {lead.service || "غير محددة"}<br /><b>تفاصيله:</b> {lead.message || "—"}</div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => onContractTest?.(lead, contractTemplate)} className="rounded-xl bg-[#f47763] px-3 py-2 text-xs font-bold text-[#0d2b52]">إرسال العقد</button><button onClick={() => makePayment(lead)} disabled={creating} className="rounded-xl bg-[#0d2b52] px-3 py-2 text-xs font-bold text-white">إرسال رابط الدفع</button></div></article>)}</div></div>
    <div className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-xl font-black">قوالب الإرسال وبيانات الرابط</h2><p className="mt-1 text-sm text-slate-500">عدّل الرسائل مرة واحدة، ثم استخدم زر كل عميل. المتغيرات تستبدل تلقائيًا.</p></div><form onSubmit={send} className="space-y-4"><div className="grid gap-3 md:grid-cols-[1fr_auto]"><select className="rounded-xl border p-3" value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))}>{leads.map((lead: any) => <option key={lead.id} value={lead.id}>{lead.name} — {lead.email}</option>)}</select>{selected && <span className="rounded-xl bg-[#ffe49d] px-4 py-3 text-center text-sm font-bold">{selected.status === "new" ? "جديد" : selected.status === "contacted" ? "قيد الاتفاق" : "مغلق"}</span>}</div><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">الخدمة<select className="mt-2 w-full rounded-xl border p-3" value={service} onChange={(e) => setService(e.target.value)}><option>تصميم هوية بصرية</option><option>موشن جرافيك</option><option>تصميم واجهة وموقع</option><option>استشارة إبداعية</option></select></label><label className="text-sm font-bold">السعر بالريال<input className="mt-2 w-full rounded-xl border p-3" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} /></label></div><label className="block text-sm font-bold">رسالة رابط الدفع <span className="font-normal text-slate-500">{`{name}`} {`{service}`} {`{amount}`} {`{link}`}</span><textarea className="mt-2 min-h-32 w-full rounded-xl border p-3 leading-7" value={template} onChange={(e) => setTemplate(e.target.value)} /></label><label className="block text-sm font-bold">رسالة العقد <span className="font-normal text-slate-500">{`{name}`} {`{service}`} {`{email}`} {`{link}`}</span><textarea className="mt-2 min-h-32 w-full rounded-xl border p-3 leading-7" value={contractTemplate} onChange={(e) => setContractTemplate(e.target.value)} /></label><button disabled={creating || !selected} className="w-full rounded-xl bg-[#0d2b52] p-4 font-bold text-white">إرسال رابط الدفع للعميل المحدد</button></form></div>
    <div className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-black">حالة روابط الدفع</h2><p className="mt-1 text-sm text-slate-500">كل رابط يحتفظ ببيانات العميل ومبلغ المشروع</p></div><span className="rounded-full bg-[#b9e4dc] px-3 py-1 text-sm font-bold">{payments.length}</span></div><div className="space-y-3">{payments.length === 0 && <div className="rounded-2xl bg-[#fff5df] p-8 text-center text-slate-500">لم يتم إرسال روابط دفع بعد.</div>}{payments.map((item: any) => <article key={item.id} className="rounded-2xl border border-[#0d2b52]/10 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{item.name}</h3><p className="text-sm text-slate-500">{item.email} · {item.service}</p></div><select value={item.status} onChange={(e) => onStatus(item.id, e.target.value)} className="rounded-lg border px-2 py-1 text-sm"><option value="pending">جاري الدفع</option><option value="paid">مدفوع</option><option value="failed">فشل</option><option value="expired">منتهي</option></select></div><div className="mt-3 grid gap-2 rounded-xl bg-[#fff5df] p-3 text-sm sm:grid-cols-3"><span><b>المبلغ:</b> {(item.amount / 100).toFixed(2)} ر.س</span><span><b>الحالة:</b> {item.status === "pending" ? "جاري الدفع" : item.status}</span><button onClick={() => copy(item.publicToken)} className="rounded-lg bg-[#0d2b52] px-3 py-2 text-xs font-bold text-white">نسخ الرابط</button><button disabled={sendingLink} onClick={() => onSendLink?.(item, linkTemplate)} className="rounded-lg bg-[#f47763] px-3 py-2 text-xs font-bold text-[#0d2b52] disabled:opacity-60">{sendingLink ? "جارٍ الإرسال…" : "أرسل الرابط للعميل بالإيميل"}</button></div></article>)}</div></div>
  </section>;
}

function useUpload(onDone: (url: string) => void) {
  const [uploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const response = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream", "X-File-Name": encodeURIComponent(file.name) }, body: file });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || (response.status === 413 ? "الملف أكبر من 300MB" : "تعذر رفع الملف"));
      onDone(result.url);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return { upload, uploading };
}

function DevicesPanel() {
  const devices = trpc.admin.devices.useQuery();
  const revoke = trpc.admin.revokeDevice.useMutation({ onSuccess: () => { toast.success("تم إلغاء الجهاز"); devices.refetch(); }, onError: (e) => toast.error(e.message) });
  const format = (date: Date) => new Date(date).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  return <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm"><div className="mb-2 flex items-center gap-2 text-xl font-black"><Laptop size={20} />الأجهزة المسموح لها بالدخول</div><p className="mb-5 text-sm leading-7 text-slate-500">لوحة التحكم تفتح من هذه الأجهزة فقط. لإضافة جهاز جديد افتح رابط الدخول السري منه مرة وحدة. إذا ضاع جهاز ألغه من هنا.</p><div className="space-y-3">{(devices.data ?? []).map((device) => <div key={device.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#fff5df] p-4"><div className="min-w-0 flex-1"><b className="block">{device.label}{device.isCurrent && <span className="mr-2 rounded-full bg-[#b9e4dc] px-2 py-0.5 text-xs">هذا الجهاز</span>}</b><small className="text-slate-500">أُضيف {format(device.createdAt)} · آخر دخول {format(device.lastSeenAt)}</small></div><button onClick={() => { if (device.isCurrent && !window.confirm("بتلغي هذا الجهاز وما راح تقدر تفتح لوحة التحكم منه إلا برابط الدخول السري. متأكد؟")) return; revoke.mutate({ id: device.id }); }} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">إلغاء الجهاز</button></div>)}</div></section>;
}

// The counters section: the site size meter and the daily visits.
function CountersSection() {
  return (
    <div className="mb-8 grid gap-5">
      <h2 className="text-xl font-black">العدادات</h2>
      <StorageMeter />
      <VisitsMeter />
    </div>
  );
}

function VisitsMeter() {
  const { isAdmin } = useAdmin();
  const stats = trpc.admin.visitStats.useQuery(undefined, { enabled: Boolean(isAdmin), refetchInterval: 30000 });
  const data = stats.data;
  if (!data) return null;
  const maxVisitors = Math.max(1, ...data.days.map((row) => row.visitors));
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm" aria-label="الزيارات">
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#ffe49d] p-4"><p className="text-sm text-[#557087]">زوار اليوم</p><p className="text-3xl font-black">{data.today.visitors}</p></div>
        <div className="rounded-2xl bg-[#9bd6d3] p-4"><p className="text-sm text-[#557087]">مشاهدات اليوم</p><p className="text-3xl font-black">{data.today.views}</p></div>
        <div className="rounded-2xl bg-[#ffd0c4] p-4 sm:col-span-2"><p className="text-sm text-[#557087]">مجموع الزوار هذا الشهر</p><p className="text-3xl font-black">{data.monthVisitors}</p></div>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <SourceList title="مصادر زوار اليوم" rows={data.sourcesToday} />
        <SourceList title="مصادر زوار الشهر" rows={data.sourcesMonth} />
      </div>
      <div className="grid gap-2">
        {data.days.map((row) => (
          <div key={row.day} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="text-[#557087]">{row.day}</span>
            <div className="h-3 overflow-hidden rounded-full bg-[#e9efef]"><div className="h-full rounded-full bg-[#ef7b66]" style={{ width: `${(row.visitors / maxVisitors) * 100}%` }} /></div>
            <span className="text-left font-bold">{row.visitors}</span>
          </div>
        ))}
        {data.days.length === 0 && <p className="text-sm text-[#557087]">ما فيه زيارات مسجلة بعد.</p>}
      </div>
    </section>
  );
}

const SOURCE_LABELS: Record<string, string> = { tiktok: "تيك توك", instagram: "انستقرام", snapchat: "سناب شات", google: "قوقل", facebook: "فيسبوك", youtube: "يوتيوب", x: "إكس", direct: "مباشر", internal: "داخلي", other: "أخرى" };

function SourceList({ title, rows }: { title: string; rows: { source: string; visits: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.visits));
  return (
    <div className="rounded-2xl bg-[#fff5df] p-4">
      <p className="mb-3 text-sm font-bold text-[#557087]">{title}</p>
      <div className="grid gap-2">
        {rows.map((row) => (
          <div key={row.source} className="grid grid-cols-[6rem_1fr_2.5rem] items-center gap-2 text-sm">
            <span>{SOURCE_LABELS[row.source] ?? row.source}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#9bd6d3]" style={{ width: `${(row.visits / max) * 100}%` }} /></div>
            <span className="text-left font-bold">{row.visits}</span>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-[#557087]">ما فيه بيانات بعد.</p>}
      </div>
    </div>
  );
}

// Live meter: how much of the server's disk the site uses, refreshed every 30 seconds.
function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function StorageMeter() {
  const { isAdmin } = useAdmin();
  const usage = trpc.admin.storageUsage.useQuery(undefined, { enabled: Boolean(isAdmin), refetchInterval: 30000 });
  const data = usage.data;
  if (!data) return null;
  const percent = data.limitBytes ? Math.min(100, (data.dataBytes / data.limitBytes) * 100) : 0;
  const tone = percent >= 90 ? "#c0392b" : percent >= 70 ? "#e0a100" : "#2e7d5b";
  return (
    <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm" aria-label="حجم البيانات">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-black">حجم الموقع والبيانات</h2>
        <span className="text-sm font-bold" style={{ color: tone }}>{formatBytes(data.dataBytes)} من {formatBytes(data.limitBytes)} ({percent.toFixed(1)}%)</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#e9efef]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: tone }} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
        <div><dt className="text-[#557087]">قاعدة البيانات</dt><dd className="font-bold">{formatBytes(data.databaseBytes)}</dd></div>
        <div><dt className="text-[#557087]">الملفات المرفوعة</dt><dd className="font-bold">{formatBytes(data.uploadsBytes)} ({data.uploadsCount})</dd></div>
        <div><dt className="text-[#557087]">مساحة السيرفر المتبقية</dt><dd className="font-bold">{formatBytes(data.diskFreeBytes)}</dd></div>
        <div><dt className="text-[#557087]">آخر تحديث</dt><dd className="font-bold">{new Date(data.checkedAt).toLocaleTimeString("ar-SA")}</dd></div>
      </dl>
    </section>
  );
}

// The five services and their preview covers. A cover is stored in the site content as service.<id>.cover.
const SERVICE_COVERS = [
  { id: "motion", title: "إنتاج الفيديو بالذكاء الاصطناعي" },
  { id: "systems", title: "الأتمتة والأنظمة الذكية" },
  { id: "branding", title: "التصميم والهويات البصرية" },
  { id: "ui", title: "تصميم واجهات وتجربة المستخدم" },
  { id: "consulting", title: "استشارات إبداعية" },
];

function ServiceCoversPanel({ content, onSave }: { content: any[]; onSave: (key: string, label: string, url: string) => void }) {
  const values = Object.fromEntries((content ?? []).map((item: any) => [item.contentKey, item.contentValue]));
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-2xl font-black">صور الخدمات</h2>
      <p className="mb-6 text-sm leading-7 text-slate-500">الصورة اللي تحطها هنا تطلع في كرت الخدمة على الصفحة الرئيسية. إذا ما فيه صورة، يطلع التصميم الافتراضي.</p>
      <div className="grid gap-4">
        {SERVICE_COVERS.map((service) => (
          <ServiceCoverRow key={service.id} service={service} value={values[`service.${service.id}.cover`] ?? ""} onSave={onSave} />
        ))}
      </div>
    </section>
  );
}

function ServiceCoverRow({ service, value, onSave }: { service: { id: string; title: string }; value: string; onSave: (key: string, label: string, url: string) => void }) {
  const key = `service.${service.id}.cover`;
  const label = `صورة خدمة: ${service.title}`;
  const upload = useUpload((url) => { onSave(key, label, url); toast.success("تم حفظ الصورة"); });
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#0d2b52]/10 p-4">
      <div className="h-20 w-28 overflow-hidden rounded-xl bg-[#fff5df]">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-slate-400">بدون صورة</div>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{service.title}</p>
        <p className="text-xs text-slate-500">{value ? "الصورة محفوظة" : "ما فيه صورة"}</p>
      </div>
      <label className="cursor-pointer rounded-xl bg-[#0d2b52] px-4 py-2 text-sm font-bold text-white">
        {upload.uploading ? "جاري الرفع..." : "رفع صورة"}
        <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.upload(file); event.target.value = ""; }} />
      </label>
      {value && <button type="button" className="rounded-xl border border-[#0d2b52]/20 px-4 py-2 text-sm font-bold" onClick={() => onSave(key, label, "")}>حذف الصورة</button>}
    </div>
  );
}
