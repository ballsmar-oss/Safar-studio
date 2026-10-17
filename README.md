# سَفَر — موقع الاستوديو

موقع سَفَر كامل (الصفحة الرئيسية، الأعمال، صفحة الدفع، لوحة التحكم) يشتغل على سيرفرك الخاص بدون Manus أو أي خدمة خارجية.

- **الواجهة:** React + Vite + Tailwind
- **السيرفر:** Node.js + Express + tRPC
- **قاعدة البيانات:** SQLite — ملف واحد `safar.db` داخل `DATA_DIR`
- **الملفات المرفوعة:** تنحفظ في `DATA_DIR/uploads` وتنعرض من `/uploads/...`
- **البريد (اختياري):** Resend، تضيف مفتاحه من لوحة التحكم

## الدخول للوحة التحكم

ما فيه كلمة مرور ولا خانة دخول. اللوحة تفتح من الأجهزة اللي سجّلتها بس:

1. من جهازك افتح مرة وحدة: `https://safarstudio.sa/admin/connect/<ADMIN_SETUP_KEY>`
2. بعدها `https://safarstudio.sa/admin` يفتح على طول من نفس الجهاز والمتصفح.
3. أي أحد ثاني يفتح `/admin` تطلع له صفحة "غير موجودة".
4. من **الإعدادات ← الأجهزة** تشوف الأجهزة المسجلة وتلغي أي جهاز.

لو تسرّب رابط الدخول، غيّر `ADMIN_SETUP_KEY` في ملف `.env` وأعد تشغيل الموقع. الأجهزة المسجلة تبقى شغالة إلا اللي تلغيها.

## التشغيل على جهازك

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

في وضع التطوير رابط الدخول هو `http://localhost:3000/admin/connect/dev-setup-key`.

## الرفع على السيرفر (Ubuntu VPS)

مرة وحدة على السيرفر:

```bash
# Node 22 و pnpm و Caddy و sqlite3
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs build-essential sqlite3 caddy
sudo npm install -g pnpm@10

# مستخدم ومجلدات الموقع
sudo useradd --system --home /opt/safar safar
sudo mkdir -p /opt/safar /var/lib/safar && sudo chown safar /var/lib/safar

# انسخ ملفات المشروع إلى /opt/safar ثم:
cd /opt/safar
sudo cp .env.example .env && sudo nano .env      # عبّئ ADMIN_SETUP_KEY و SETTINGS_SECRET
pnpm install --frozen-lockfile && pnpm build

sudo cp deploy/safar.service /etc/systemd/system/ && sudo systemctl enable --now safar
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

بعدها وجّه الدومين `safarstudio.sa` (سجل A) إلى IP السيرفر، و Caddy يطلع شهادة HTTPS لحاله.

**تحديث الموقع لاحقًا:** انسخ الملفات الجديدة ثم `pnpm install && pnpm build && sudo systemctl restart safar`.

**النسخ الاحتياطي:** `deploy/backup.sh` ياخذ نسخة يومية من قاعدة البيانات والملفات المرفوعة (أضفه للـ cron كما هو مكتوب داخله).

## ملاحظات

- مجلد `legacy-manus/` فيه ملفات Manus القديمة للمرجع بس، والموقع ما يستخدمها.
- الدفع الحالي تجريبي: زر "إتمام الدفع التجريبي" يشتغل بس إذا وضع التشغيل في الإعدادات = Test. ربط ميسّر الحقيقي خطوة لاحقة.
