import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getEmbedUrl, getVideoPoster } from "@/lib/video";
import "./work-book.css";

export type BookWork = {
  id: number;
  title: string;
  category?: string | null;
  description?: string | null;
  labels?: string | null;
  mediaType: "image" | "video" | "link";
  mediaUrl: string;
  thumbnailUrl?: string | null;
  projectUrl?: string | null;
};

type Props = { works: BookWork[]; isArabic: boolean; contactHref: string };

const pad = (value: number) => String(value).padStart(2, "0");

// The labels field is typed by the admin, separated by commas (Arabic or English).
function splitLabels(value?: string | null) {
  return (value ?? "")
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

// A stack of work cards, like a folder: tap the top strip or swipe to move to the next card.
// Tapping the text opens the work: the site for links, the video or image for the rest.
export default function WorkBook({ works, isArabic, contactHref }: Props) {
  const [index, setIndex] = useState(0);
  const [ghost, setGhost] = useState<{ key: number; dir: "next" | "prev" } | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const count = works.length;
  const current = works[Math.min(index, count - 1)];

  useEffect(() => {
    setIndex(0);
  }, [works]);

  // A card that was just turned to plays on its own: the browser allows it because the reader tapped to turn it.
  useEffect(() => {
    if (autoplay) videoRef.current?.play().catch(() => undefined);
  }, [index, autoplay]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(isArabic ? 1 : -1);
      if (event.key === "ArrowRight") step(isArabic ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // The stack loops: after the last card comes the first one, like a folder.
  function step(dir: 1 | -1) {
    if (count < 2) return;
    setGhost({ key: Date.now(), dir: dir === 1 ? "next" : "prev" });
    setAutoplay(true);
    setIndex((index + dir + count) % count);
  }

  function openWork() {
    if (!current) return;
    if (current.mediaType === "link") {
      window.open(current.projectUrl || current.mediaUrl, "_blank", "noopener");
      return;
    }
    if (current.mediaType === "video" && videoRef.current) {
      videoRef.current.requestFullscreen?.().catch(() => undefined);
      videoRef.current.play().catch(() => undefined);
      return;
    }
    window.open(current.mediaUrl, "_blank", "noopener");
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (start == null) return;
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) < 40) return;
    step(delta < 0 ? 1 : -1);
  }

  if (!current) return null;

  const embed = current.mediaType === "video" ? getEmbedUrl(current.mediaUrl) : null;
  const cover = current.thumbnailUrl || (current.mediaType === "video" ? getVideoPoster(current.mediaUrl) : null);
  const labels = splitLabels(current.labels);
  const backCards = [1, 2].filter((offset) => offset < count);
  const openLabel =
    current.mediaType === "link" ? (isArabic ? "افتح الموقع" : "Open the site") : current.mediaType === "video" ? (isArabic ? "شاهد الفيديو" : "Watch the video") : isArabic ? "شاهد العمل" : "View the work";
  const PrevIcon = isArabic ? ArrowRight : ArrowLeft;
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="wb" dir={isArabic ? "rtl" : "ltr"} onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={onTouchEnd}>
      <div className="wb-deck">
        {backCards.map((offset) => (
          <div key={offset} className="wb-back" style={{ "--n": offset } as CSSProperties} aria-hidden="true" />
        ))}

        {ghost && <div key={ghost.key} className={`wb-card wb-ghost wb-ghost--${ghost.dir}`} aria-hidden="true" onAnimationEnd={() => setGhost(null)} />}

        <article key={current.id} className="wb-card wb-enter" data-spine={isArabic ? "سَفَر" : "SAFAR"}>
          <button type="button" className="wb-head" onClick={() => step(1)} aria-label={isArabic ? "العمل التالي" : "Next work"}>
            <span>{pad(index + 1)} / {pad(count)}</span>
            <span>{isArabic ? "اضغط هنا للتالي" : "Tap here for next"}</span>
          </button>

          <div className="wb-media">
            {embed ? (
              <iframe src={`${embed}?autoplay=${autoplay ? 1 : 0}&rel=0`} title={current.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : current.mediaType === "video" ? (
              <video ref={videoRef} src={current.mediaUrl} poster={cover ?? undefined} controls playsInline preload="metadata" />
            ) : current.mediaType === "image" ? (
              <img src={current.mediaUrl} alt={current.title} />
            ) : cover ? (
              <img src={cover} alt={current.title} />
            ) : null}
            {labels.length > 0 && (
              <div className="wb-labels">
                {labels.map((label) => <span key={label}>{label}</span>)}
              </div>
            )}
          </div>

          <div className="wb-text" role="button" tabIndex={0} onClick={openWork} onKeyDown={(event) => { if (event.key === "Enter") openWork(); }}>
            <h3>{current.title}</h3>
            {current.description && <p>{current.description}</p>}
            <span className="wb-open">{openLabel}</span>
          </div>
        </article>
      </div>

      <div className="wb-controls">
        <button type="button" onClick={() => step(-1)} aria-label={isArabic ? "العمل السابق" : "Previous work"}>
          <PrevIcon size={20} />
        </button>
        <span>{pad(index + 1)} / {pad(count)}</span>
        <button type="button" onClick={() => step(1)} aria-label={isArabic ? "العمل التالي" : "Next work"}>
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
