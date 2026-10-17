// بيانات الموقع الثابت — تقوم مقام لوحة التحكم وقاعدة البيانات.
// المحتوى منقول من الموقع الحالي. أي قائمة تفضيها يظهر مكانها المحتوى الافتراضي المكتوب في Home.tsx.

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

export const staticContent = {
  // نصوص تستبدل الافتراضية، مثال: { contentKey: "hero.a", contentValue: "أفكارك" }
  content: [] as { contentKey: string; contentValue: string }[],
  // أعمال: mediaType = "image" | "video" | "link"
  portfolio: [
    { id: 1, title: "رابطي", category: "موشن", mediaType: "link", mediaUrl: "#" },
    { id: 2, title: "صورة ١", category: "موشن", mediaType: "image", mediaUrl: media("work-car.jpg") },
    { id: 3, title: "فيديو ٢", category: "موشن", mediaType: "video", mediaUrl: media("video2.mp4"), thumbnailUrl: media("video2-poster.jpg") },
    { id: 4, title: "فيديو ١", category: "موشن", mediaType: "video", mediaUrl: media("video1.mp4"), thumbnailUrl: media("video1-poster.jpg") },
  ] as {
    id: number;
    title: string;
    description?: string | null;
    category: string;
    mediaType: "image" | "video" | "link";
    mediaUrl: string;
    thumbnailUrl?: string | null;
    projectUrl?: string | null;
  }[],
  testimonials: [
    { id: 1, name: "هي", company: "بي", quote: "منتازه", rating: 5 },
    { id: 2, name: "عميل ١", company: "فنان", quote: "رهيب", rating: 5 },
  ] as { id: number; name: string; company?: string | null; quote: string; rating: number }[],
  settings: {
    whatsappNumber: "",
    instagramUrl: "",
    linkedinUrl: "",
    tiktokUrl: "",
  },
};

// البريد اللي يوصله طلب نموذج التواصل
export const leadEmail = "hello@safar.studio";
