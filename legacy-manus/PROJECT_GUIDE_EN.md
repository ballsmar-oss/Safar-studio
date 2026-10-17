# SAFAR Studio — Complete Project Guide

## 1. What this project is

SAFAR Studio is a bilingual Arabic/English full-stack website for a creative digital studio. The visual identity uses a turquoise, navy, cream, and coral palette, with a custom SAFAR logo, hand-drawn decorative elements, and an illustrated cat.

The project is built with React, TypeScript, Vite, Tailwind CSS, Node.js, Express, tRPC, Drizzle ORM, and MySQL/TiDB.

## 2. What has been implemented

### Public website

- Responsive Arabic-first landing page with RTL support.
- Arabic/English language switcher.
- SAFAR bilingual visual identity and logo assets.
- Interactive hero section with a phone interface.
- Service selection inside the phone UI.
- Expanded service descriptions when a service is enabled.
- CTA buttons that scroll or navigate to contact and portfolio areas.
- Portfolio section with image, video, and external project-link support.
- Dedicated `/works` page with category filters.
- Testimonial carousel with automatic rotation and touch/swipe support.
- Optional social-media links controlled from the admin panel.
- Optional WhatsApp business link and floating WhatsApp action.
- Contact/consultation form.
- Duplicate-email prevention for new leads.

### Admin dashboard

The admin dashboard is available at `/admin` after authentication.

It includes:

- Site content editing.
- Portfolio management.
- Optional portfolio thumbnail/cover upload.
- Image, video, and external project URL fields.
- Portfolio categories and publishing controls.
- Testimonial management.
- Lead/client management and status tracking.
- Payment-request management.
- Contract and payment message templates.
- Integration settings for brand information, domain, email, WhatsApp, and social links.
- DNS record notes and Apple Pay association text.
- Moyasar and Resend configuration fields for future live integrations.
- GitHub Pages username field and DNS helper information.

### Payment-request workflow

- Admins can create a customer-specific payment request.
- Each request receives a public token and a customer-facing `/pay/:token` page.
- The page shows the project, service, amount, and available payment methods UI.
- The current payment flow is a simulation until a live Moyasar integration is configured.
- After a successful simulated payment, an animated receipt appears as if it is being printed.
- The receipt supports saving/printing and sharing actions.

### Authentication and permissions

- Manus OAuth is currently wired into the project.
- Public pages are intended to be accessible without login.
- Admin procedures are protected by role checks.
- The approved administrator email is `ballsmar@gmail.com`.
- The database user role supports `admin` and `user`.

## 3. Main technology stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS 4 and custom CSS animations
- **Backend:** Node.js, Express, tRPC 11
- **Database:** MySQL/TiDB with Drizzle ORM
- **Storage:** S3-compatible storage through the project storage helpers
- **Authentication:** Manus OAuth/OpenID
- **Testing:** Vitest
- **Build:** Vite for the client and esbuild for the server bundle

## 4. Important project files

```text
client/index.html                 Main HTML document and <head> metadata
client/src/App.tsx                Application routes
client/src/pages/Home.tsx         Public landing page
client/src/pages/Works.tsx        Dedicated portfolio page
client/src/pages/Admin.tsx        Admin dashboard
client/src/pages/Pay.tsx          Customer payment page
client/src/index.css              Global visual system and animations
client/public/                    Small public files and static assets
drizzle/schema.ts                 Database schema
server/db.ts                      Database helper functions
server/routers.ts                 tRPC procedures and permissions
server/storage.ts                  Storage helpers
server/_core/                     Authentication and framework runtime
shared/                            Shared constants and types
package.json                      Scripts and dependencies
vite.config.ts                    Vite configuration
```

## 5. Run the project locally

### Requirements

- Node.js 20 or newer
- pnpm 10 or compatible pnpm version
- MySQL or TiDB database for the full-stack features

### Installation

```bash
pnpm install
```

### Environment variables

Create a local `.env` file. Do not commit it to GitHub.

The project uses these server-side values:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=your-owner-open-id
BUILT_IN_FORGE_API_URL=your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

The exact values depend on your hosting provider and authentication setup. Never place secret API keys in frontend code.

### Database setup

Generate and apply the Drizzle migration:

```bash
pnpm db:push
```

### Development server

```bash
pnpm dev
```

The development server runs the full-stack application and serves the Vite client through the Node/Express runtime.

## 6. Quality checks

Run TypeScript validation:

```bash
pnpm check
```

Run the automated tests:

```bash
pnpm test
```

Create a production build:

```bash
pnpm build
```

Run the production bundle:

```bash
pnpm start
```

## 7. Deploying outside Manus

This is a full-stack application, so GitHub Pages alone is not enough. GitHub Pages can host only the static frontend and cannot securely run the Node.js server, database access, authentication, tRPC procedures, or payment integrations.

Recommended deployment options:

1. Push the repository to GitHub.
2. Deploy the Node.js application to a full-stack host such as Render, Railway, Fly.io, a VPS, or another Node-compatible platform.
3. Provision a MySQL/TiDB database.
4. Configure all environment variables in the host dashboard.
5. Run `pnpm install`, `pnpm db:push`, and `pnpm build` during deployment.
6. Start the application with `pnpm start`.
7. Point `safarstudio.sa` to the hosting provider using the DNS records they provide.
8. Enable HTTPS before using payment or email integrations.

## 8. Domain and DNS

The registered domain is:

```text
safarstudio.sa
```

DNS records must be added at the provider that controls the authoritative nameservers. If the nameservers point to Souq T2, manage the records in Souq T2. If they point to Cloudflare or another provider, add the records there instead.

For domain verification, use the exact record supplied by the business-verification platform. The previous text-file method was removed. The current website build contains this HTML meta tag in `client/index.html`:

```html
<meta name="domain-verification" content="bd4d259ca7e05e7b2bb25455fe98824ac34354eda4e4bf3b6518bc8ad2be3537">
```

## 9. Live email and payments still requiring provider credentials

The project contains settings fields and workflow placeholders, but live provider activation requires real credentials:

- **Resend:** API key, verified sending domain, and sender email.
- **Moyasar:** publishable key, secret key, webhook configuration, and live/test mode selection.
- **Apple Pay:** domain association file and provider-side domain verification.
- **Mada:** enabled through the selected Moyasar payment configuration.

Do not commit these credentials to the repository. Store them as encrypted environment variables or protected server-side settings.

## 10. Current limitations and recommended next work

- The payment flow is still simulated until Moyasar is connected and tested in sandbox mode.
- Email delivery is not fully live until Resend is configured and the sending domain is verified.
- A production deployment outside Manus needs a persistent database and object storage configuration.
- Before accepting real payments, add server-side webhook verification and make payment requests strictly single-use.
- Before launch, test the site on real iOS and Android devices, verify Arabic/English layouts, and configure backups.

## 11. Suggested launch checklist

- [ ] Choose a full-stack hosting provider.
- [ ] Push the source code to a private GitHub repository.
- [ ] Create the production MySQL/TiDB database.
- [ ] Configure all environment variables securely.
- [ ] Deploy the Node.js application.
- [ ] Connect `safarstudio.sa` and enable HTTPS.
- [ ] Verify the business-platform meta tag.
- [ ] Configure Resend and verify the sender domain.
- [ ] Configure Moyasar test mode and test Apple Pay/Mada.
- [ ] Add the production webhook endpoint.
- [ ] Promote the owner account to admin.
- [ ] Run `pnpm check`, `pnpm test`, and `pnpm build` before launch.
- [ ] Switch payment mode to live only after successful sandbox tests.
