import { MessageCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import "./home-v2.css";

const sampleReviews = [
  { name: "تجربة تفاعلية", company: "", quote: "يمكنك التنقل بين البطاقات هنا. أضف تقييمات العملاء المعتمدة قبل النشر." },
  { name: "مساحة رأي عميل", company: "", quote: "هنا يظهر نص تقييم العميل الثاني عند توفره." },
  { name: "مساحة رأي عميل", company: "", quote: "هنا يظهر نص تقييم العميل الثالث عند توفره." },
];

const sampleProjects = [
  { title: "هوية بصرية", category: "", description: "تصميم هوية متكاملة من الفكرة إلى التطبيق.", thumb: "✦", subtitle: "علامات تجارية لها شخصية" },
  { title: "تصميم مواقع", category: "", description: "مواقع وصفحات هبوط تفاعلية ومتجاوبة مع الأجهزة.", thumb: "▣", subtitle: "تجارب رقمية تنبض بالحياة" },
  { title: "موشن جرافيك", category: "", description: "فيديوهات ورسوم متحركة تنقل رسالتك بأسلوب مميز.", thumb: "▶", subtitle: "نحرّك الأفكار لتبقى في الذاكرة" },
  { title: "محتوى اجتماعي", category: "", description: "تصميم محتوى إبداعي للمنصات الاجتماعية.", thumb: "✳", subtitle: "تصاميم تخطف الانتباه" },
];

function normalizeWhatsapp(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  return digits;
}

export default function HomeV2() {
  const publicData = trpc.publicContent.all.useQuery();
  const createLead = trpc.publicContent.createLead.useMutation({
    onSuccess: () => { setStatus("وصلنا طلبك، وسنتواصل معك قريبًا."); toast.success("وصلنا طلبك — سنتواصل معك قريبًا."); (document.getElementById("contactForm") as HTMLFormElement | null)?.reset(); },
    onError: (error) => { setStatus(error.message); toast.error(error.message); },
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<null | { title: string; description: string; href: string; external: boolean }>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [status, setStatus] = useState("");

  const settings = publicData.data?.settings;
  const whatsapp = normalizeWhatsapp(settings?.whatsappNumber);
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : "";
  const liveWork = publicData.data?.portfolio ?? [];
  const liveReviews = (publicData.data?.testimonials ?? []).map((item) => ({ name: item.name, company: item.company ?? "", quote: item.quote }));
  const reviews = liveReviews.length ? liveReviews : sampleReviews;
  const review = reviews[reviewIndex % reviews.length];

  useEffect(() => {
    if (!modal) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setModal(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [modal]);

  function moveReview(step: number) {
    setReviewIndex((index) => (index + step + reviews.length) % reviews.length);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("");
    createLead.mutate({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim() || undefined,
      message: String(form.get("message") ?? "").trim() || undefined,
    });
  }

  const projectCards = liveWork.length
    ? liveWork.slice(0, 8).map((item) => ({
        key: item.id,
        title: item.title,
        category: item.category,
        description: item.description || item.category,
        subtitle: item.category,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        href: item.mediaType === "link" ? (item.projectUrl || item.mediaUrl) : `/works/${item.id}`,
        external: item.mediaType === "link",
      }))
    : sampleProjects.map((item, index) => ({ key: index, ...item, mediaType: "" as const, mediaUrl: "", thumbnailUrl: null, href: "", external: false }));

  return (
    <div className="home-v2" dir="rtl">
      <div className="reference-site">
        <header>
          <div className="nav">
            <div className="logo">سَفَر</div>
            <nav className={`links ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)}>
              <a href="#home">الرئيسية</a>
              <a href="#work">أعمالنا</a>
              <a href="#reviews">آراء عملائنا</a>
              <a href="#contact">تواصل معنا</a>
            </nav>
            <button className="menu-btn" aria-label="القائمة" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "✕" : "☰"}</button>
            <a href="#contact"><button className="pill header-cta" type="button">ابدأ مشروعك ↗</button></a>
          </div>
        </header>

        <main>
          <section className="hero" id="home">
            <div className="wrap">
              <div>
                <div>أهلاً بك 👋</div>
                <h1>أفكارك<br /><span>نصممها</span><br />ننفّذ.</h1>
                <p>نحوّل أفكارك إلى تجارب بصرية ورقمية استثنائية، من أول فكرة حتى آخر تفصيلة.</p>
                <a href="#contact"><button className="pill" type="button">خلّنا نبدأ ←</button></a>
              </div>
              <div className="hero-art">
                <div className="phone">
                  <strong>مشروعك يبدأ هنا</strong>
                  <div className="bar" />
                  <div className="bar" />
                  <div className="box" />
                  <div className="bar" />
                  <div className="bar" />
                </div>
                <div className="circle">أفكارك<br />واقع!</div>
              </div>
            </div>
          </section>

          <section className="mint" id="work">
            <div className="wrap">
              <h2 className="section-title">أفكار تحوّلت<br /><span className="accent">إلى حضور.</span></h2>
              <p>كل مشروع له قصة، وهنا بعض القصص اللي صنعناها.</p>
              <div className="projects">
                {projectCards.map((project) => (
                  <article
                    key={project.key}
                    className="project"
                    onClick={() => setModal({ title: project.title, description: project.description, href: project.href, external: project.external })}
                  >
                    <div className="thumb">
                      {project.mediaType === "video" && <video src={project.mediaUrl} poster={project.thumbnailUrl ?? undefined} muted loop playsInline autoPlay preload="metadata" />}
                      {project.mediaType === "image" && <img src={project.thumbnailUrl || project.mediaUrl} alt={project.title} />}
                      {project.mediaType === "link" && <span>↗</span>}
                      {!project.mediaType && <span>{(project as { thumb?: string }).thumb}</span>}
                    </div>
                    <h3>{project.title}</h3>
                    <p>{(project as { subtitle?: string }).subtitle}</p>
                  </article>
                ))}
              </div>
              {liveWork.length > 0 && <p style={{ marginTop: 28, textAlign: "center" }}><a className="all-link" href="/works">شاهد أعمالنا كاملة ←</a></p>}
            </div>
          </section>

          <section id="reviews">
            <div className="wrap" style={{ textAlign: "center" }}>
              <h2 className="section-title">تقييمات عملائنا</h2>
              <p>{liveReviews.length ? "ما يقوله عملاؤنا عن تجربتهم معنا." : "مساحة مخصصة لعرض تقييمات العملاء الحقيقية بعد إضافتها."}</p>
              <div className="testimonial">
                <div className="stars">{"★".repeat(5)}</div>
                <h3>{review.name}{review.company ? ` · ${review.company}` : ""}</h3>
                <p>{review.quote}</p>
              </div>
              <div className="controls">
                <button aria-label="التقييم السابق" onClick={() => moveReview(-1)} type="button">→</button>
                <button aria-label="التقييم التالي" onClick={() => moveReview(1)} type="button">←</button>
              </div>
            </div>
          </section>

          <section className="coral" id="contact">
            <div className="wrap contact-grid">
              <div>
                <h2 className="section-title">جاهز تخلي<br />فكرتك <span style={{ color: "white" }}>حقيقة؟</span></h2>
                <p>شاركنا تفاصيل مشروعك وخلّنا نصنع شيئاً مميزاً مع بعض.</p>
                {whatsappHref && <a className="whatsapp-link" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={16} /> واتساب مباشر</a>}
              </div>
              <form id="contactForm" onSubmit={submit}>
                <input className="field" required name="name" minLength={2} placeholder="الاسم الكامل" />
                <input className="field" required type="email" name="email" placeholder="البريد الإلكتروني" />
                <input className="field" name="phone" placeholder="رقم الجوال" />
                <textarea className="field" name="message" placeholder="حدثنا عن مشروعك" />
                <button className="pill submit-btn" type="submit" disabled={createLead.isPending}>{createLead.isPending ? "جارٍ الإرسال…" : "إرسال الطلب ↗"}</button>
                <p role="status">{status}</p>
              </form>
            </div>
          </section>
        </main>

        <footer className="footer">
          <strong>سَفَر</strong>
          <p>أفكارك نصممها وننفذها © 2026</p>
        </footer>

        <nav className="bottom">
          <a href="#home">⌂ الرئيسية</a>
          <a href="#work">▦ أعمالنا</a>
          <a href="#reviews">☆ التقييمات</a>
          <a href="#contact">✉ تواصل</a>
        </nav>

        {modal && (
          <div className="modal" onClick={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
            <div className="inner">
              <button className="close" aria-label="إغلاق" onClick={() => setModal(null)}>×</button>
              <h2>{modal.title}</h2>
              <p>{modal.description}</p>
              {modal.href && <a href={modal.href} target={modal.external ? "_blank" : undefined} rel={modal.external ? "noreferrer" : undefined}><button className="pill" type="button">{modal.external ? "افتح الموقع" : "شاهد العمل"}</button></a>}
              <a href="#contact" onClick={() => setModal(null)}><button className="pill" type="button">اطلب مشروع مشابه</button></a>
            </div>
          </div>
        )}

        {whatsappHref && (
          <a aria-label="تواصل معنا عبر واتساب" className="whatsapp-float" href={whatsappHref} rel="noreferrer" target="_blank">
            <MessageCircle size={26} />
          </a>
        )}
      </div>
    </div>
  );
}
