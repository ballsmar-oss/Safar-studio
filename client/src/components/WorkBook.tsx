import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { getEmbedUrl, getVideoPoster } from "@/lib/video";
import "./work-book.css";

export type BookWork = {
  id: number;
  title: string;
  category?: string | null;
  description?: string | null;
  mediaType: "image" | "video" | "link";
  mediaUrl: string;
  thumbnailUrl?: string | null;
  projectUrl?: string | null;
};

type Props = { works: BookWork[]; isArabic: boolean; contactHref: string };

const pad = (value: number) => String(value).padStart(2, "0");

// A flipbook of works: one work per page, the page turns like paper, and the video plays with sound after a tap.
export default function WorkBook({ works, isArabic, contactHref }: Props) {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<"next" | "prev" | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const count = works.length;
  const current = works[Math.min(index, count - 1)];

  useEffect(() => {
    setIndex(0);
  }, [works]);

  // Only the page that was just turned to plays on its own, which the browser allows because the reader tapped to turn it.
  useEffect(() => {
    if (autoplay) videoRef.current?.play().catch(() => undefined);
  }, [index, autoplay]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") flip(isArabic ? "next" : "prev");
      if (event.key === "ArrowRight") flip(isArabic ? "prev" : "next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function flip(direction: "next" | "prev") {
    if (turn || count < 2) return;
    const target = direction === "next" ? index + 1 : index - 1;
    if (target < 0 || target >= count) return;
    setTurn(direction);
    setAutoplay(true);
    setIndex(target);
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (start == null) return;
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) < 40) return;
    const towardNext = isArabic ? delta > 0 : delta < 0;
    flip(towardNext ? "next" : "prev");
  }

  if (!current) return null;

  const embed = current.mediaType === "video" ? getEmbedUrl(current.mediaUrl) : null;
  const cover = current.thumbnailUrl || (current.mediaType === "video" ? getVideoPoster(current.mediaUrl) : null);
  const openHref = current.mediaType === "link" ? current.projectUrl || current.mediaUrl : null;
  const PrevIcon = isArabic ? ArrowRight : ArrowLeft;
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;
  const stageStyle = {
    "--turn": isArabic ? "180deg" : "-180deg",
    "--origin": isArabic ? "right center" : "left center",
  } as CSSProperties;

  return (
    <div className="wb" dir={isArabic ? "rtl" : "ltr"} onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={onTouchEnd}>
      <div className="wb-stage" style={stageStyle}>
        <article key={current.id} className="wb-page wb-enter">
          <div className="wb-media">
            {embed ? (
              <iframe src={`${embed}?autoplay=${autoplay ? 1 : 0}&rel=0`} title={current.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : current.mediaType === "video" ? (
              <video ref={videoRef} src={current.mediaUrl} poster={cover ?? undefined} controls playsInline preload="metadata" />
            ) : current.mediaType === "image" ? (
              <img src={current.mediaUrl} alt={current.title} />
            ) : cover ? (
              <img src={cover} alt={current.title} />
            ) : (
              <div className="wb-link-art"><ExternalLink size={48} /></div>
            )}
          </div>
          <div className="wb-info">
            <span>{current.category || (isArabic ? "مشروع مختار" : "Selected project")}</span>
            <h3>{current.title}</h3>
            {current.description && <p>{current.description}</p>}
            {openHref && <a href={openHref} target="_blank" rel="noreferrer">{isArabic ? "افتح الموقع" : "Open the site"}</a>}
          </div>
        </article>
        {turn && <div key={`${turn}-${index}`} className={`wb-leaf wb-leaf--${turn}`} onAnimationEnd={() => setTurn(null)} />}
      </div>

      <div className="wb-controls">
        <button type="button" onClick={() => flip("prev")} disabled={index === 0 || !!turn} aria-label={isArabic ? "الصفحة السابقة" : "Previous page"}>
          <PrevIcon size={20} />
        </button>
        <span>{pad(index + 1)} / {pad(count)}</span>
        <button type="button" onClick={() => flip("next")} disabled={index >= count - 1 || !!turn} aria-label={isArabic ? "الصفحة التالية" : "Next page"}>
          <NextIcon size={20} />
        </button>
      </div>

      <a className="wb-cta" href={contactHref}>
        {isArabic ? "تواصل معنا لمشاهدة باقي الأعمال" : "Contact us to see more work"}
        <NextIcon size={18} />
      </a>
    </div>
  );
}
