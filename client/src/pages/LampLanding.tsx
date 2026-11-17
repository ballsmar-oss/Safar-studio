import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, ArrowDown, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import PullLamp from "@/components/PullLamp";
import "./lamp-landing.css";

// Landing page with a pull-cord lamp. Light on: light grey and fully readable.
// Light off: dark and dim. Every section is a sticky sheet that slides up over the one before it.

const STORAGE_KEY = "lamp-landing-light";

const services = [
  { title: "إنتاج الفيديو بالذكاء الاصطناعي", lead: "فيديوهات إعلانية ومحتوى سوشال بشخصيات ثابتة ومونتاج احترافي.", tags: ["إعلانات", "سوشال ميديا", "شخصيات ثابتة"] },
  { title: "الأتمتة والأنظمة الذكية", lead: "أنظمة تختصر شغلك اليومي وتوفر وقتك ووقت فريقك.", tags: ["واتساب للأعمال", "حجوزات", "لوحات CRM"] },
  { title: "التصميم والهويات البصرية", lead: "هوية كاملة تحكي قصتك من الشعار لين آخر قالب.", tags: ["شعار", "دليل الهوية", "قوالب"] },
  { title: "تصميم الواجهات وتجربة المستخدم", lead: "مواقع ومنتجات واضحة وسهلة، يحبها المستخدم من أول ضغطة.", tags: ["مواقع", "UX", "نماذج تفاعلية"] },
  { title: "استشارات إبداعية", lead: "من الفكرة للتنفيذ، نرسم لك الطريق قبل ما تصرف ريال.", tags: ["جلسة اكتشاف", "خطة محتوى", "خارطة طريق"] },
];

const steps = [
  { no: "01", title: "نسمع", text: "جلسة نفهم فيها فكرتك وجمهورك ووش تبي توصل له." },
  { no: "02", title: "نرسم", text: "نطلع لك باتجاه بصري واضح تشوفه قبل ما نبدأ التنفيذ." },
  { no: "03", title: "نبني", text: "نصمم وننفذ ونراجع معك خطوة بخطوة، بدون مفاجآت." },
  { no: "04", title: "نطلق", text: "نسلمك كل شي جاهز، ونكمل معك بعد الإطلاق." },
];

const works = [
  { kind: "هوية بصرية", title: "علامة لها حضور", tone: "a" },
  { kind: "فيديو بالذكاء الاصطناعي", title: "قصة في ٣٠ ثانية", tone: "b" },
  { kind: "نظام ذكي", title: "حجوزات بدون فوضى", tone: "c" },
];

const nav = [
  { id: "about", label: "من نحن" },
  { id: "services", label: "الخدمات" },
  { id: "process", label: "كيف نشتغل" },
  { id: "work", label: "أعمالنا" },
  { id: "contact", label: "تواصل" },
];

function readLight() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export default function LampLanding() {
  const [lightOn, setLightOn] = useState(readLight);
  const [submitted, setSubmitted] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const createLead = trpc.publicContent.createLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("وصلنا طلبك، بنتواصل معك قريب.");
    },
    onError: (error) => toast.error(error.message),
  });

  // Match the page behind the sheets (and the browser bar) to the light.
  useEffect(() => {
    const color = lightOn ? "#e4e4e1" : "#0b0b0c";
    const previous = document.body.style.background;
    document.body.style.background = color;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousMeta = meta?.content;
    if (meta) meta.content = color;
    try {
      localStorage.setItem(STORAGE_KEY, lightOn ? "on" : "off");
    } catch {
      /* remembering is optional */
    }
    return () => {
      document.body.style.background = previous;
      if (meta && previousMeta) meta.content = previousMeta;
    };
  }, [lightOn]);

  // Sticky sheets: a sheet taller than the screen sticks only after its bottom is reached,
  // and each sheet shrinks and darkens a little while the next one covers it.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const panels = Array.from(main.querySelectorAll<HTMLElement>(".lp-panel"));
    const layout = () => {
      const vh = window.innerHeight;
      panels.forEach((panel, index) => {
        panel.style.zIndex = String(index + 1);
        panel.style.top = `${Math.min(0, vh - panel.offsetHeight)}px`;
      });
      onScroll();
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      panels.forEach((panel, index) => {
        const next = panels[index + 1];
        if (!next) return;
        const cover = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh));
        panel.style.setProperty("--cover", cover.toFixed(3));
      });
    };
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    const observer = new ResizeObserver(layout);
    panels.forEach((panel) => observer.observe(panel));
    window.addEventListener("resize", layout);
    window.addEventListener("scroll", onScroll, { passive: true });
    layout();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The new light spreads out in a circle from the bulb. Browsers without view transitions just switch.
  const toggleLight = (origin: { x: number; y: number }) => {
    const apply = () => flushSync(() => setLightOn((value) => !value));
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    const radius = Math.hypot(Math.max(origin.x, window.innerWidth - origin.x), Math.max(origin.y, window.innerHeight - origin.y));
    const root = document.documentElement;
    root.classList.add("lp-vt");
    const transition = doc.startViewTransition(apply);
    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
          { duration: 800, easing: "cubic-bezier(.7,0,.25,1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove("lp-vt"));
  };

  const toggleFromButton = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    toggleLight({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  // Sticky sheets sit on top of each other, so a #link has to scroll to where the sheet starts in the flow.
  const goTo = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    const main = mainRef.current;
    if (!main) return;
    let top = main.offsetTop;
    for (const panel of Array.from(main.querySelectorAll<HTMLElement>(".lp-panel"))) {
      if (panel.id === id) break;
      top += panel.offsetHeight;
    }
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createLead.mutate({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      service: String(form.get("service") ?? "") || undefined,
      message: String(form.get("message") ?? "") || undefined,
    });
  };

  return (
    <div className={`lp ${lightOn ? "is-on" : "is-off"}`} dir="rtl" lang="ar">
      <header className="lp-header">
        <a className="lp-logo" href="#home" onClick={goTo("home")}>
          سَفَر<span>.</span>
        </a>
        <nav className="lp-nav" aria-label="أقسام الصفحة">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={goTo(item.id)}>
              {item.label}
            </a>
          ))}
        </nav>
        <button className="lp-switch" onClick={toggleFromButton} aria-pressed={lightOn} aria-label={lightOn ? "إطفاء الضوء" : "تشغيل الضوء"}>
          <span className="lp-switch__bulb" />
          <span className="lp-switch__text">{lightOn ? "طفّ الضوء" : "شغّل الضوء"}</span>
        </button>
      </header>

      <main ref={mainRef}>
        <section id="home" className="lp-panel lp-hero">
          <div className="lp-panel__inner lp-hero__inner">
            <div className="lp-hero__copy">
              <p className="lp-kicker">سَفَر · استوديو تصميم</p>
              <h1>
                كل فكرة
                <br />
                تبدأ <em>بشرارة.</em>
              </h1>
              <p className="lp-lead">نحوّل أفكارك إلى هويات وتجارب رقمية وفيديوهات تترك أثر. شغّل الضوء، وشوف الصورة كاملة.</p>
              <div className="lp-hero__actions">
                <a className="lp-btn" href="#contact" onClick={goTo("contact")}>
                  ابدأ مشروعك <ArrowLeft size={18} />
                </a>
                <a className="lp-link" href="#about" onClick={goTo("about")}>
                  تعرّف علينا <ArrowDown size={16} />
                </a>
              </div>
            </div>
            <div className="lp-hero__lamp">
              <div className="lp-glow" aria-hidden="true" />
              <PullLamp on={lightOn} onToggle={toggleLight} label={lightOn ? "اسحب الحبل لإطفاء الضوء" : "اسحب الحبل لتشغيل الضوء"} />
              <p className="lp-hint" aria-live="polite">
                {lightOn ? "وضحت الصورة؟ انزل تحت" : "اسحب الحبل وشغّل الضوء"}
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="lp-panel lp-about">
          <div className="lp-panel__inner">
            <p className="lp-kicker">من نحن</p>
            <h2 className="lp-statement">
              استوديو صغير، بفريق يشتغل على مشروعك <em>كأنه مشروعه.</em>
            </h2>
            <div className="lp-about__grid">
              <p>
                سَفَر استوديو سعودي يجمع التصميم والفيديو والتقنية تحت سقف واحد. نبدأ بسؤال بسيط: وش تبي الناس تحس لما تشوفك؟ وبعدها نبني كل شي حول هالإجابة.
              </p>
              <ul className="lp-facts">
                <li>
                  <strong>من الفكرة للإطلاق</strong>
                  <span>نفس الفريق من أول جلسة لين آخر ملف.</span>
                </li>
                <li>
                  <strong>تحت سقف واحد</strong>
                  <span>هوية، فيديو، مواقع، وأنظمة ذكية.</span>
                </li>
                <li>
                  <strong>الرياض · جدة · عن بُعد</strong>
                  <span>نشتغل معك وين ما كنت.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="services" className="lp-panel lp-services">
          <div className="lp-panel__inner">
            <div className="lp-head">
              <p className="lp-kicker">الخدمات</p>
              <h2>
                كل اللي تحتاجه، <em>في مكان واحد.</em>
              </h2>
            </div>
            <ol className="lp-service-list">
              {services.map((service, index) => (
                <li key={service.title}>
                  <span className="lp-service-no">0{index + 1}</span>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.lead}</p>
                  </div>
                  <div className="lp-tags">
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="process" className="lp-panel lp-process">
          <div className="lp-panel__inner">
            <div className="lp-head">
              <p className="lp-kicker">كيف نشتغل</p>
              <h2>
                أربع خطوات، <em>وبدون لف ودوران.</em>
              </h2>
            </div>
            <div className="lp-steps">
              {steps.map((step) => (
                <article key={step.no} className="lp-step">
                  <span>{step.no}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="lp-panel lp-work">
          <div className="lp-panel__inner">
            <div className="lp-head lp-head--row">
              <div>
                <p className="lp-kicker">أعمالنا</p>
                <h2>
                  مشاريع <em>تتكلم عن نفسها.</em>
                </h2>
              </div>
              <a className="lp-link" href="/works">
                شوف كل الأعمال <ArrowLeft size={16} />
              </a>
            </div>
            <div className="lp-works">
              {works.map((work) => (
                <a key={work.title} className={`lp-work lp-work--${work.tone}`} href="/works">
                  <div className="lp-work__art" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <small>{work.kind}</small>
                  <strong>{work.title}</strong>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="lp-panel lp-contact">
          <div className="lp-panel__inner lp-contact__inner">
            <div>
              <p className="lp-kicker">تواصل</p>
              <h2 className="lp-statement">
                جاهز <em>نشغّل</em> فكرتك؟
              </h2>
              <p className="lp-lead">أرسل لنا تفاصيل بسيطة عن مشروعك، ونرجع لك باقتراح يناسب مرحلتك.</p>
            </div>
            <div className="lp-form-card">
              {submitted ? (
                <div className="lp-success">
                  <span>
                    <Check size={22} />
                  </span>
                  <h3>وصلنا طلبك.</h3>
                  <p>شكرًا لثقتك، بنرجع لك قريب.</p>
                  <button className="lp-link" onClick={() => setSubmitted(false)}>
                    إرسال طلب جديد
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <label>
                    الاسم
                    <input name="name" required autoComplete="name" />
                  </label>
                  <label>
                    البريد الإلكتروني
                    <input name="email" type="email" required autoComplete="email" dir="ltr" />
                  </label>
                  <label>
                    الخدمة
                    <select name="service" defaultValue="">
                      <option value="">اختر خدمة</option>
                      {services.map((service) => (
                        <option key={service.title}>{service.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    نبذة عن المشروع
                    <textarea name="message" rows={3} />
                  </label>
                  <button className="lp-btn lp-btn--full" type="submit" disabled={createLead.isPending}>
                    {createLead.isPending ? "جاري الإرسال…" : "أرسل الطلب"} <ArrowLeft size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
          <footer className="lp-footer">
            <span>سَفَر<b>.</b></span>
            <span>أفكار جيدة. تصاميم أفضل. أثر يدوم.</span>
            <span>© {new Date().getFullYear()}</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
