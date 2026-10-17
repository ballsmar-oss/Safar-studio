import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import NotFound from "@/pages/NotFound";

export default function Work() {
  const [, params] = useRoute("/works/:id");
  const id = Number(params?.id);
  const work = trpc.publicContent.work.useQuery({ id }, { enabled: Number.isInteger(id) && id > 0 });

  if (work.isLoading) return <main className="min-h-screen bg-[#fff5df]" />;
  if (!work.data) return <NotFound />;
  const item = work.data;
  const external = item.mediaType === "link" ? (item.projectUrl || item.mediaUrl) : item.projectUrl;

  return (
    <main dir="rtl" className="min-h-screen bg-[#fff5df] text-[#0d2b52]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <a href="/#work" className="mb-6 inline-flex items-center gap-2 font-bold text-[#0d2b52]">
          <ArrowLeft size={17} />رجوع إلى الأعمال
        </a>
        <article className="overflow-hidden rounded-3xl border-[1.5px] border-[#0d2b52] bg-[#b9e4dc] shadow-[6px_7px_0_rgba(13,43,82,.13)]">
          {item.mediaType === "video" && (
            <video src={item.mediaUrl} poster={item.thumbnailUrl ?? undefined} controls playsInline preload="metadata" className="max-h-[80vh] w-full bg-[#0d2b52]" />
          )}
          {item.mediaType === "image" && <img src={item.mediaUrl} alt={item.title} className="max-h-[80vh] w-full object-contain bg-[#0d2b52]" />}
          {item.mediaType === "link" && (
            <a href={item.projectUrl || item.mediaUrl} target="_blank" rel="noreferrer" className="flex h-64 items-center justify-center gap-3 bg-[#0d2b52] text-3xl font-black text-[#fff5df]">
              <ArrowUpLeft size={36} />افتح الموقع
            </a>
          )}
          <div className="p-6 sm:p-8">
            <span className="text-sm font-bold text-[#f47763]">{item.category}</span>
            <h1 className="mt-1 text-3xl font-black">{item.title}</h1>
            {item.description && <p className="mt-4 whitespace-pre-line leading-8 text-[#0d2b52]/80">{item.description}</p>}
            {external && item.mediaType !== "link" && (
              <a href={external} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d2b52] px-5 py-3 font-bold text-white">
                زيارة المشروع <ArrowUpLeft size={17} />
              </a>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
