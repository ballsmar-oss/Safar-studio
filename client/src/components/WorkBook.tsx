import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type TouchEvent } from "react";
import { ArrowLeft } from "lucide-react";
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

// Card silhouette in the box's own units: rounded corners and a concave cutout on the left edge.
const SHAPE_PATH = "M0.06 0 H0.94 Q1 0 1 0.06 V0.94 Q1 1 0.94 1 H0.06 Q0 1 0 0.94 V0.62 C0.14 0.58 0.14 0.42 0 0.38 V0.06 Q0 0 0.06 0 Z";

// Only the top three cards in the stack are visible; the rest wait out of sight.
const VISIBLE_RANKS = 3;

// The labels field is typed by the admin, separated by commas (Arabic or English).
function splitLabels(value?: string | null) {
  return (value ?? "")
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

// A stack of work cards. The front card is the active one; the cards behind it show their tabs above.
// Swipe, click a card behind, or use the keyboard to bring another card to the front.
export default function WorkBook({ works, isArabic, contactHref }: Props) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<{ work: BookWork; dir: 1 | -1 } | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const shapeId = `wb-shape-${useId().replace(/:/g, "")}`;
  const count = works.length;

  useEffect(() => {
    setIndex(0);
  }, [works]);

  // The card that comes to the front plays on its own: the browser allows it because the reader made the move.
  useEffect(() => {
    if (autoplay) videoRef.current?.play().catch(() => undefined);
  }, [index, autoplay]);

  // The card that left the front is removed once its exit animation is done.
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), 520);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(isArabic ? 1 : -1);
      if (event.key === "ArrowRight") step(isArabic ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Moves the chosen card to the front. The stack loops, like a folder.
  function go(target: number, dir: 1 | -1) {
    if (count < 2 || target === index) return;
    setLeaving({ work: works[index], dir });
    setAutoplay(true);
    setIndex(target);
  }

  function step(dir: 1 | -1) {
    go((index + dir + count) % count, dir);
  }

  function openWork(work: BookWork) {
    if (work.mediaType === "link") {
      window.open(work.projectUrl || work.mediaUrl, "_blank", "noopener");
      return;
    }
    if (work.mediaType === "video" && videoRef.current) {
      videoRef.current.requestFullscreen?.().catch(() => undefined);
      videoRef.current.play().catch(() => undefined);
      return;
    }
    window.open(work.mediaUrl, "_blank", "noopener");
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (start == null) return;
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) < 40) return;
    step(delta < 0 ? 1 : -1);
  }

  // One card: its tab, the clipped card body, and the title and description under the media.
  function renderCard(work: BookWork, interactive: boolean): ReactNode {
    const embed = work.mediaType === "video" ? getEmbedUrl(work.mediaUrl) : null;
    const cover = work.thumbnailUrl || (work.mediaType === "video" ? getVideoPoster(work.mediaUrl) : null);
    const labels = splitLabels(work.labels);
    const openLabel =
      work.mediaType === "link" ? (isArabic ? "افتح الموقع" : "Open the site") : work.mediaType === "video" ? (isArabic ? "شاهد الفيديو" : "Watch the video") : isArabic ? "شاهد العمل" : "View the work";

    return (
      <>
        <span className="wb-tab">{work.category || (isArabic ? "عمل" : "Work")}</span>
        <div className="wb-card" style={{ clipPath: `url(#${shapeId})` }}>
          <div className="wb-media">
            {interactive && embed ? (
              <iframe src={`${embed}?autoplay=${autoplay ? 1 : 0}&rel=0`} title={work.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : interactive && work.mediaType === "video" ? (
              <video ref={videoRef} src={work.mediaUrl} poster={cover ?? undefined} controls playsInline preload="metadata" />
            ) : work.mediaType === "image" && interactive ? (
              <img src={work.mediaUrl} alt={work.title} />
            ) : cover ? (
              <img src={cover} alt={work.title} />
            ) : work.mediaType === "image" ? (
              <img src={work.mediaUrl} alt={work.title} />
            ) : null}
            {labels.length > 0 && (
              <div className="wb-labels">
                {labels.map((label) => <span key={label}>{label}</span>)}
              </div>
            )}
          </div>
          <div className="wb-text" role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : -1} onClick={interactive ? () => openWork(work) : undefined} onKeyDown={interactive ? (event) => { if (event.key === "Enter") openWork(work); } : undefined}>
            <h3>{work.title}</h3>
            {work.description && <p>{work.description}</p>}
            {interactive && <span className="wb-open">{openLabel}</span>}
          </div>
        </div>
      </>
    );
  }

  if (!count) return null;

  return (
    <div className="wb" dir={isArabic ? "rtl" : "ltr"} onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={onTouchEnd}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={shapeId} clipPathUnits="objectBoundingBox">
            <path d={SHAPE_PATH} />
          </clipPath>
        </defs>
      </svg>

      <div className="wb-deck">
        {works.map((work, i) => {
          if (leaving && leaving.work.id === work.id) return null;
          const rank = (i - index + count) % count;
          const hidden = rank >= VISIBLE_RANKS;
          return (
            <div
              key={work.id}
              className={`wb-slot wb-slot--r${rank}${hidden ? " wb-slot--hidden" : ""}`}
              style={{ "--rank": rank } as CSSProperties}
              onClick={rank > 0 ? () => go(i, 1) : undefined}
              aria-hidden={rank > 0 ? true : undefined}
            >
              {renderCard(work, rank === 0)}
            </div>
          );
        })}

        {leaving && (
          <div key={`leaving-${leaving.work.id}-${index}`} className={`wb-slot wb-slot--leaving wb-leave--${leaving.dir === 1 ? "next" : "prev"}`} aria-hidden="true">
            {renderCard(leaving.work, false)}
          </div>
        )}
      </div>

      <a className="wb-cta" href={contactHref}>
        {isArabic ? "تواصل معنا لمشاهدة باقي الأعمال" : "Contact us to see more work"}
        <ArrowLeft size={18} style={isArabic ? undefined : { transform: "rotate(180deg)" }} />
      </a>
    </div>
  );
}
