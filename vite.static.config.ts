// بناء نسخة ثابتة من الموقع (الرئيسية + الأعمال) بدون سيرفر Manus أو قاعدة بيانات.
// pnpm build:static  →  dist-static/  (جاهز لـ GitHub Pages أو أي استضافة ثابتة)
// لمسار فرعي مثل username.github.io/Safar-studio:  STATIC_BASE=/Safar-studio/ pnpm build:static
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

const root = import.meta.dirname;
const base = process.env.STATIC_BASE ?? "/";

// الصفحات تكتب روابط مطلقة ("/manus-storage/..", href="/works"); نضيف لها base عشان تشتغل تحت أي مسار.
function rewriteAbsolutePaths(): Plugin {
  return {
    name: "static-rewrite-paths",
    enforce: "pre",
    transform(code, id) {
      if (base === "/" || !id.includes(`${path.sep}client${path.sep}src${path.sep}pages${path.sep}`)) return;
      return code.replace(/(["'`])\/(manus-storage\/|works\b|#|admin\b|\1)/g, (_m, q, rest) => `${q}${base}${rest}`);
    },
  };
}

// GitHub Pages: /works يحتاج ملف خاص به، و 404.html يرجع للتطبيق.
function spaFallbacks(): Plugin {
  return {
    name: "static-spa-fallbacks",
    closeBundle() {
      const out = path.resolve(root, "dist-static");
      const html = fs.readFileSync(path.join(out, "index.html"));
      fs.mkdirSync(path.join(out, "works"), { recursive: true });
      fs.writeFileSync(path.join(out, "works", "index.html"), html);
      fs.writeFileSync(path.join(out, "404.html"), html);
      fs.writeFileSync(path.join(out, ".nojekyll"), "");
    },
  };
}

export default defineConfig({
  base,
  plugins: [rewriteAbsolutePaths(), react(), tailwindcss(), spaFallbacks()],
  resolve: {
    alias: [
      { find: "@/lib/trpc", replacement: path.resolve(root, "static-site/src/trpc.ts") },
      { find: "@/_core/hooks/useAuth", replacement: path.resolve(root, "static-site/src/useAuth.ts") },
      { find: "@shared", replacement: path.resolve(root, "shared") },
      { find: "@", replacement: path.resolve(root, "client/src") },
    ],
  },
  root: path.resolve(root, "static-site"),
  publicDir: path.resolve(root, "static-site/public"),
  build: { outDir: path.resolve(root, "dist-static"), emptyOutDir: true },
});
