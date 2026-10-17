import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, ChevronDown, ExternalLink, Filter, MoveDown, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

type FilterId = "all" | "motion" | "ai" | "identity" | "ui" | "web" | "social";

type FilterOption = { id: FilterId; ar: string; en: string; aliases: string[] };

const filters: FilterOption[] = [
  { id: "all", ar: "كل الأعمال", en: "All work", aliases: [] },
  { id: "motion", ar: "موشن جرافيك", en: "Motion", aliases: ["موشن", "motion", "فيديو", "video", "تحريك", "animation"] },
  { id: "ai", ar: "ذكاء اصطناعي", en: "AI creative", aliases: ["ذكاء", "ai", "artificial", "اصطناعي"] },
  { id: "identity", ar: "هوية بصرية", en: "Brand identity", aliases: ["هوية", "branding", "identity", "شعار", "علامة"] },
  { id: "ui", ar: "واجهات وتجربة", en: "UI / UX", aliases: ["واجهة", "واجهات", "ui", "ux", "تجربة", "prototype"] },
  { id: "web", ar: "مواقع رقمية", en: "Websites", aliases: ["موقع", "مواقع", "website", "web", "landing"] },
  { id: "social", ar: "محتوى اجتماعي", en: "Social content", aliases: ["سوشال", "اجتماعي", "social", "محتوى"] },
];

function matchesFilter(item: any, option: FilterOption) {
  if (option.id === "all") return true;
  const haystack = `${item.category ?? ""} ${item.title ?? ""} ${item.description ?? ""}`.toLowerCase();
  return option.aliases.some((alias) => haystack.includes(alias.toLowerCase()));
}

export default function Works() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const publicData = trpc.publicContent.all.useQuery();
  const isArabic = language === "ar";
  const works = publicData.data?.portfolio ?? [];
  const activeOption = filters.find((item) => item.id === activeFilter) ?? filters[0];
  const filteredWorks = useMemo(() => works.filter((item) => matchesFilter(item, activeOption)), [works, activeOption]);

  return (
    <div className={`works-page ${isArabic ? "is-arabic" : "is-english"}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="works-topbar"><span>{isArabic ? "أعمال مختارة من سَفَر" : "Selected work from SAFAR"}</span><span>{isArabic ? "الرياض · جدة · عن بُعد" : "Riyadh · Jeddah · Remote"}</span></div>
      <header className="works-header">
        <a className="works-logo" href="/" aria-label={isArabic ? "العودة للرئيسية" : "Back home"}><img src={isArabic ? "/brand/safar-ar.png" : "/brand/safar-en.png"} alt={isArabic ? "شعار سَفَر" : "SAFAR logo"} /></a>
        <nav><a href="/">{isArabic ? "الرئيسية" : "Home"}</a><a className="is-current" href="/works">{isArabic ? "أعمالنا" : "Our work"}</a><a href="/#contact">{isArabic ? "تواصل" : "Contact"}</a></nav>
        <button className="works-language" onClick={() => setLanguage(isArabic ? "en" : "ar")}><span className={isArabic ? "active" : ""}>ع</span><i>/</i><span className={!isArabic ? "active" : ""}>EN</span></button>
      </header>

      <main>
        <section className="works-intro">
          <div className="works-intro-copy">
            <div className="works-kicker"><span />{isArabic ? "من الفكرة إلى شيء يُرى" : "From idea to something seen"}</div>
            <h1>{isArabic ? <>أعمالنا<br /><em>تتكلم عنّا.</em></> : <>Work that<br /><em>speaks for us.</em></>}</h1>
            <p>{isArabic ? "مساحة تجمع المشاريع التي صممناها لتتحرك، توضّح، وتترك أثرًا." : "A living collection of projects designed to move, clarify, and leave a mark."}</p>
          </div>
          <div className="works-intro-art" aria-hidden="true"><div className="works-orbit works-orbit--one" /><div className="works-orbit works-orbit--two" /><span className="works-art-word">IDEAS<br /><b>→</b><br />IN MOTION</span><Sparkles className="works-spark" size={31} /><div className="works-sticker">{isArabic ? <>اسحب<br />واختر</> : <>PICK<br />A MOOD</>}</div></div>
        </section>

        <section className="works-filter-section" aria-label={isArabic ? "فلترة الأعمال" : "Work filters"}>
          <div className="works-filter-heading"><div><div className="works-kicker"><span /><Filter size={15} />{isArabic ? "اختر المسار" : "Choose a direction"}</div><h2>{isArabic ? "وش تحب تشوف؟" : "What do you want to see?"}</h2></div><MoveDown className="works-filter-arrow" size={27} /></div>
          <div className="works-filters">{filters.map((option) => <button key={option.id} className={activeFilter === option.id ? "is-active" : ""} onClick={() => setActiveFilter(option.id)}>{isArabic ? option.ar : option.en}<span>{activeFilter === option.id ? "✦" : "↗"}</span></button>)}</div>
        </section>

        <section className="works-grid-section">
          <div className="works-grid-heading"><div><span className="works-count">{String(filteredWorks.length).padStart(2, "0")} {isArabic ? "مشروع" : "projects"}</span><h2>{isArabic ? activeOption.ar : activeOption.en}</h2></div><p>{isArabic ? "كل بطاقة تفتح العمل أو موقعه مباشرة." : "Open any card to view the work or its live link."}</p></div>
          {publicData.isLoading ? <div className="works-empty"><div className="works-empty-mark">…</div><h3>{isArabic ? "نجهز الأعمال" : "Loading the work"}</h3></div> : filteredWorks.length ? <div className="works-grid">{filteredWorks.map((item: any, index: number) => <article key={item.id} className={`works-card works-card--${index % 4}`}><div className="works-card-media">{item.mediaType === "video" ? <video src={item.mediaUrl} poster={item.thumbnailUrl ?? undefined} muted loop playsInline autoPlay /> : item.mediaType === "image" ? <img src={item.mediaUrl} alt={item.title} /> : <div className="works-link-art"><ExternalLink size={45} /><span>{isArabic ? "تجربة رقمية" : "Digital experience"}</span></div>}<div className="works-card-shape" /></div><div className="works-card-info"><div><span>{item.category || (isArabic ? "مشروع مختار" : "Selected project")}</span><h3>{item.title}</h3></div><a href={item.projectUrl || item.mediaUrl} target="_blank" rel="noreferrer" aria-label={`${isArabic ? "فتح" : "Open"} ${item.title}`}><ArrowUpLeft size={21} /></a></div>{item.description && <p>{item.description}</p>}</article>)}</div> : <div className="works-empty"><div className="works-empty-mark">✦</div><h3>{isArabic ? "ما فيه أعمال بهذا القسم حتى الآن" : "No work in this category yet"}</h3><p>{isArabic ? "جرّب قسمًا ثانيًا أو أضف مشروعًا من لوحة التحكم." : "Try another category or add a project from the admin dashboard."}</p><a href="/admin">{isArabic ? "إضافة عمل من لوحة التحكم" : "Add work from admin"} <ArrowLeft size={15} /></a></div>}
        </section>
      </main>
      <footer className="works-footer"><a href="/">سَفَر</a><p>{isArabic ? "أفكار جيدة. تصاميم أفضل. أثر يدوم." : "Good ideas. Better design. Lasting impact."}</p><a href="/#contact">{isArabic ? "خلّنا نبدأ" : "Let’s start"} <ArrowLeft size={15} /></a></footer>
    </div>
  );
}
