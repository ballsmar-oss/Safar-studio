import { Instagram, Linkedin, MessageCircle, Music2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import "./home-v2.css";

type Lang = "ar" | "en";
type ServiceKey = "motion" | "systems" | "branding" | "ui" | "consulting";

const serviceKeys: ServiceKey[] = ["motion", "systems", "branding", "ui", "consulting"];

const services: Record<ServiceKey, { icon: string; ar: { title: string; sub: string; details: string[] }; en: { title: string; sub: string; details: string[] } }> = {
  motion: {
    icon: "▣",
    ar: { title: "إنتاج الفيديو بالذكاء الاصطناعي", sub: "فريمات وقصص تتحرك", details: ["فيديوهات إعلانية مبتكرة", "محتوى سوشال ميديا جاذب", "شخصيات رقمية ثابتة ومونتاج احترافي"] },
    en: { title: "AI Video Production", sub: "Dynamic frames & compelling stories", details: ["Innovative commercial videos", "Engaging social media campaigns", "Consistent digital avatars & pro editing"] },
  },
  systems: {
    icon: "⚙",
    ar: { title: "الأتمتة والأنظمة الذكية", sub: "نظام واضح، نتائج أسرع", details: ["ربط واتساب للأعمال الذكي", "أنظمة مواعيد وحجوزات متقدمة", "لوحات تحكم ومتابعة العملاء CRM"] },
    en: { title: "Automation & Smart Systems", sub: "Smarter workflows, time saved", details: ["WhatsApp Business integration", "Automated booking & scheduling", "Custom CRM & analytics dashboards"] },
  },
  branding: {
    icon: "✎",
    ar: { title: "التصميم والهويات البصرية", sub: "علامة لها حضور وبصمة فريدة", details: ["شعار وهوية بصرية متكاملة", "قوالب وتطبيقات سوشال ميديا", "دليل استخدام الهوية الشامل"] },
    en: { title: "Branding & Visual Identity", sub: "A distinct, memorable presence", details: ["Complete visual identity & logos", "Social media design kits", "Comprehensive brand guidelines"] },
  },
  ui: {
    icon: "▣",
    ar: { title: "تصميم واجهات وتجربة المستخدم", sub: "تجربة أسهل وأوضح لكل مستخدم", details: ["تصميم مواقع ومنتجات رقمية عصرية", "استراتيجية وهندسة تجربة المستخدم UX", "نماذج تفاعلية ونظام تصميم متكامل"] },
    en: { title: "UI / UX Product Design", sub: "Intuitive, seamless digital journeys", details: ["Modern website & app design", "User experience architecture & UX", "Interactive prototypes & design systems"] },
  },
  consulting: {
    icon: "○",
    ar: { title: "استشارات إبداعية", sub: "قرار أفضل من البداية", details: ["جلسة اكتشاف وتحديد الرؤية", "توجيه استراتيجي للهوية والتموضع", "خطة محتوى بصري وخارطة طريق"] },
    en: { title: "Creative Consulting", sub: "Smart strategic direction from day one", details: ["Discovery & vision session", "Strategic identity & positioning", "Visual content roadmap & execution plan"] },
  },
};

// Used until the dashboard has testimonials of its own.
const sampleTestimonials = {
  ar: [
    { quote: "سَفَر فهم فكرتنا من أول جلسة، وحوّلها إلى هوية وتجربة تشبهنا فعلًا وخلت تواجدنا الرقمي يلفت الأنظار من أول يوم.", name: "ليان السالم", company: "مؤسسة نَواة", rating: 5 },
    { quote: "فريق استثنائي وسرعة إنجاز تفوق التوقعات! موشن الجرافيك والأتمتة وفرت علينا ساعات طويلة من العمل اليومي.", name: "عمر الخالدي", company: "منصة تدفق", rating: 5 },
    { quote: "التجربة والتنفيذ فاقا كل التطلعات. الدقة في تفاصيل الهوية البصرية والواجهات منحتنا مكانة تنافسية قوية.", name: "سارة المهيدب", company: "استوديو مدار", rating: 5 },
  ],
  en: [
    { quote: "SAFAR got our vision from our very first meeting, turning it into a distinct identity and digital presence that captivated our audience immediately.", name: "Layan Al-Salem", company: "Nawaah Foundation", rating: 5 },
    { quote: "Exceptional team with remarkable delivery speed! Their AI motion and WhatsApp automation saved our operations dozens of hours every week.", name: "Omar Al-Khalidi", company: "Tadafoq Platform", rating: 5 },
    { quote: "Flawless execution that surpassed expectations. The precision in visual brand guidelines and interface design gave us an immediate edge.", name: "Sara Al-Mohaideb", company: "Madar Studio", rating: 5 },
  ],
};

const copy = {
  ar: {
    title: "سَفَر | استوديو إبداعي وتجارب رقمية",
    topbar1: "نحوّل الأفكار إلى تجارب تُحرّك الأثر", topbar2: "الرياض · جدة · عن بُعد",
    navHome: "الرئيسية", navServices: "الخدمات", navWork: "أعمالنا", navReviews: "الآراء", navContact: "تواصل",
    handNote: ["Good ideas", "work."],
    heroTitle: ["أفكارك", "نصممها", "تنفّذ."], heroDesc: "تحويل أفكارك إلى تصاميم وتجارب رقمية تترك أثرًا يخلد في ذاكرة جمهورك.", heroCta: "اختر ما يلهمك",
    badgeTop: ["فكرة", "تتبيّن"], badgeBottom: ["تصميم", "يتحرك"],
    phoneHeader: "اختر ما يهمك", phoneCta: "لنبدأ مشروعك الآن", learnMore: "اعرف المزيد", startProject: "ابدأ مشروعك الآن",
    sideA: ["كل ما تحتاجه", "في مكان واحد", "..."], sideB: ["واختيارك يحدد", "ما يظهر لك"], mascot: "سَفَر ستوديو",
    workKicker: "أعمالنا", workTitle: ["أفكار تحولت", "إلى حضور."], workDesc: "مشاريع مختارة تعكس أسلوبنا وجودة أعمالنا في الهوية والموشن والواجهات الرقمية.", workLink: "شاهد أعمالنا كاملة",
    workFallback: [
      { title: "موشن إعلاني", sub: "فكرة تتحرك بذكاء وتأثير", service: "motion" as ServiceKey },
      { title: "هوية بصرية", sub: "علامة لها حضور وبصمة فريدة", service: "branding" as ServiceKey },
      { title: "تصميم واجهات UI/UX", sub: "تجربة أسهل وأوضح لكل مستخدم", service: "ui" as ServiceKey },
      { title: "أتمتة وأنظمة ذكية", sub: "ربط واتساب وحجوزات متقدمة", service: "systems" as ServiceKey },
    ],
    reviewsKicker: "مساحة للتجربة", reviewsTitle: "تقييمات عملائنا", reviewsSub: "نترك الأثر… ويكمل العملاء الحكاية", testimonialKicker: "قالوا عن التجربة",
    contactKicker: "خلّنا نبدأ", contactTitle: ["جاهز تخلي", "فكرتك تُرى؟"], contactDesc: "أرسل لنا تفاصيل بسيطة عن مشروعك، وسنعود لك باقتراح يناسب مرحلتك ورؤيتك الاستراتيجية.",
    chatWa: "محادثة واتساب مباشرة",
    formTitle: "لنبنِ الشيء الصحيح", formName: "الاسم الكامل", formEmail: "البريد الإلكتروني", formPhone: "رقم الجوال", formService: "الخدمة المطلوبة",
    formSelectService: "اختر خدمة", formMsg: "نبذة عن المشروع", formOptional: "(اختياري)", formSubmit: "أرسل الطلب", sending: "جارٍ الإرسال...",
    privacy: "نحترم خصوصيتك ولن نشارك بياناتك أبدًا.", successTitle: "تم إرسال طلبك بنجاح!",
    successDesc: "شكرًا لثقتك بنا. وصلتنا تفاصيل مشروعك وسيقوم فريق سَفَر بالتواصل معك خلال 24 ساعة للبدء في خطتك.",
    resetForm: "إرسال استفسار آخر", footer: "أفكار جيدة. تصاميم أفضل. أثر يدوم.", copyright: "© 2025 SAFAR Studio. جميع الحقوق محفوظة.",
    phPlaceholder: "مثال: ليان السالم", msgPlaceholder: "حدثنا عن فكرتك باختصار...", errorName: "اكتب اسمك الكامل", errorService: "اختر الخدمة المطلوبة",
  },
  en: {
    title: "SAFAR | Creative Studio & Digital Experiences",
    topbar1: "Transforming ideas into impactful experiences", topbar2: "Riyadh · Jeddah · Remote",
    navHome: "Home", navServices: "Services", navWork: "Work", navReviews: "Reviews", navContact: "Contact",
    handNote: ["Good ideas", "work."],
    heroTitle: ["Your ideas.", "Designed", "executed."], heroDesc: "Turning visionary concepts into digital craft and enduring brands that captivate your audience.", heroCta: "Explore What Inspires",
    badgeTop: ["Ideas", "Realized"], badgeBottom: ["Design", "In Motion"],
    phoneHeader: "Select a Service", phoneCta: "Start Your Project Now", learnMore: "Learn More", startProject: "Start Your Project",
    sideA: ["Everything you need", "in one place", "..."], sideB: ["Your choice shapes", "what comes alive"], mascot: "SAFAR Studio",
    workKicker: "Our Work", workTitle: ["Ideas turned into", "presence."], workDesc: "Selected projects demonstrating our craftsmanship in identity, motion AI, and digital experiences.", workLink: "View all projects",
    workFallback: [
      { title: "Commercial Motion", sub: "Smart, fast-moving stories", service: "motion" as ServiceKey },
      { title: "Brand Identity", sub: "Distinct character & lasting mark", service: "branding" as ServiceKey },
      { title: "UI/UX Experience", sub: "Clear, frictionless digital flow", service: "ui" as ServiceKey },
      { title: "Smart Automation", sub: "WhatsApp APIs & workflows", service: "systems" as ServiceKey },
    ],
    reviewsKicker: "Proof of Impact", reviewsTitle: "Client Reviews", reviewsSub: "We leave the mark… clients tell the story", testimonialKicker: "Client Testimonial",
    contactKicker: "Let's Begin", contactTitle: ["Ready to make", "your idea seen?"], contactDesc: "Send us a brief note about your project, and we will get back with tailored strategic recommendations.",
    chatWa: "Direct WhatsApp Chat",
    formTitle: "Let's Build It Right", formName: "Full Name", formEmail: "Work Email", formPhone: "Phone Number", formService: "Required Service",
    formSelectService: "Select a service", formMsg: "Project Brief", formOptional: "(Optional)", formSubmit: "Send Request", sending: "Sending...",
    privacy: "We respect your privacy. No spam ever.", successTitle: "Request Sent Successfully!",
    successDesc: "Thank you for reaching out! SAFAR Studio will review your project and get in touch within 24 hours.",
    resetForm: "Submit Another Request", footer: "Good ideas. Better design. Lasting impact.", copyright: "© 2025 SAFAR Studio. All rights reserved.",
    phPlaceholder: "e.g. Sarah Miller", msgPlaceholder: "Tell us briefly about your vision...", errorName: "Enter your full name", errorService: "Choose a service",
  },
} as const;

function normalizeWhatsapp(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  return digits;
}

function Arrow() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" x2="5" y1="12" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = copy[lang];
  const isAr = lang === "ar";

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceKey>("motion");
  const [onServices, setOnServices] = useState<Record<ServiceKey, boolean>>({ motion: true, systems: false, branding: false, ui: false, consulting: false });
  const [phonePulse, setPhonePulse] = useState(false);
  const [formPulse, setFormPulse] = useState(false);
  const [catIndex, setCatIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [quoteFading, setQuoteFading] = useState(false);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [formService, setFormService] = useState<ServiceKey | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const phoneRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const publicData = trpc.publicContent.all.useQuery();
  const createLead = trpc.publicContent.createLead.useMutation({
    onSuccess: () => { setSubmitted(true); setFormError(""); setTimeout(() => document.getElementById("contactSuccess")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); },
    onError: (error) => toast.error(error.message),
  });

  const settings = publicData.data?.settings;
  const whatsapp = normalizeWhatsapp(settings?.whatsappNumber);
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : "";
  const contentMap = Object.fromEntries((publicData.data?.content ?? []).map((item) => [item.contentKey, item.contentValue]));
  const heroDesc = isAr && contentMap["hero.lead"] ? contentMap["hero.lead"] : t.heroDesc;

  const liveWork = publicData.data?.portfolio ?? [];
  const liveTestimonials = (publicData.data?.testimonials ?? []).map((item) => ({ quote: item.quote, name: item.name, company: item.company ?? "", rating: item.rating }));
  const testimonials = liveTestimonials.length ? liveTestimonials : sampleTestimonials[lang];
  const current = testimonials[testimonialIndex % testimonials.length];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.title = t.title;
  }, [lang, isAr, t.title]);

  useEffect(() => {
    if (carouselPaused || testimonials.length < 2) return;
    const timer = window.setInterval(() => showTestimonial(testimonialIndex + 1), 6000);
    return () => window.clearInterval(timer);
  }, [carouselPaused, testimonialIndex, testimonials.length]);

  useEffect(() => { setTestimonialIndex(0); }, [lang, liveTestimonials.length]);

  function showTestimonial(index: number) {
    const next = (index + testimonials.length) % testimonials.length;
    setQuoteFading(true);
    window.setTimeout(() => { setTestimonialIndex(next); setQuoteFading(false); }, 150);
  }

  function selectService(key: ServiceKey) {
    setActiveService(key);
    setOnServices((state) => ({ ...state, [key]: true }));
    setFormService(key);
  }

  function clickServiceButton(key: ServiceKey) {
    if (key === activeService) {
      const wasOn = onServices[key];
      setOnServices((state) => ({ ...state, [key]: !wasOn }));
      if (wasOn) {
        const other = serviceKeys.find((k) => k !== key) ?? key;
        setActiveService(other);
      }
    } else {
      selectService(key);
    }
  }

  function goToForm() {
    setFormService(activeService);
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      setFormPulse(false);
      window.requestAnimationFrame(() => setFormPulse(true));
      nameRef.current?.focus();
    }, 600);
  }

  function showFromWork(key: ServiceKey) {
    selectService(key);
    phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setPhonePulse(true);
    window.setTimeout(() => setPhonePulse(false), 500);
  }

  function onPhoneBackground(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a")) return;
    const index = serviceKeys.indexOf(activeService);
    selectService(serviceKeys[(index + 1) % serviceKeys.length]);
    setPhonePulse(true);
    window.setTimeout(() => setPhonePulse(false), 500);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const service = String(form.get("service") ?? "") as ServiceKey | "";
    if (name.length < 2) return setFormError(t.errorName);
    if (!service) return setFormError(t.errorService);
    setFormError("");
    createLead.mutate({
      name,
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim() || undefined,
      service: services[service].ar.title,
      message: String(form.get("message") ?? "").trim() || undefined,
    });
  }

  const liveCards = useMemo(() => liveWork.slice(0, 6), [liveWork]);
  const variants = ["video", "coral", "mint", "yellow"] as const;

  return (
    <div className="home-v2" dir={isAr ? "rtl" : "ltr"}>
      <div className={`reference-site ${isAr ? "is-arabic" : "is-english"}`}>
        <div className="reference-topbar">
          <span>{t.topbar1}</span>
          <span>{t.topbar2}</span>
        </div>

        <header className="reference-header">
          <a className="reference-brand" href="/#top">
            <div className="reference-brand-box">
              <span className="brand-ar">سَفَر</span>
              <span className="brand-slash">/</span>
              <span className="brand-en">SAFAR</span>
            </div>
          </a>
          <button aria-label="القائمة" className="mobile-menu-btn" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "✕" : "☰"}</button>
          <nav className={`reference-nav ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)}>
            <a href="#top">{t.navHome}</a>
            <a href="#services">{t.navServices}</a>
            <a href="#work">{t.navWork}</a>
            <a href="#reviews">{t.navReviews}</a>
            <a href="#contact">{t.navContact}</a>
            <button aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"} className="language-switch" onClick={(event) => { event.stopPropagation(); setLang(isAr ? "en" : "ar"); }}>
              <span className={isAr ? "active" : ""}>ع</span><i>/</i><span className={!isAr ? "active" : ""}>EN</span>
            </button>
          </nav>
        </header>

        <main id="top">
          <section className="reference-hero" id="services">
            <div className="reference-hero-copy">
              <div className="hand-note">{t.handNote[0]}<br />{t.handNote[1]}</div>
              <h1>{t.heroTitle[0]}<br /><span>{t.heroTitle[1]}</span><br />{t.heroTitle[2]}</h1>
              <div className="coral-underline" />
              <p>{heroDesc}</p>
              <a className="reference-cta" href="#contact">{t.heroCta} <Arrow /></a>
            </div>

            <div className="reference-hero-art">
              <div className="phone-bg-glow" />
              <div className="art-badge art-badge--top">{t.badgeTop[0]}<br />{t.badgeTop[1]}</div>
              <div ref={phoneRef} className={`interactive-phone ${phonePulse ? "phone-pulse" : ""}`} title={isAr ? "اضغط لاستكشاف الخدمات" : "Tap to explore"} onClick={onPhoneBackground}>
                <div className="phone-speaker" />
                <div className="phone-screen">
                  <div className="phone-header"><strong>{t.phoneHeader}</strong><span>+</span></div>
                  <div className="phone-service-list">
                    {serviceKeys.map((key) => {
                      const on = onServices[key];
                      const active = key === activeService;
                      return (
                        <button key={key} className={`phone-service ${active ? "is-active" : ""} ${on ? "is-on" : ""}`} onClick={(event) => { event.stopPropagation(); clickServiceButton(key); }}>
                          <span className="phone-service-icon">{services[key].icon}</span>
                          <span><b>{services[key][lang].title}</b><small>{services[key][lang].sub}</small></span>
                          <i className="toggle-switch"><em /></i>
                        </button>
                      );
                    })}
                  </div>
                  <div className="phone-active-details">
                    <div className="phone-detail-title">
                      <span>{services[activeService][lang].title}</span>
                      <small>{services[activeService][lang].sub}</small>
                    </div>
                    <ul>
                      {services[activeService][lang].details.map((detail) => (
                        <li key={detail}><svg fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg><span>{detail}</span></li>
                      ))}
                    </ul>
                    <div className="phone-actions-row">
                      <button className="phone-btn-secondary" type="button" onClick={(event) => { event.stopPropagation(); goToForm(); }}>
                        <span>{t.learnMore}</span>
                      </button>
                      <button className="phone-btn-primary" type="button" onClick={(event) => { event.stopPropagation(); goToForm(); }}>
                        <span>{t.startProject}</span>
                      </button>
                    </div>
                  </div>
                  <a className="phone-cta" href="#contact" onClick={(event) => { event.stopPropagation(); event.preventDefault(); goToForm(); }}>{t.phoneCta} <Arrow /></a>
                </div>
              </div>
              <div className="art-badge art-badge--bottom">{t.badgeBottom[0]}<br />{t.badgeBottom[1]}</div>
            </div>

            <div className="reference-hero-side">
              <p>{t.sideA[0]}<br />{t.sideA[1]}<br />{t.sideA[2]}</p>
              <p>{t.sideB[0]}<br />{t.sideB[1]}</p>
              <svg className="arrow-down-icon" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
              <div className="cat-mascot-box" onClick={() => setCatIndex((i) => (i + 1) % 5)} role="button" tabIndex={0}>
                <span>{["🐱", "😸", "✨", "🐾", "🦁"][catIndex]}</span>
                <small>{t.mascot}</small>
              </div>
              <span className="doodle-spark doodle-spark--one">✦</span>
              <span className="doodle-spark doodle-spark--two">〰</span>
            </div>
          </section>

          <section className="work-section" id="work">
            <div className="work-heading">
              <div className="section-kicker"><span className="kicker-dot" /><span>{t.workKicker}</span></div>
              <h2>{t.workTitle[0]}<br /><span>{t.workTitle[1]}</span></h2>
              <p>{t.workDesc}</p>
              <a className="work-page-link" href="/works">{t.workLink} <Arrow /></a>
            </div>
            <div className="work-grid">
              {liveCards.length
                ? liveCards.map((item, index) => (
                    <article key={item.id} className={`work-card work-card--${variants[index % variants.length]}`}>
                      {item.mediaType === "video" && <video className="work-media" src={item.mediaUrl} poster={item.thumbnailUrl ?? undefined} muted loop playsInline autoPlay preload="metadata" />}
                      {item.mediaType === "image" && <img className="work-media" src={item.mediaUrl} alt={item.title} />}
                      {item.mediaType === "link" && <div className="work-emoji">↗</div>}
                      <div className="work-caption"><strong>{item.title}</strong><small>{item.category}</small></div>
                      <span className="work-arrow">↗</span>
                      <a className="work-card-link" href={item.mediaType === "link" ? (item.projectUrl || item.mediaUrl) : `/works/${item.id}`} {...(item.mediaType === "link" ? { target: "_blank", rel: "noreferrer" } : {})} aria-label={item.title} />
                    </article>
                  ))
                : t.workFallback.map((item, index) => (
                    <article key={item.title} className={`work-card work-card--${variants[index]}`} onClick={() => showFromWork(item.service)}>
                      <div className="work-emoji">{services[item.service].icon}</div>
                      <div><strong>{item.title}</strong><small>{item.sub}</small></div>
                      <span className="work-arrow">↗</span>
                    </article>
                  ))}
            </div>
          </section>

          <div className="reviews-intro" aria-hidden="true">
            <span className="reviews-intro-line reviews-intro-line--left" />
            <div className="reviews-intro-copy">
              <span>{t.reviewsKicker}</span>
              <h2>{t.reviewsTitle}</h2>
              <p>{t.reviewsSub}</p>
            </div>
            <span className="reviews-intro-line reviews-intro-line--right" />
          </div>

          <section className="reference-testimonial" id="reviews" onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)}>
            <div className="quote-mark">“</div>
            <div className="testimonial-carousel">
              <div className="section-kicker"><span className="kicker-dot" /><span>{t.testimonialKicker}</span></div>
              <blockquote className={quoteFading ? "fade-out" : ""}>{current.quote}</blockquote>
              <div className="testimonial-person">
                <span className="testimonial-avatar">{current.name.slice(0, 1)}</span>
                <div><strong>{current.name}</strong><small>{current.company}</small></div>
                <b>{"★".repeat(current.rating)}</b>
              </div>
              <div className="testimonial-controls">
                <button aria-label={isAr ? "السابق" : "Previous"} onClick={() => showTestimonial(testimonialIndex - 1)} type="button">{isAr ? "›" : "‹"}</button>
                <span>{`0${(testimonialIndex % testimonials.length) + 1} / 0${testimonials.length}`}</span>
                <button aria-label={isAr ? "التالي" : "Next"} onClick={() => showTestimonial(testimonialIndex + 1)} type="button">{isAr ? "‹" : "›"}</button>
              </div>
            </div>
          </section>

          <section className="reference-contact" id="contact">
            <div className="contact-intro">
              <div className="section-kicker"><span className="kicker-dot" /><span>{t.contactKicker}</span></div>
              <h2>{t.contactTitle[0]}<br /><span>{t.contactTitle[1]}</span></h2>
              <p>{isAr && contentMap["contact.lead"] ? contentMap["contact.lead"] : t.contactDesc}</p>
              <div className="contact-links">
                {settings?.businessEmail && <a href={`mailto:${settings.businessEmail}`}>{settings.businessEmail}</a>}
                {whatsappHref && <a className="whatsapp-contact-link" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={16} />{t.chatWa}</a>}
              </div>
            </div>

            <div ref={formCardRef} className={`reference-form-card ${formPulse ? "form-highlight-pulse" : ""}`}>
              {!submitted ? (
                <form onSubmit={submitForm}>
                  <div className="form-card-title"><span>{t.formTitle}</span><span style={{ color: "var(--coral)" }}>✦</span></div>
                  <label><span>{t.formName}</span><input ref={nameRef} name="name" required placeholder={t.phPlaceholder} type="text" /></label>
                  <label><span>{t.formEmail}</span><input name="email" required placeholder="name@company.com" type="email" /></label>
                  <label><span>{t.formPhone}</span><input name="phone" placeholder="05xxxxxxxx" type="tel" /></label>
                  <label>
                    <span>{t.formService}</span>
                    <select name="service" value={formService} onChange={(event) => setFormService(event.target.value as ServiceKey)}>
                      <option value="" disabled>{t.formSelectService}</option>
                      {serviceKeys.map((key) => <option key={key} value={key}>{services[key][lang].title}</option>)}
                    </select>
                  </label>
                  <label><span>{t.formMsg}</span> <span style={{ opacity: 0.6, fontSize: 11 }}>{t.formOptional}</span><textarea name="message" rows={3} placeholder={t.msgPlaceholder} /></label>
                  {formError && <p style={{ color: "#b42318", fontWeight: 700, marginBottom: 12 }}>{formError}</p>}
                  <button className="reference-submit" disabled={createLead.isPending} type="submit"><span>{createLead.isPending ? t.sending : t.formSubmit}</span></button>
                  <small className="privacy-note">{t.privacy}</small>
                </form>
              ) : (
                <div id="contactSuccess" className="reference-success is-visible">
                  <div className="success-badge">✨</div>
                  <h3>{t.successTitle}</h3>
                  <p>{t.successDesc}</p>
                  <button className="reset-form-btn" onClick={() => setSubmitted(false)} type="button"><span>{t.resetForm}</span></button>
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="reference-footer">
          <div className="footer-brand">
            <div className="reference-brand-box">
              <span className="brand-ar">سَفَر</span>
              <span className="brand-slash">/</span>
              <span className="brand-en">SAFAR</span>
            </div>
          </div>
          <p>{t.footer}</p>
          <div className="footer-social">
            {settings?.instagramUrl && <a aria-label="Instagram" href={settings.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={17} /></a>}
            {settings?.linkedinUrl && <a aria-label="LinkedIn" href={settings.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={17} /></a>}
            {settings?.tiktokUrl && <a aria-label="TikTok" href={settings.tiktokUrl} target="_blank" rel="noreferrer"><Music2 size={17} /></a>}
            {whatsappHref && <a aria-label="WhatsApp" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={17} /></a>}
          </div>
          <small>{t.copyright}</small>
        </footer>

        {whatsappHref && (
          <a aria-label={isAr ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"} className="whatsapp-float" href={whatsappHref} rel="noreferrer" target="_blank">
            <MessageCircle size={26} />
          </a>
        )}
      </div>
    </div>
  );
}
