// YouTube and Vimeo links can play inside the site through their embed players.
// Direct video files (mp4, webm) return null and keep using the native <video> element.

function youtubeId(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return url.pathname.slice(1) || null;
  if (host === "youtube.com" || host === "m.youtube.com") {
    return url.searchParams.get("v") ?? url.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1] ?? null;
  }
  return null;
}

export function getEmbedUrl(raw: string) {
  try {
    const url = new URL(raw);
    const id = youtubeId(url);
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (url.hostname.replace(/^www\./, "") === "vimeo.com") {
      const vimeoId = url.pathname.match(/\/(\d+)/)?.[1];
      return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
    }
  } catch {
    /* ليس رابطًا صالحًا */
  }
  return null;
}

// A still image for the card: YouTube provides one for every video.
export function getVideoPoster(raw: string) {
  try {
    const id = youtubeId(new URL(raw));
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}
