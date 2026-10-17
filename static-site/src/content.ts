// بيانات الموقع الثابت — تقوم مقام لوحة التحكم وقاعدة البيانات.
// اترك أي قائمة فاضية عشان يظهر المحتوى الافتراضي المكتوب في Home.tsx.

export const staticContent = {
  // نصوص تستبدل الافتراضية، مثال: { contentKey: "hero.a", contentValue: "أفكارك" }
  content: [] as { contentKey: string; contentValue: string }[],
  // أعمال: mediaType = "image" | "video" | "link"
  portfolio: [] as {
    id: number;
    title: string;
    description?: string | null;
    category: string;
    mediaType: "image" | "video" | "link";
    mediaUrl: string;
    thumbnailUrl?: string | null;
    projectUrl?: string | null;
  }[],
  testimonials: [] as { id: number; name: string; company?: string | null; quote: string; rating: number }[],
  settings: {
    whatsappNumber: "",
    instagramUrl: "",
    linkedinUrl: "",
    tiktokUrl: "",
  },
};

// البريد اللي يوصله طلب نموذج التواصل
export const leadEmail = "hello@safar.studio";
