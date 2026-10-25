import { useEffect, useRef, useState, type FormEvent } from "react";
import { pickText, useLanguage } from "@/hooks/useLanguage";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Linkedin,
  MessageCircle,
  Menu,
  Music2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getEmbedUrl } from "@/lib/video";
import WorksStack, { placeholderWorks, toStackWork, type StackWork } from "@/components/WorksStack";
import SleepyCat from "@/components/SleepyCat";

// Where the open eyes sit on each cat image (in the image's pixels).
const PICK_CAT_EYES = [{ x: 81, y: 128, rx: 13, ry: 9.5 }, { x: 104, y: 128, rx: 13, ry: 9.5 }];
const POSTER_CAT_EYES = [{ x: 433, y: 748, rx: 16, ry: 12 }, { x: 489, y: 728, rx: 16, ry: 12 }];
const heroImage = "/brand/hero.png"; // hidden by the stylesheet; kept for the layout

type Service = {
  id: string;
  title: string;
  enTitle: string;
  subtitle: string;
  enSubtitle: string;
  details: string[];
  enDetails: string[];
  icon: string;
  image: string;
  enImage: string;
};

const services: Service[] = [
  { id: "motion", title: "إنتاج الفيديو بالذكاء الاصطناعي", enTitle: "AI video production", subtitle: "فيديوهات إبداعية وسريعة لعلامتك التجارية.", enSubtitle: "Fast, creative videos for your brand.", details: ["فيديوهات إعلانية", "محتوى سوشال ميديا", "شخصيات ثابتة (Character)", "مونتاج احترافي"], enDetails: ["Ad videos", "Social media content", "Consistent characters", "Professional editing"], icon: "▣", image: "فريمات وقصص تتحرك", enImage: "Frames and stories in motion" },
  { id: "systems", title: "الأتمتة والأنظمة الذكية", enTitle: "Smart systems & automation", subtitle: "حلول أذكى تسهّل عملك وتوفّر وقتك.", enSubtitle: "Smarter workflows that save time.", details: ["ربط واتساب للأعمال", "أنظمة مواعيد وحجوزات", "لوحات تحكم CRM", "حضور وانصراف للموظفين"], enDetails: ["WhatsApp for business", "Booking systems", "CRM dashboards", "Team attendance tools"], icon: "⚙", image: "نظام واضح، نتائج أسرع", enImage: "Clear systems, faster results" },
  { id: "branding", title: "التصميم والهويات البصرية", enTitle: "Brand identity & visual design", subtitle: "هويات كاملة وتصاميم تعكس قصتك.", enSubtitle: "Complete identities that tell your story.", details: ["شعار وهوية بصرية", "قوالب سوشال ميديا", "دليل استخدام الهوية", "تصاميم الحملات"], enDetails: ["Logo and visual identity", "Social media templates", "Brand guidelines", "Campaign design"], icon: "✎", image: "علامة لها حضور", enImage: "A brand with presence" },
  { id: "ui", title: "تصميم واجهات وتجربة المستخدم", enTitle: "UI/UX design", subtitle: "واجهات عصرية وتجربة استخدام مميزة.", enSubtitle: "Modern interfaces and effortless experiences.", details: ["تصميم مواقع ومنتجات", "تجربة مستخدم UX", "نماذج أولية تفاعلية", "نظام تصميم UI"], enDetails: ["Web and product design", "UX strategy", "Interactive prototypes", "UI design systems"], icon: "▣", image: "تجربة أسهل وأوضح", enImage: "A simpler, clearer experience" },
  { id: "consulting", title: "استشارات إبداعية", enTitle: "Creative consulting", subtitle: "من الفكرة إلى التنفيذ بخبرة حقيقية.", enSubtitle: "From idea to execution with real expertise.", details: ["جلسة اكتشاف", "توجيه للهوية", "خطة محتوى بصري", "خارطة طريق للمشروع"], enDetails: ["Discovery session", "Brand direction", "Visual content plan", "Project roadmap"], icon: "○", image: "قرار أفضل، من البداية", enImage: "Better decisions from day one" },
];

function SectionKicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`section-kicker ${light ? "section-kicker--light" : ""}`}><span className="kicker-dot" />{children}</div>;
}

function normalizeWhatsappNumber(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  return digits;
}

export default function Home() {
  const publicData = trpc.publicContent.all.useQuery();
  // The page is taller once its content loads, so a #section link has to scroll after that.
  const isLoaded = publicData.isSuccess;
  useEffect(() => {
    if (!isLoaded || window.location.hash.length < 2) return;
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isLoaded]);
  const createLead = trpc.publicContent.createLead.useMutation({
    onSuccess: () => { setSubmitted(true); toast.success("وصلنا طلبك — سنتواصل معك قريبًا."); },
    onError: (submitError) => toast.error(submitError.message),
  });

  const [menuOpen, setMenuOpen] = useState(false);
  // Every load: a small cat taps three services so visitors know they can choose.
  useEffect(() => {
    const phone = phoneRef.current;
    if (!phone || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = Array.from(phone.querySelectorAll<HTMLElement>(".phone-service"));
    if (!rows.length) return;
    const ghost = document.createElement("div");
    ghost.className = "ghost-pointer";
    ghost.innerHTML = '<img src="/brand/cat-sitting.png" alt="" width="56" height="62" />';
    phone.appendChild(ghost);
    const at = (el: HTMLElement) => {
      const p = phone.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: r.left - p.left + r.width * 0.72, y: r.top - p.top + r.height * 0.5 };
    };
    const start = { x: phone.clientWidth * 0.5, y: 6 };
    const timers: number[] = [];
    let t = 900;
    const move = (to: { x: number; y: number }, from: { x: number; y: number }, dur: number) =>
      ghost.animate([{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${to.x}px, ${to.y}px)` }], { duration: dur, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    ghost.animate([{ opacity: 0 }, { opacity: 0.9 }], { duration: 500, delay: t, fill: "forwards" });
    let from = start;
    for (let i = 0; i < 3; i++) {
      const row = rows[i % rows.length];
      const to = at(row);
      const when = t + 500 + i * 1100;
      timers.push(window.setTimeout(() => {
        move(to, from, 700);
      }, when - 500 + (i === 0 ? 0 : 0)));
      timers.push(window.setTimeout(() => row.classList.add("ghost-tap"), when + 700));
      timers.push(window.setTimeout(() => row.classList.remove("ghost-tap"), when + 1000));
      from = to;
    }
    const end = t + 500 + 3 * 1100 + 300;
    ghost.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 600, delay: end, fill: "forwards" });
    timers.push(window.setTimeout(() => ghost.remove(), end + 700));
    return () => { timers.forEach(clearTimeout); ghost.remove(); };
  }, []);

  const phoneRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useLanguage();
  const [activeId, setActiveId] = useState("motion");
  // A tap works like the cat's demo: the service lights up, the details open, then the phone returns to its normal state.
  const restTimer = useRef<number | undefined>(undefined);
  const tapService = (id: string) => {
    window.clearTimeout(restTimer.current);
    setActiveId(id);
    setPhoneOpen(true);
    restTimer.current = window.setTimeout(() => { setActiveId("motion"); setPhoneOpen(false); }, 1800);
  };
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonialTouchStart = useRef<number | null>(null);
  const activeService = services.find((service) => service.id === activeId) ?? services[0];
  const contentMap = Object.fromEntries((publicData.data?.content ?? []).map((item) => [item.contentKey, item.contentValue]));
  const livePortfolio = publicData.data?.portfolio ?? [];
  const liveTestimonials = publicData.data?.testimonials ?? [];
  const whatsappDigits = normalizeWhatsappNumber(publicData.data?.settings?.whatsappNumber);
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "";
  const displayedTestimonial = liveTestimonials[activeTestimonial] ?? liveTestimonials[0];
  useEffect(() => {
    if (liveTestimonials.length === 0) return;
    if (activeTestimonial >= liveTestimonials.length) setActiveTestimonial(0);
    if (liveTestimonials.length < 2) return;
    const timer = window.setInterval(() => setActiveTestimonial((current) => (current + 1) % liveTestimonials.length), 3000);
    return () => window.clearInterval(timer);
  }, [liveTestimonials.length, activeTestimonial]);
  const moveTestimonial = (direction: 1 | -1) => setActiveTestimonial((current) => liveTestimonials.length ? (current + direction + liveTestimonials.length) % liveTestimonials.length : 0);
  const text = (key: string, fallback: string, english = fallback) => (isArabic ? contentMap[key] || fallback : english);
  const isArabic = language === "ar";
  // Dashboard projects fill the deck once they have descriptions; until then it shows placeholder projects.
  const stackWorks: StackWork[] = livePortfolio.some((item) => pickText(language, item.description, item.descriptionEn))
    ? livePortfolio.map((item) => toStackWork(item, language))
    : placeholderWorks(isArabic);
  const copy = isArabic ? {
    home: "الرئيسية", services: "الخدمات", work: "أعمالنا", contact: "تواصل", topbar: "نحوّل الأفكار إلى تجارب تُحرّك الأثر", places: "الرياض · جدة · عن بُعد", heroA: "أفكارك", heroB: "نصممها", heroC: "تنفّذ.", heroLead: "تحويل أفكارك إلى تصاميم وتجارب رقمية تترك أثرًا.", heroCta: "اختر ما يلهمك", sideA: "كل ما تحتاجه", sideB: "في مكان واحد", sideC: "واختيارك يحدد", sideD: "ما يظهر لك", phoneTitle: "اختر ما يهمك", more: "اعرف المزيد", start: "لنبدأ مشروعك الآن", proofKicker: "من الفكرة إلى التأثير", proofTitleA: "نصمّم لك", proofTitleB: "المساحة", proofTitleC: "لتكبر.", proofLead: "نشتغل معك من أول سؤال إلى آخر تفصيلة، حتى تكون النتيجة واضحة لك ولجمهورك.", reviewKicker: "قالوا عن التجربة", review: "سَفَر فهم فكرتنا من أول جلسة، وحوّلها إلى هوية وتجربة تشبهنا فعلًا.", contactKicker: "خلّنا نبدأ", contactTitleA: "جاهز تخلي", contactTitleB: "فكرتك تُرى؟", contactLead: "أرسل لنا تفاصيل بسيطة عن مشروعك، وسنعود لك باقتراح يناسب مرحلتك.", formTitle: "لنبنِ الشيء الصحيح", name: "الاسم الكامل", email: "البريد الإلكتروني", choose: "اختر خدمة", message: "نبذة عن المشروع", submit: "أرسل الطلب", thanks: "وصلنا طلبك.", thanksLead: "شكرًا لثقتك. سنعود إليك قريبًا لنبدأ الحديث.", newRequest: "إرسال طلب جديد", footer: "أفكار جيدة. تصاميم أفضل. أثر يدوم."
  } : {
    home: "Home", services: "Services", work: "Our work", contact: "Contact", topbar: "We turn ideas into experiences that move people", places: "Riyadh · Jeddah · Remote", heroA: "Your ideas", heroB: "We design them", heroC: "to move.", heroLead: "Turning your ideas into digital design and experiences that leave a mark.", heroCta: "Explore your direction", sideA: "Everything you need", sideB: "in one place", sideC: "Your choice decides", sideD: "what appears", phoneTitle: "Choose what matters", more: "Learn more", start: "Start your project", proofKicker: "From idea to impact", proofTitleA: "We design the", proofTitleB: "space", proofTitleC: "for you to grow.", proofLead: "From the first question to the last detail, we make the result clear for you and your audience.", reviewKicker: "What clients say", review: "SAFAR understood our idea from the first session and turned it into an identity and experience that truly feels like us.", contactKicker: "Let’s start", contactTitleA: "Ready to make", contactTitleB: "your idea seen?", contactLead: "Share a few details about your project and we’ll come back with a direction that fits your stage.", formTitle: "Let’s build the right thing", name: "Full name", email: "Email address", choose: "Choose a service", message: "Tell us about your project", submit: "Send request", thanks: "We got your request.", thanksLead: "Thanks for trusting us. We’ll be in touch soon.", newRequest: "Send another request", footer: "Good ideas. Better design. Lasting impact."
  };


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createLead.mutate({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? "") || undefined,
      service: String(form.get("service") ?? "") || undefined,
      message: String(form.get("message") ?? "") || undefined,
    });
  };

  return (
    <div className={`reference-site ${isArabic ? "is-arabic" : "is-english"}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="reference-topbar"><span>{copy.topbar}</span><span>{copy.places}</span></div>
      <header className="reference-header">
        <a className="reference-brand" href="#top"><img className="reference-brand-logo" src={isArabic ? "/brand/safar-ar.png" : "/brand/safar-en.png"} alt={isArabic ? "شعار سَفَر" : "SAFAR logo"} /></a>
        <button className="reference-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="فتح القائمة">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={menuOpen ? "reference-nav is-open" : "reference-nav"}>
          <a href="#top" onClick={() => setMenuOpen(false)}>{copy.home}</a><a href="#services" onClick={() => setMenuOpen(false)}>{copy.services}</a><a href="/works" onClick={() => setMenuOpen(false)}>{copy.work}</a><a href="#contact" onClick={() => setMenuOpen(false)}>{copy.contact}</a>
          <button className="language-switch" onClick={() => setLanguage(isArabic ? "en" : "ar")} aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}><span className={isArabic ? "active" : ""}>ع</span><i>/</i><span className={!isArabic ? "active" : ""}>EN</span></button>
        </nav>
      </header>

      <main id="top">
        <section id="services" className="reference-hero">
          <div className="reference-hero-copy">
            <div className="hand-note">Good ideas<br />work.</div>
            <h1>{text("hero.a", copy.heroA)}<br /><span>{text("hero.b", copy.heroB)}</span><br />{text("hero.c", copy.heroC)}</h1>
            <div className="coral-underline" />
            <p>{text("hero.lead", copy.heroLead)}</p>
            <a className="reference-cta" href="#services">{copy.heroCta} <ArrowLeft size={17} /></a>
            <div className="pick-hint" aria-hidden="true">
              <div className="pick-cat-box"><img className="pick-cat" src="/brand/cat.png" alt="" /><SleepyCat width={257} height={212} eyes={PICK_CAT_EYES} hit={{ left: "0%", top: "0%", width: "100%", height: "100%" }} label={isArabic ? "القطة تصحى" : "Wake the cat"} /><span className="zz zz-1">z</span><span className="zz zz-2">z</span><span className="zz zz-3">Z</span></div>
              <span className="ph-text">{isArabic ? "اختر من الجوال" : "Pick from the phone"}</span> <img className="ph-cat" src="/brand/cat-sitting.png" alt="" width="30" height="33" />
            </div>
          </div>
          <div className="reference-hero-art phone-only-scene">
            <img className="hero-illustration" src={heroImage} alt={isArabic ? "رسم توضيحي لخدمات سَفَر الرقمية" : "Illustration of SAFAR digital services"} />
            <div ref={phoneRef} className={`interactive-phone ${phoneOpen ? "is-open" : ""}`} onClick={() => setPhoneOpen((open) => !open)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setPhoneOpen((open) => !open); }} aria-label={isArabic ? "شاشة خدمات سَفَر" : "SAFAR services screen"}>
              <div className="phone-speaker" /><div className="phone-screen"><div className="phone-header"><strong>{copy.phoneTitle}</strong><span>+</span></div><div className="phone-service-list">{services.map((service) => <button key={service.id} className={`phone-service ${service.id === activeId ? "is-active" : ""}`} onClick={(event) => { event.stopPropagation(); tapService(service.id); }} aria-pressed={service.id === activeId}><span className="phone-service-icon">{service.icon}</span><span><b>{isArabic ? service.title : service.enTitle}</b><small>{isArabic ? service.subtitle : service.enSubtitle}</small></span><i className={service.id === activeId ? "is-on" : ""}><em /></i></button>)}</div><div className="phone-active-details"><div className="phone-detail-title"><span>{isArabic ? activeService.title : activeService.enTitle}</span><small>{isArabic ? activeService.image : activeService.enImage}</small></div><ul>{(isArabic ? activeService.details : activeService.enDetails).slice(0, 3).map((detail) => <li key={detail}><Check size={12} />{detail}</li>)}</ul><a href="#contact" className="phone-more" onClick={(event) => event.stopPropagation()}>{copy.more} <ArrowLeft size={13} /></a></div><a className="phone-cta" href="#contact" onClick={(event) => event.stopPropagation()}>{copy.start} <ArrowLeft size={14} /></a></div>
            </div>
            <div className="art-badge art-badge--top">{isArabic ? <>فكرة<br />تتبيّن</> : <>Ideas<br />made clear</>}</div><div className="art-badge art-badge--bottom">{isArabic ? <>تصميم<br />يتحرك</> : <>Design<br />in motion</>}</div>
          </div>
                  </section>
        <div className="hero-poster-wrap"><div className="reference-hero-side"><div className="cat-frame"><img className="hero-art" src={isArabic ? "/brand/hero-poster.png" : "/brand/hero-poster-en.png"} alt={isArabic ? "كل ما تحتاجه في مكان واحد: ملصقات ورسومات وقطة نايمة" : "Everything you need in one place: stickers, doodles and a sleeping cat"} /><SleepyCat width={1002} height={930} eyes={POSTER_CAT_EYES} hit={{ left: "37.5%", top: "67%", width: "17.5%", height: "16%" }} label={isArabic ? "القطة تصحى" : "Wake the cat"} /></div>{!isArabic && <p className="side-headline-en"><span>Everything you need</span><em>in one place ...</em></p>}<span className="zz zz-1" aria-hidden="true">z</span><span className="zz zz-2" aria-hidden="true">z</span><span className="zz zz-3" aria-hidden="true">Z</span></div></div>


        <section id="work" className="work-section work-section--stack">
          <div className="work-heading"><SectionKicker>{copy.work}</SectionKicker><h2>{text("work.titleA", "مشاريع تعبّر عن", "Projects that speak to")}<br /><span>{text("work.titleB", "فكرتنا.", "our idea.")}</span></h2><a className="work-page-link" href={whatsappHref ? `${whatsappHref}?text=${encodeURIComponent(isArabic ? "أبغى أشوف أعمالكم كاملة" : "I would like to see your full work")}` : "/works"} target={whatsappHref ? "_blank" : undefined} rel={whatsappHref ? "noreferrer" : undefined}>{whatsappHref ? (isArabic ? "راسلنا لرؤية أعمالنا كاملة" : "Message us for our full work") : (isArabic ? "شاهد أعمالنا كاملة" : "View all our work")}<ArrowLeft size={16} /></a></div>
          <WorksStack items={stackWorks} brandLabel={isArabic ? "سَفَر" : "SAFAR"} isArabic={isArabic} />
        </section>

          <div className="reviews-intro" aria-hidden="true"><span className="reviews-intro-line reviews-intro-line--left" /><div className="reviews-intro-copy"><span>{isArabic ? "مساحة للتجربة" : "A space for experience"}</span><h2>{isArabic ? "تقييمات عملائنا" : "Client reviews"}</h2><p>{isArabic ? "نترك الأثر… ويكمل العملاء الحكاية" : "The work leaves a mark. Our clients tell the story."}</p></div><span className="reviews-intro-line reviews-intro-line--right" /><img className="reviews-intro-illustration" src="/brand/reviews-girl-stars.png" alt="" /></div>
          <section id="reviews" className="reference-testimonial" onTouchStart={(event) => { testimonialTouchStart.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const start = testimonialTouchStart.current; testimonialTouchStart.current = null; if (start == null) return; const delta = event.changedTouches[0]?.clientX - start; if (Math.abs(delta) > 35) moveTestimonial(delta > 0 ? -1 : 1); }}><div className="quote-mark">“</div><div className="testimonial-carousel"><SectionKicker>{copy.reviewKicker}</SectionKicker><blockquote key={activeTestimonial}>{displayedTestimonial?.quote || text("review.quote", copy.review)}</blockquote><div className="testimonial-person"><span>{(displayedTestimonial?.name || "ليان").slice(0, 1)}</span><div><strong>{displayedTestimonial?.name || (isArabic ? "ليان السالم" : "Layan Al Salem")}</strong><small>{displayedTestimonial?.company || (isArabic ? "مؤسسة نواة" : "Founder, Nawa")}</small></div><b>{"★".repeat(displayedTestimonial?.rating || 5)}</b></div>{liveTestimonials.length > 1 && <div className="testimonial-controls"><button type="button" onClick={() => moveTestimonial(-1)} aria-label={isArabic ? "التقييم السابق" : "Previous testimonial"}><ChevronRight size={19} /></button><span>{String((activeTestimonial % liveTestimonials.length) + 1).padStart(2, "0")} / {String(liveTestimonials.length).padStart(2, "0")}</span><button type="button" onClick={() => moveTestimonial(1)} aria-label={isArabic ? "التقييم التالي" : "Next testimonial"}><ChevronLeft size={19} /></button></div>}</div></section>

        <section id="contact" className="reference-contact"><div className="contact-intro"><SectionKicker>{copy.contactKicker}</SectionKicker><h2>{text("contact.titleA", copy.contactTitleA)}<br /><span>{text("contact.titleB", copy.contactTitleB)}</span></h2><p>{text("contact.lead", copy.contactLead)}</p><div className="contact-links">{publicData.data?.settings?.businessEmail && <a href={`mailto:${publicData.data.settings.businessEmail}`}>{publicData.data.settings.businessEmail}</a>}{whatsappDigits && <a href={`tel:+${whatsappDigits}`}>+{whatsappDigits}</a>}{whatsappHref && <a className="whatsapp-contact-link" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={17} />{isArabic ? "محادثة واتساب" : "Chat on WhatsApp"}</a>}</div></div><div className="reference-form-card">{submitted ? <div className="reference-success"><div><Check size={28} /></div><h3>{copy.thanks}</h3><p>{copy.thanksLead}</p><button className="more-link" onClick={() => setSubmitted(false)}>{copy.newRequest} <ArrowLeft size={15} /></button></div> : <form onSubmit={handleSubmit}><div className="form-card-title">{copy.formTitle} <Sparkles size={18} /></div><label>{copy.name}<input name="name" required placeholder={isArabic ? "مثال: ليان السالم" : "e.g. Layan Al Salem"} /></label><label>{copy.email}<input name="email" required type="email" placeholder="name@company.com" /></label><label>{isArabic ? "رقم الجوال" : "Phone"}<input name="phone" placeholder="05xxxxxxxx" /></label><label>{isArabic ? "الخدمة المطلوبة" : "Service needed"}<select name="service" required defaultValue=""><option value="" disabled>{copy.choose}</option>{services.map((service) => <option key={service.id} value={service.id}>{isArabic ? service.title : service.enTitle}</option>)}</select><ChevronDown className="select-chevron" size={16} /></label><label>{copy.message} <span className="optional-label">({isArabic ? "اختياري" : "optional"})</span><textarea name="message" rows={3} placeholder={isArabic ? "حدثنا عن فكرتك باختصار..." : "Tell us a little about your idea..."} /></label><button type="submit" disabled={createLead.isPending} className="reference-submit">{createLead.isPending ? "جارٍ الإرسال…" : copy.submit} <ArrowLeft size={17} /></button><small className="privacy-note">{isArabic ? "نحترم خصوصيتك ولن نشارك بياناتك." : "We respect your privacy and never share your data."}</small></form>}</div></section>
      </main>

      <footer className="reference-footer"><div className="footer-brand"><img className="footer-brand-logo" src={isArabic ? "/brand/safar-ar.png" : "/brand/safar-en.png"} alt={isArabic ? "شعار سَفَر" : "SAFAR logo"} /></div><p>{copy.footer}</p><div className="footer-social">{publicData.data?.settings?.instagramUrl && <a href={publicData.data.settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>}{publicData.data?.settings?.linkedinUrl && <a href={publicData.data.settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>}{publicData.data?.settings?.tiktokUrl && <a href={publicData.data.settings.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 size={17} /></a>}{whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={17} /></a>}</div><div className="footer-docs" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, margin: "18px 0", fontSize: 13, width: "100%", gridColumn: "1 / -1", textAlign: "center" }}><img src="/brand/business-center.jpg" alt={isArabic ? "المركز السعودي للأعمال" : "Saudi Business Center"} style={{ height: 92, width: "auto" }} />{publicData.data?.settings?.freelanceLicenseNumber && <span>{isArabic ? "رقم وثيقة العمل الحر: " : "Freelance license no.: "}<bdi dir="ltr">{publicData.data.settings.freelanceLicenseNumber}</bdi></span>}{publicData.data?.settings?.businessCenterNumber && <span>{isArabic ? "رقم وثيقة مركز الأعمال: " : "Business center no.: "}<bdi dir="ltr">{publicData.data.settings.businessCenterNumber}</bdi></span>}</div><small>© {new Date().getFullYear()} SAFAR Studio</small></footer>
      {whatsappHref && <a className="whatsapp-float" href={whatsappHref} target="_blank" rel="noreferrer" aria-label={isArabic ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"} title={isArabic ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"}><MessageCircle size={28} fill="currentColor" /></a>}
    </div>
  );
}
