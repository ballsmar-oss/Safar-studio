import { trpc } from "@/lib/trpc";

// True only on a browser that was connected through /admin/connect/<key>.
export function useAdmin() {
  const me = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  return { isAdmin: Boolean(me.data?.isAdmin), loading: me.isLoading };
}
