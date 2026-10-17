// بديل ثابت لـ "@/lib/trpc": نفس الواجهة اللي تستخدمها Home.tsx و Works.tsx بدون سيرفر.
import { useState } from "react";
import { leadEmail, staticContent } from "./content";

type LeadInput = { name: string; email: string; phone?: string; service?: string; message?: string };
type MutationOptions = { onSuccess?: () => void; onError?: (error: Error) => void };

function useLeadMutation(options: MutationOptions = {}) {
  const [isPending, setIsPending] = useState(false);
  const mutate = (input: LeadInput) => {
    setIsPending(true);
    try {
      const body = [`الاسم: ${input.name}`, `البريد: ${input.email}`, input.phone && `الجوال: ${input.phone}`, input.service && `الخدمة: ${input.service}`, input.message && `\n${input.message}`].filter(Boolean).join("\n");
      window.location.href = `mailto:${leadEmail}?subject=${encodeURIComponent(`طلب مشروع — ${input.name}`)}&body=${encodeURIComponent(body)}`;
      options.onSuccess?.();
    } catch (error) {
      options.onError?.(error as Error);
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending };
}

export const trpc: any = {
  publicContent: {
    all: { useQuery: () => ({ data: staticContent, isLoading: false, error: null }) },
    createLead: { useMutation: useLeadMutation },
  },
};
