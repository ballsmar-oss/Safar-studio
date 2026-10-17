// Stand-in for "@/lib/trpc" in the dashboard preview: same hooks, data kept in memory.
import { useState, useSyncExternalStore } from "react";

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);
let nextId = 100;

const store: Record<string, any> = {
  portfolio: [
    { id: 1, title: "رابطي", description: null, category: "موشن", mediaType: "link", mediaUrl: "https://safarstudio.sa", thumbnailUrl: null, projectUrl: null, isPublished: true, sortOrder: 1 },
    { id: 2, title: "صورة ١", description: null, category: "موشن", mediaType: "image", mediaUrl: "media/work-car.jpg", thumbnailUrl: null, projectUrl: null, isPublished: true, sortOrder: 2 },
    { id: 3, title: "فيديو ٢", description: null, category: "موشن", mediaType: "video", mediaUrl: "media/video2.mp4", thumbnailUrl: "media/video2-poster.jpg", projectUrl: null, isPublished: true, sortOrder: 3 },
    { id: 4, title: "فيديو ١", description: null, category: "موشن", mediaType: "video", mediaUrl: "media/video1.mp4", thumbnailUrl: "media/video1-poster.jpg", projectUrl: null, isPublished: true, sortOrder: 4 },
  ],
  testimonials: [
    { id: 1, name: "هي", company: "بي", quote: "منتازه", rating: 5, avatarUrl: null, isPublished: true, sortOrder: 1 },
    { id: 2, name: "عميل ١", company: "فنان", quote: "رهيب", rating: 5, avatarUrl: null, isPublished: true, sortOrder: 2 },
  ],
  content: [],
  leads: [
    { id: 1, name: "عميل تجريبي", email: "client@example.com", phone: "0500000000", service: "branding", message: "أبي هوية كاملة لمقهى جديد", status: "new", createdAt: daysAgo(1) },
    { id: 2, name: "مثال ثاني", email: "second@example.com", phone: null, service: "motion", message: "فيديو إعلاني ٣٠ ثانية", status: "contacted", createdAt: daysAgo(4) },
  ],
  payments: [
    { id: 1, publicToken: "preview-token-0001", name: "مثال ثاني", email: "second@example.com", service: "موشن جرافيك", amount: 250000, status: "pending", createdAt: daysAgo(3) },
  ],
  settings: { brandName: "سَفَر", officialDomain: "safarstudio.sa", businessEmail: "", whatsappNumber: "", instagramUrl: "", linkedinUrl: "", tiktokUrl: "", senderName: "", dnsRecords: "", applePayAssociation: "", mode: "test",
    resendApiKey: { configured: false }, moyasarPublishableKey: { configured: false }, moyasarSecretKey: { configured: false }, moyasarWebhookSecret: { configured: false } },
  devices: [{ id: 1, label: "جهازك · هذا المتصفح", createdAt: daysAgo(2), lastSeenAt: now, isCurrent: true }],
};

let version = 0;
const listeners = new Set<() => void>();
const changed = () => { version += 1; listeners.forEach((listener) => listener()); };
const useVersion = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => version);

const queries: Record<string, () => any> = {
  "publicContent.all": () => ({
    content: [],
    portfolio: store.portfolio.filter((item: any) => item.isPublished),
    testimonials: store.testimonials.filter((item: any) => item.isPublished),
    settings: { whatsappNumber: null, instagramUrl: null, linkedinUrl: null, tiktokUrl: null, businessEmail: null },
  }),
  "publicContent.work": () => null,
  "auth.me": () => ({ isAdmin: true }),
  "admin.dashboard": () => ({ portfolio: [...store.portfolio], testimonials: [...store.testimonials], content: [...store.content], leads: [...store.leads], payments: [...store.payments] }),
  "admin.integrationSettings": () => ({ ...store.settings }),
  "admin.devices": () => [...store.devices],
};

const upsert = (list: any[], input: any) => {
  const index = list.findIndex((item) => item.id === input.id);
  if (index >= 0) list[index] = { ...list[index], ...input };
  else list.push({ ...input, id: nextId++ });
};
const PREVIEW_ONLY = "هذي نسخة معاينة: الإيميلات تنرسل بعد رفع الموقع على السيرفر.";
const mutations: Record<string, (input: any) => any> = {
  "publicContent.createLead": () => ({ success: true }),
  "admin.saveContent": (input) => { store.content = store.content.filter((item: any) => item.contentKey !== input.contentKey).concat({ ...input, id: nextId++ }); },
  "admin.createPortfolio": (input) => upsert(store.portfolio, input),
  "admin.updatePortfolio": (input) => upsert(store.portfolio, input),
  "admin.deletePortfolio": ({ id }) => { store.portfolio = store.portfolio.filter((item: any) => item.id !== id); },
  "admin.createTestimonial": (input) => upsert(store.testimonials, input),
  "admin.updateTestimonial": (input) => upsert(store.testimonials, input),
  "admin.deleteTestimonial": ({ id }) => { store.testimonials = store.testimonials.filter((item: any) => item.id !== id); },
  "admin.updateLeadStatus": (input) => upsert(store.leads, input),
  "admin.updatePaymentStatus": (input) => upsert(store.payments, input),
  "admin.createPaymentRequest": (input) => { const publicToken = `preview-${Math.random().toString(36).slice(2, 10)}`; store.payments.unshift({ ...input, id: nextId++, publicToken, status: "pending", createdAt: new Date() }); return { publicToken }; },
  "admin.emailCustomer": () => { throw new Error(PREVIEW_ONLY); },
  "admin.saveIntegrationSettings": (input) => {
    const secrets = ["resendApiKey", "moyasarPublishableKey", "moyasarSecretKey", "moyasarWebhookSecret"];
    const next = { ...store.settings, ...input };
    for (const key of secrets) next[key] = { configured: Boolean(input[key]?.trim()) || store.settings[key].configured };
    store.settings = next;
  },
  "admin.revokeDevice": ({ id }) => { store.devices = store.devices.filter((device: any) => device.id !== id); },
  "publicContent.simulatePayment": ({ token }) => {
    const request = store.payments.find((item: any) => item.publicToken === token);
    if (!request || request.status !== "pending") throw new Error("هذا الرابط غير صالح أو مدفوع مسبقًا.");
    request.status = "paid";
    return { success: true, status: "paid" };
  },
};

function useMockQuery(path: string, input?: any) {
  useVersion();
  const data = path === "publicContent.work"
    ? store.portfolio.find((item: any) => item.id === input?.id && item.isPublished) ?? null
    : path === "publicContent.getPaymentRequest"
      ? (() => { const request = store.payments.find((item: any) => item.publicToken === input?.token); return request ? { ...request, testMode: true } : null; })()
      : queries[path]?.();
  return { data, isLoading: false, error: null, refetch: async () => { changed(); return { data }; } };
}

function useMockMutation(path: string, options: { onSuccess?: (result: any) => void; onError?: (error: Error) => void } = {}) {
  const [isPending, setPending] = useState(false);
  const mutate = (input: any) => {
    setPending(true);
    setTimeout(() => {
      try {
        const result = mutations[path]?.(input) ?? { success: true };
        changed();
        options.onSuccess?.(result);
      } catch (error) {
        options.onError?.(error as Error);
      } finally {
        setPending(false);
      }
    }, 250);
  };
  return { mutate, mutateAsync: async (input: any) => mutate(input), isPending };
}

const utils = new Proxy({}, { get: () => new Proxy({}, { get: () => ({ invalidate: async () => changed(), setData: () => {} }) }) });

export const trpc: any = new Proxy({}, {
  get(_target, group: string) {
    if (group === "useUtils") return () => utils;
    return new Proxy({}, { get: (_t, name: string) => ({
      useQuery: (input?: any) => useMockQuery(`${group}.${name}`, input),
      useMutation: (options?: any) => useMockMutation(`${group}.${name}`, options),
    }) });
  },
});
