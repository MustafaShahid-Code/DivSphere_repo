# DivSphere — Production Website

Astro static site with a Git-based CMS, built for search visibility and paid-campaign tracking.

Every page is pre-rendered to HTML at build time. A crawler that never runs JavaScript still receives the full content of every page — which is the core difference from the earlier single-page preview.

---

## Requirements

**Node.js 22.12.0 or newer.** Check yours:

```bash
node -v
```

If it prints anything lower, upgrade before continuing — Astro 7 will refuse
to start otherwise. Node 22 is the current LTS release.

| How you manage Node | Command |
|---|---|
| **nvm** (most common) | `nvm install 22` then `nvm use 22` |
| **fnm** | `fnm install 22 && fnm use 22` |
| **Volta** | `volta install node@22` |
| **Homebrew** (macOS) | `brew install node@22` then `brew link --overwrite node@22` |
| **Windows / no manager** | Download the LTS installer from [nodejs.org](https://nodejs.org) |

There's an `.nvmrc` in the project, so with nvm or fnm you can just run `nvm use`
in this folder and it picks the right version.

---

## Running it locally — no accounts, no Git, no internet needed

```bash
npm install
npm start
```

That's it. Two things start together:

| | |
|---|---|
| **Website** | http://localhost:4321 |
| **CMS** | http://localhost:4321/admin |

You'll land on a **DivSphere-branded sign-in screen** first. Locally, the
default credentials are:

| | |
|---|---|
| **Username** | `admin` |
| **Password** | `changeme` |

**Change these** — set `ADMIN_USER` and `ADMIN_PASSWORD` in `.env`. After
signing in you'll see one more, smaller **Login** button — that one's from
Decap CMS itself, confirming it's talking to the local file-system backend.
Click it and you're in.

Be clear-eyed about what this login is and isn't. It's checked with a
SHA-256 hash in the browser (the plaintext password never leaves `.env`),
which stops a casual "someone else opens `/admin` on my laptop" scenario —
but it isn't server-verified, so it isn't real security, and it only exists
locally: `import.meta.env.DEV` gates it off entirely in the production
build. Once you're live, GitHub login (set up in "Going live" below)
replaces it with real, invite-only, server-checked authentication — only
people with write access to the GitHub repo can sign in. The `Log out`
button in the bottom-right corner clears your local session.

The CMS editor is bundled into the project rather than loaded from a CDN, so
all of this works with no internet connection at all. It's also been
restyled to match the site's dark theme end to end — sign-in screen,
collections list, and entry editor all follow the accent colour set in
**Site Settings → Theme**.

### Other commands

```bash
npm run dev      # website only, no CMS
npm run cms      # CMS backend only
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run check    # type-check the project
```

### What the CMS controls

**Site Settings**
- **Brand** — logo mark and favicon
- **Contact Details** — primary/secondary phone numbers and the WhatsApp number, used sitewide (header, footer, Contact page, floating WhatsApp button)
- **Theme** — five accent palettes (this sets the brand color; light/dark mode is a separate, visitor-controlled toggle — see "Light/dark theme" below)
- **Homepage** — hero copy, stat readout, every section heading, show/hide each section, process steps, industries, closing CTA
- **About Page** — hero, values, milestones, practice areas
- **Careers Page** — hero, benefits, section headings
- **Contact Page** — hero, response time, form success/error messages

**Content collections**
- **Services** — 21 entries across seven capabilities
- **Case Studies** — including the full write-up on each detail page
- **Blog Posts** — full Markdown editor
- **Testimonials**
- **Open Roles**

Everything above is editable without touching code. Phone numbers and the
WhatsApp number are also CMS-editable (Site Settings → Contact Details, see
above). What's still code-only — company name, email address, physical
address, and domain — lives in one file, `src/config/site.ts`.

---

## Light/dark theme

There's a light/dark toggle in the header (both viewport sizes) and a
matching floating button in the bottom-left corner of `/admin` — this one
is per-visitor, not a CMS setting: each person's browser remembers their
own choice (`localStorage`), and anyone who's never toggled it gets
whichever their OS is set to, dark by default if neither is known.

It's built entirely on CSS custom properties in `src/styles/global.css` —
the dark values sit on `:root`, a full light override sits on
`:root[data-theme="light"]`, and `ThemeToggle.astro` just flips that
attribute. That's also why the admin panel re-themes for free: every rule
in `src/styles/admin-theme.css` (which restyles Decap's editor UI) already
reads from these same variables, so the one toggle covers both surfaces
with no CMS-specific styling code.

Two things worth knowing if you touch the color system later:
- The five accent palettes (Site Settings → Theme) apply on top of
  whichever mode is active — they're independent axes. A palette's raw
  accent color is used for buttons and borders in both modes, but body
  text/links use a separate `--accent-text` (and `--good-text` /
  `--danger-text` for success/error states) that's automatically darkened
  in light mode via `color-mix()`, since the bright palette colors don't
  have enough contrast to read as text on a white background.
- Any new color in `global.css` should go through a variable rather than
  a hardcoded hex — that's what makes it theme-aware automatically.

---

## Going live — on Hostinger, no Netlify

Everything above runs offline. Going live means four things start talking to
each other: **GitHub** (stores content + triggers builds), **GitHub Actions**
(builds the site), a small **OAuth proxy** (lets the CMS log editors in with
GitHub — it replaces what Netlify Identity did for free), and **Hostinger**
(serves the built site and auto-deploys whenever the build output changes).
None of it needs a Netlify account. Do these roughly in order — later steps
depend on values you generate in earlier ones.

### 1. Push this project to GitHub

If it isn't already a Git repo:

```bash
git init
git add .
git commit -m "Initial commit"
```

This project's repo: [MustafaShahid-Code/DivSphere_repo](https://github.com/MustafaShahid-Code/DivSphere_repo)

```bash
git remote add origin https://github.com/MustafaShahid-Code/DivSphere_repo.git
git branch -M main
git push -u origin main
```

### 2. Register a GitHub OAuth App

This is what lets `/admin` say "Login with GitHub" instead of asking for a
username/password.

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
   ([direct link](https://github.com/settings/applications/new))
2. **Homepage URL**: `https://divsphere.co`
3. **Authorization callback URL**: `https://oauth.divsphere.co/callback`
   (must match the OAuth proxy's domain from step 3 below, with `/callback`
   on the end, exactly)
4. Create it, then **Generate a new client secret**. Copy the **Client ID**
   and **Client Secret** — you need both in the next step and won't be able
   to see the secret again.

### 3. Deploy the OAuth proxy to Hostinger

The `oauth-proxy/` folder in this project is a small, self-contained Node
app whose only job is that GitHub login handshake — it stores nothing and
touches no content. Full explanation of what it does and why is in the
comments at the top of `oauth-proxy/server.js`.

This needs its own subdomain (`oauth.divsphere.co`) separate from the main
site, since it's a different running application. hPanel's menu wording
shifts between accounts/plans, so if a label below doesn't match exactly,
use hPanel's search bar (top of the page) and type "subdomain" or
"Node.js" — it'll jump you to the right screen.

**a. Create the subdomain first**

1. hPanel → **Websites**, open your main site's dashboard
2. Sidebar → **Domains → Subdomains**
3. Subdomain name: `oauth` (this makes `oauth.divsphere.co`) — leave the
   directory field at its default, it won't be used
4. Click **Create**. If your domain's nameservers are already Hostinger's
   (usual when you bought the domain there too), this is all the DNS setup
   needed — allow a few minutes to propagate.

**b. Create the Node.js app**

1. hPanel → **Websites → Add Website → Node.js web app**
2. Deployment method: **Upload your files**. Locally, zip just the
   `oauth-proxy/` folder (exclude `node_modules/` — Hostinger installs
   dependencies from `package.json` itself) and upload the archive.
   (You can use GitHub import instead if you prefer, but point it at a
   *separate* repo containing only the proxy — Hostinger's Git import
   deploys a whole repo, and this one repo also contains the main website,
   which isn't a Node app.)
3. Node.js version: 22 (matches `.nvmrc` in the main project; the proxy
   itself only needs any reasonably recent Node)
4. Entry file: `server.js`
5. Environment variables — add these four:

   | Variable | Value |
   |---|---|
   | `GITHUB_CLIENT_ID` | from step 2 above |
   | `GITHUB_CLIENT_SECRET` | from step 2 above |
   | `OAUTH_SECRET` | any long random string — e.g. run `openssl rand -hex 32` locally and paste the result. This signs one-time login attempts; it isn't shared with anyone. |
   | `BASE_URL` | `https://oauth.divsphere.co` (must match step 2's callback URL, minus `/callback`) |

6. Deploy/start the app.

**c. Point the subdomain at the app**

1. From the Node.js app's dashboard (or the **Websites** list, next to it),
   click **Connect domain**.
2. Enter `oauth.divsphere.co` — since you already created it in step (a),
   this attaches it rather than creating a new one.
3. Once it shows connected, visit `https://oauth.divsphere.co/` — it
   should show *"DivSphere CMS OAuth proxy is running."* SSL installs
   automatically once the domain resolves; give it a few minutes if it
   shows a certificate warning at first.

### 4. Point the CMS at the live backend

Already done in this copy of the project — `public/admin/config.yml` has
the **LIVE** `backend:` block active, pointed at
`MustafaShahid-Code/DivSphere_repo` and `https://oauth.divsphere.co`:

```yaml
backend:
  name: github
  repo: MustafaShahid-Code/DivSphere_repo
  branch: main
  base_url: https://oauth.divsphere.co

local_backend: false
```

Uncomment `publish_mode: editorial_workflow` in that file if you'd rather
edits land as a pull request you review before they go live, instead of
committing straight to `main` (off by default).

### 5. Set your real domain and tracking IDs

In your GitHub repo: **Settings → Secrets and variables → Actions →
Variables tab**, add:

| Variable | Value |
|---|---|
| `PUBLIC_SITE_URL` | `https://divsphere.co` — canonical URLs and the sitemap are generated from this |
| `PUBLIC_GTM_ID`, `PUBLIC_GA4_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_LINKEDIN_PARTNER_ID`, `PUBLIC_GOOGLE_SITE_VERIFICATION` | none of these are set up yet — skip for now, add later once you have accounts with these tools (see "Tracking and campaigns" below) |
| `PUBLIC_HCAPTCHA_SITE_KEY` | not set up yet — skip for now, add later if the contact form starts getting spam (see "Optional: hCaptcha on the contact form" below) |

The workflow at `.github/workflows/deploy.yml` reads these on every build.

### 6. Let GitHub Actions build it

Nothing to configure here — `.github/workflows/deploy.yml` is already in
the repo. On every push to `main` (including a commit the CMS makes when
someone publishes), it builds the site and pushes the output to a branch
called `site-live`, which contains nothing but ready-to-serve files. Push
the config change from step 4/5 and check the **Actions** tab on GitHub —
you should see it run and, a couple of minutes later, a new `site-live`
branch appear.

### 7. Connect Hostinger's Git deployment to `site-live`

Hostinger's own Git deploy feature (hPanel → **Websites → your site →
Git**) auto-publishes a branch straight to `public_html`, but can't run a
build itself — which is exactly why step 6 exists: `site-live` is
pre-built, so Hostinger only has to copy files.

1. hPanel → **Git** → **Create a new repository**
2. Repository URL: your GitHub repo's URL
3. Branch: `site-live`
4. Directory: `public_html` (or a subdirectory if this site shares hosting
   with something else)
5. Save, then hit **Deploy** once to pull the first copy

From here on, every push to `site-live` (i.e. every publish from the CMS,
or every push to `main`) auto-deploys — per Hostinger's own docs, "any
updates merged into your deployment branch automatically trigger a new
deployment." Nothing to run by hand.

### 8. Point your domain at Hostinger

If the domain is already on Hostinger (DNS *and* hosting both there),
this is usually already done. If the domain's DNS lives elsewhere, point
its A record at Hostinger's hosting IP (hPanel shows this under
**Websites → your site → Details**) and, once it resolves, issue a free SSL
certificate for it under **Websites → your site → SSL**.

### 9. Set the contact form's recipient

Already set in this copy — `public/contact-handler.php` sends enquiries to
`info@divsphere.co`. If that changes, edit the `$recipient` line near the
top of that file, commit, and push; step 6/7 handles the rest. Hostinger's
Business plan sends mail for the domain natively, so
nothing else to configure. Locally, the form simulates success and logs the
payload to the console instead of sending anything, so you can test the UI
without a live backend.

`public/newsletter-handler.php` (the footer/Resources page signup form)
follows the same pattern and the same `$recipient` default — change it
there too if the two should go to different inboxes.

### 10. Invite editors

Anyone who should be able to publish needs **write access to the GitHub
repo** (Settings → Collaborators, or add them to a team if it's an
organization) — that's what the OAuth login checks. They then log in at
`https://divsphere.co/admin` with their own GitHub account.

### After the domain is live

1. Verify it in [Google Search Console](https://search.google.com/search-console)
2. Submit `https://yourdomain.com/sitemap-index.xml`
3. Do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters)
4. Test structured data with the [Rich Results Test](https://search.google.com/test/rich-results)
5. Check Core Web Vitals on [PageSpeed Insights](https://pagespeed.web.dev/)

---

## Pre-launch checklist

| # | Task | Where |
|---|------|-------|
| 1 | Set the real domain | `PUBLIC_SITE_URL` |
| 2 | Company name, email, phone, address | `src/config/site.ts` |
| 3 | Social share image at `public/og-default.png` (1200×630) | — |
| 4 | `public/apple-touch-icon.png` (180×180) | — |
| 5 | Replace placeholder case studies with real projects | `/admin` |
| 6 | Replace the hero stats (120+, 40+, 18) with real numbers | `/admin` |
| 7 | Add tracking IDs | env vars |
| 8 | Swap the CMS to the LIVE backend (GitHub login) and deploy the OAuth proxy | `public/admin/config.yml`, `oauth-proxy/` |
| 9 | Change `ADMIN_USER` / `ADMIN_PASSWORD` from the defaults (local dev only — harmless to skip for production, since this gate doesn't run there) | `.env` |
| 10 | Confirm the newsletter recipient address | `public/newsletter-handler.php` |

## Renaming the company

The name isn't final, so nothing hard-codes it. Change these and rebuild:

- `src/config/site.ts` → `name`, `url`, `contact`, `address`
- `public/admin/config.yml` → `site_url`, `display_url`
- The wordmark text in `src/components/Nav.astro` and `Footer.astro` (it's
  split into two `<span>`s for the two-tone colour — currently `Div` / `Sphere`)

The **logo and favicon are not part of this list** — they're CMS-editable.
See the next section.

## Logo and favicon

Both live in **Site Settings → Brand** in the CMS (`/admin`), not in code —
upload a replacement there and rebuild; no developer needed.

| Field | Used for | What works best |
|---|---|---|
| **Logo mark** | Header and footer, next to the company name | Square PNG, **transparent background** — it sits directly on the dark nav/footer, so a white or colour-filled background shows up as a visible box |
| **Favicon** | Browser tab icon | Square PNG, solid background recommended — browser tabs can be light or dark, and a solid backing keeps it visible in both |

Under the hood these are just two image fields in `src/data/brand.json`,
uploaded files land in `public/uploads/brand/`, and `src/components/Nav.astro`,
`Footer.astro`, `src/components/SEO.astro`, and `src/pages/admin/index.astro`
all read from that file — so a single upload updates the logo and favicon
everywhere at once. The starting versions came from the brand assets you
provided when this was set up.

`public/apple-touch-icon.png` (the iOS home-screen icon, 180×180) is
separate — it's a static file, not CMS-editable, since iOS ignores
transparency and expects one fixed size. Replace it by hand if the brand
changes again.

---

## Phone numbers and WhatsApp

All in **Site Settings → Contact Details** in the CMS — primary phone,
an optional secondary phone, and the WhatsApp number. Change any of these
and rebuild; no developer needed.

- The **primary** and **secondary** phone fields each have a "displayed"
  version (shown as typed, e.g. `+92 333 1282959`) and a "link format"
  version (`tel:` links need digits-only with a leading `+`, no spaces —
  e.g. `+923331282959`). Leave the secondary pair blank to hide the second
  number everywhere.
- The **WhatsApp** field is digits-only with the country code and **no**
  leading `+` (e.g. `923331282959`) — that's the format `wa.me` links
  require. The code strips any stray `+`/spaces/dashes defensively, so a
  differently-formatted entry still works, but entering it correctly avoids
  relying on that.

These feed three places at once: the header/footer/Contact page numbers,
the Contact page's structured data (`SEO.astro`), and a floating "Chat on
WhatsApp" button shown on every public page
(`src/components/WhatsAppButton.astro`, mounted in `BaseLayout.astro`) —
it opens `wa.me` with a pre-filled greeting message in a new tab. The
button hides itself automatically if the WhatsApp field is ever left
blank, rather than linking nowhere.

---

## Tracking and campaigns

All four tags are wired and gated behind **Google Consent Mode v2**. Set the IDs you have; leave the rest blank.

| Variable | Tool | Format |
|---|---|---|
| `PUBLIC_GTM_ID` | Google Tag Manager | `GTM-XXXXXXX` |
| `PUBLIC_GA4_ID` | Google Analytics 4 | `G-XXXXXXXXXX` |
| `PUBLIC_META_PIXEL_ID` | Meta Pixel | numeric |
| `PUBLIC_LINKEDIN_PARTNER_ID` | LinkedIn Insight | numeric |

Nothing loads in development, so local traffic never pollutes your reporting.

### Why Consent Mode v2 is here

Google requires it for ads served to EEA and UK users. Without it, conversions from those regions are discarded and remarketing audiences stop building. Tags load in a *denied* state and only start collecting identifiers after the visitor accepts.

If you only ever advertise inside Pakistan and South Asia this is not strictly required — but it costs nothing and means you're covered the moment you run a campaign into Europe.

### Conversion tracking

The contact form pushes a `generate_lead` event into `dataLayer` on submit. Build your GTM conversion trigger on that event and it will feed GA4, Google Ads, Meta, and LinkedIn from one place. The consent choice itself is pushed as `consent_choice`, and the newsletter form pushes `newsletter_signup`, so you can trigger on those too.

---

## Optional: hCaptcha on the contact form

The contact form ships with a honeypot field only, which stops most basic
bots. If you start seeing real spam through it, add hCaptcha — it's a
two-part switch, and until both parts are set the form works exactly as it
does today (nothing breaks, nothing changes):

1. Create a free account at [hcaptcha.com](https://www.hcaptcha.com) and
   register the site to get a **site key** and a **secret key**.
2. Add `PUBLIC_HCAPTCHA_SITE_KEY` as a build-time environment variable (same
   place as `PUBLIC_SITE_URL` in step 5 of "Going live" above). This makes
   the widget render on the contact form — nothing else changes yet.
3. Open `public/contact-handler.php` and paste the **secret key** into
   `$hcaptchaSecret` near the top of the file. This is what actually
   verifies a solved captcha server-side; the site key alone only draws
   the widget.

Both steps are required — the site key without the secret renders a widget
that's never checked; the secret without the site key has nothing to
verify. Leave both blank (the default) to keep honeypot-only protection.

---

## SEO — what's already handled

- **Static pre-rendering.** Full HTML in the first response, no JS required.
- **Real URLs.** `/services`, `/blog/post-name` — each independently indexable.
- **Unique title + meta description on every page**, all within Google's display limits.
- **Canonical URLs** on every page.
- **Open Graph + Twitter cards** for link previews.
- **Structured data (JSON-LD):** `ProfessionalService`, `WebSite`, `BreadcrumbList` sitewide; `BlogPosting` on articles; `JobPosting` on careers (eligible for Google Jobs); `ItemList` of services; `ContactPage`.
- **Auto-generated `sitemap.xml`**, regenerated on every build.
- **`robots.txt`** pointing at the sitemap and blocking `/admin` plus tracking-parameter URLs.
- **Self-hosted fonts** — no third-party connection on the critical path, which helps Largest Contentful Paint.
- **One `<h1>` per page**, semantic heading order.
- **Visible breadcrumbs** matching the structured data.
- **404 page** marked `noindex`.
- **Skip-to-content link** and keyboard-accessible navigation.

### What still needs you

SEO infrastructure gets you indexed. It doesn't get you ranked — that comes from content and links:

1. **Replace the placeholder case studies and stats** with real projects and real numbers.
2. **Create a Google Business Profile** for the Karachi office. For local searches like "software company Karachi", this often matters more than anything on the website.
3. **Earn links.** Directory listings, partner sites, professional bodies, local press.

Already done: every service and every open role now has its own indexable
page (`/services/service-name`, `/careers/role-name`), and the six blog
posts have real ~1,000–1,600 word bodies rather than placeholders.

### After launch

1. Verify the domain in [Google Search Console](https://search.google.com/search-console).
2. Submit `https://yourdomain.com/sitemap-index.xml`.
3. Do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters) — it also feeds several AI search products.
4. Test structured data with the [Rich Results Test](https://search.google.com/test/rich-results).
5. Check Core Web Vitals with [PageSpeed Insights](https://pagespeed.web.dev/).

---

## Project structure

```
src/
├── config/site.ts          ← brand, contact, tracking IDs, nav order
├── content.config.ts       ← content schemas (build fails if content breaks them)
├── content/                ← the CMS writes here
│   ├── services/           (21 files)
│   ├── case-studies/       (6)
│   ├── blog/               (6)
│   ├── testimonials/       (4)
│   └── careers/            (6)
├── components/
│   ├── SEO.astro           ← all meta tags + JSON-LD
│   ├── Nav.astro           ← Home / About ▾ / Services / Contact
│   ├── Footer.astro        ← includes the newsletter signup band
│   ├── Breadcrumbs.astro
│   ├── ThemeToggle.astro   ← light/dark switch (nav + admin, see "Light/dark theme")
│   ├── NewsletterSignup.astro ← reusable email-capture form
│   ├── WhatsAppButton.astro
│   ├── Analytics.astro     ← GTM, GA4, Meta, LinkedIn + Consent Mode
│   └── ConsentBanner.astro
├── layouts/BaseLayout.astro
├── pages/                  ← one file = one URL
│   ├── index.astro         → /
│   ├── services.astro      → /services
│   ├── services/[...slug].astro → /services/service-name
│   ├── about.astro         → /about
│   ├── case-studies.astro  → /case-studies
│   ├── case-studies/[...slug].astro → /case-studies/project-name
│   ├── careers.astro       → /careers
│   ├── careers/[...slug].astro → /careers/role-name
│   ├── resources.astro     → /resources (downloadable guides + newsletter)
│   ├── blog/index.astro    → /blog
│   ├── blog/[...slug].astro→ /blog/post-name
│   ├── rss.xml.ts          → /rss.xml
│   ├── contact.astro       → /contact
│   ├── admin/index.astro   → /admin (CMS + local login gate)
│   ├── 404.astro
│   └── robots.txt.ts       → /robots.txt
└── styles/
    ├── global.css           ← the public site
    └── admin-theme.css      ← restyles the bundled Decap CMS to match
public/
├── admin/                  ← Decap CMS
├── contact-handler.php     ← PHP mail handler, replaces Netlify Forms
├── newsletter-handler.php  ← PHP mail handler for the newsletter signup form
├── downloads/               ← lead-magnet PDFs linked from /resources
├── .htaccess               ← headers + /admin noindex, replaces netlify.toml
└── favicon.svg
oauth-proxy/                ← self-hosted GitHub OAuth proxy for CMS login
├── server.js                  (deploy this as its own Node app on Hostinger)
└── package.json
.github/
└── workflows/
    └── deploy.yml          ← builds on push, publishes dist/ to site-live
                                (Hostinger's Git deploy watches that branch)
```

### Adding a page

Create a file in `src/pages/`. That's the whole process — the route, the sitemap entry, and the nav highlighting follow automatically. Add it to `navigation` in `src/config/site.ts` if it belongs in the menu.

---

## Notes and known gaps

- **Case studies are illustrative.** Structure and depth are right; the
  engagements are invented. Each carries a visible note saying so. Replace
  before launch.
- **Hero stats (120+, 40+, 18) are illustrative** and should be real numbers.
- **`JobPosting` dates fall back to build time** when a role has no
  `datePosted` set in the CMS (`validThrough` = that date + 3 months).
  Google may drop stale postings, so either set a real `datePosted` per
  role (Careers collection → the role → "Date posted") or rebuild
  periodically.
- **`decap-cms-app` carries known advisories** in its transitive markdown
  dependencies (ReDoS in older `remark`/`trim` packages). These affect the
  admin bundle only — never the public site, which ships zero CMS JavaScript.
  Exploiting them requires an authenticated editor submitting crafted
  Markdown. Worth knowing; not a reason to avoid the CMS.
- **The newsletter form collects addresses but doesn't send anything.**
  `public/newsletter-handler.php` emails each signup to the same inbox as
  the contact form — enough to start collecting a list, but there's no
  actual email service behind it yet. See the upgrade-path comment at the
  top of that file when you're ready to send a real newsletter.
- **The contact form's spam protection is honeypot-only until you add
  hCaptcha.** See "Optional: hCaptcha on the contact form" below.

---

## SEO: infrastructure vs. content

The technical work is done and verified. What it gets you is **indexed** —
not **ranked**. Rankings come from:

1. **Real content.** Replace the placeholder posts and case studies.
2. **A Google Business Profile** for the Karachi office. For searches like
   "software company Karachi", this often outweighs anything on the website.
3. **Links.** Directory listings, partner sites, professional bodies, press.
4. **Per-service pages** once you know which terms convert. One page targeting
   "ERP implementation Pakistan" outranks one page listing twenty services.
