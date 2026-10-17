# النسخة الثابتة من موقع سَفَر

نفس `client/src/pages/Home.tsx` و `Works.tsx` و `client/src/index.css` بالضبط، لكن بدون سيرفر Manus أو قاعدة بيانات،
عشان تنرفع على GitHub Pages أو أي استضافة ثابتة.

## التشغيل

```bash
pnpm install
pnpm dev:static        # معاينة أثناء التعديل
pnpm build:static      # يطلع الموقع في dist-static/
pnpm preview:static    # يشغّل dist-static/ محليًا
```

تحت مسار فرعي (مثل `username.github.io/Safar-studio`): `STATIC_BASE=/Safar-studio/ pnpm build:static`

## الصور والفيديو

الصور الأصلية محفوظة في تخزين Manus، فحطيت مكانها صور مؤقتة بنفس الأسماء في `public/manus-storage/`.
استبدلها بالأصلية بنفس الاسم بالضبط:

| الملف | مكانه |
|---|---|
| `teq-teal-hero_8ab836b2.png` | رسمة الهيرو |
| `safar-ar-wide_70a991ce.png` | الشعار العربي (الهيدر والفوتر) |
| `safar-en-wide_64b08516.png` | الشعار الإنجليزي |
| `tabyank-cat_98cf277b.png` | القطة |
| `safar-reviews-girl-stars-clean_8637709e.png` | رسمة قسم التقييمات |
| `9062a3c9f2fec74f0523d99d4eb5075b_b1a5015c.mp4` | فيديو بطاقة الموشن (غير موجود حاليًا) |

## المحتوى

بدل لوحة التحكم: عدّل `src/content.ts` (الأعمال، التقييمات، رقم الواتساب، روابط السوشال).
إذا خليتها فاضية يظهر المحتوى الافتراضي المكتوب في الصفحة.

نموذج التواصل يفتح برنامج البريد برسالة جاهزة إلى `leadEmail` (ما فيه سيرفر يستقبل الطلبات).

## النشر على GitHub Pages

1. Settings → Pages → Source = **GitHub Actions**
2. Actions → **Deploy static site** → Run workflow
3. للدومين الخاص: أضف المتغير `STATIC_BASE=/` في Settings → Variables، واربط الدومين من صفحة Pages.
