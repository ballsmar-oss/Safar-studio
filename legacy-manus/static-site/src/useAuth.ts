// بديل ثابت لـ useAuth: الموقع الثابت ما فيه تسجيل دخول.
export function useAuth() {
  return { user: null, loading: false, error: null, isAuthenticated: false, logout: async () => {}, refresh: async () => {} };
}
