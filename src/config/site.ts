/**
 * ─────────────────────────────────────────────────────────────
 *  DEVSPHERE — CENTRAL SITE CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *  Everything brand-specific lives here. When the company name,
 *  domain, or contact details are finalised, change them ONCE in
 *  this file and the entire site updates — including every page
 *  title, meta description, canonical URL, Open Graph tag, and
 *  the structured data Google reads.
 *
 *  Tracking IDs are read from environment variables so that no
 *  analytics fire in local development. See README.md.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  /** Company name. Appears in titles, footer, and structured data. */
  name: "DivSphere",

  /** Short tagline — used as the homepage title suffix. */
  tagline: "Software & IT Services",

  /**
   * Production domain, no trailing slash.
   * Used for canonical URLs, the sitemap, and Open Graph tags.
   * MUST be the real domain before launch, or SEO tags will be wrong.
   */
  url: import.meta.env.PUBLIC_SITE_URL || "https://divsphere.co",

  /** Default meta description — used on pages that don't set their own. */
  description:
    "DivSphere designs, builds, and operates software, cloud, and data infrastructure for companies that need a technology partner who ships. Based in Doha, serving clients across the Gulf and beyond.",

  /** Default social share image, relative to /public. 1200×630 recommended. */
  ogImage: "/og-default.png",

  /** Primary language and locale. */
  lang: "en",
  locale: "en_QA",

  contact: {
    email: "info@divsphere.co",
    phone: "+974 4000 0000",
    /** E.164 format for tel: links and structured data. */
    phoneRaw: "+97440000000",
  },

  address: {
    street: "",
    city: "Doha",
    region: "",
    postalCode: "",
    country: "QA",
    countryName: "Qatar",
  },

  /** Social profiles. Empty strings are skipped in structured data. */
  social: {
    linkedin: "",
    x: "",
    facebook: "",
    instagram: "",
    github: "",
  },

  /** Regions served — feeds the `areaServed` field in structured data. */
  areaServed: ["Qatar", "Gulf Cooperation Council", "Middle East", "South Asia"],

  /**
   * ── TRACKING & CAMPAIGN IDS ──────────────────────────────
   * Set these in your hosting provider's environment variables.
   * Any left blank is simply not loaded — nothing breaks.
   * All of them are gated behind consent (see ConsentBanner).
   */
  analytics: {
    /** Google Tag Manager container, e.g. "GTM-XXXXXXX" */
    gtmId: import.meta.env.PUBLIC_GTM_ID || "",
    /** Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX" */
    ga4Id: import.meta.env.PUBLIC_GA4_ID || "",
    /** Meta (Facebook/Instagram) Pixel ID — numeric string */
    metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID || "",
    /** LinkedIn Insight Tag Partner ID — numeric string */
    linkedinPartnerId: import.meta.env.PUBLIC_LINKEDIN_PARTNER_ID || "",
    /** Google Search Console HTML-tag verification token (optional) */
    googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
} as const;

/**
 * Navigation structure — drives both the header and the footer.
 * Order here is the order shown on screen.
 */
export const navigation = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Case Studies", href: "/case-studies" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
  },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * The seven capability clusters services are grouped under.
 * `id` must match the `cluster` field in src/content/services/*.md
 */
export const clusters = [
  {
    id: "build",
    idx: "01",
    short: "Build",
    heading: "Product & Engineering",
    tag: "PRODUCT & ENGINEERING",
    description:
      "Custom software, web platforms, and mobile apps engineered for scale, plus productized software you can license or resell.",
  },
  {
    id: "run",
    idx: "02",
    short: "Run",
    heading: "Cloud & SaaS",
    tag: "CLOUD & SAAS",
    description:
      "Cloud architecture, SaaS platforms, and system integration — plus outsourced delivery teams to operate them long-term.",
  },
  {
    id: "learn",
    idx: "03",
    short: "Learn",
    heading: "Data & AI",
    tag: "DATA & AI",
    description:
      "Data pipelines, analytics, and applied machine learning that turn operational data into decisions.",
  },
  {
    id: "transform",
    idx: "04",
    short: "Transform",
    heading: "Enterprise Systems",
    tag: "ENTERPRISE SYSTEMS",
    description:
      "ERP and CRM implementation, technology strategy, and digital transformation roadmaps for established organizations.",
  },
  {
    id: "shape",
    idx: "05",
    short: "Shape",
    heading: "Design",
    tag: "DESIGN",
    description:
      "Product and interface design grounded in research — from early UX flows to full design systems.",
  },
  {
    id: "protect",
    idx: "06",
    short: "Protect",
    heading: "Quality & Security",
    tag: "QUALITY & SECURITY",
    description:
      "Independent testing and cybersecurity services that catch what internal teams don't have time to.",
  },
  {
    id: "sustain",
    idx: "07",
    short: "Sustain",
    heading: "Support & Enablement",
    tag: "SUPPORT & ENABLEMENT",
    description:
      "Technical support, staff training, and cross-border delivery for organizations exporting IT services.",
  },
] as const;

export const industries = [
  "Financial Services",
  "Healthcare",
  "Logistics",
  "Retail & E-commerce",
  "Public Sector",
  "Manufacturing",
  "Energy",
] as const;

export const processSteps = [
  { idx: "01", title: "Discover", body: "Stakeholder interviews, technical audit, and a scoped delivery plan." },
  { idx: "02", title: "Design", body: "Architecture, UX, and data models validated before a line of production code is written." },
  { idx: "03", title: "Build", body: "Iterative delivery in two-week cycles, with a working build in your hands from sprint one." },
  { idx: "04", title: "Deploy", body: "Staged rollout, load testing, and security review ahead of go-live." },
  { idx: "05", title: "Support", body: "SLA-backed monitoring, on-call support, and a roadmap for what's next." },
] as const;


/**
 * Accent palettes selectable from the CMS (Site Settings → Theme).
 * The dark "mission control" ground stays constant across all of them —
 * only the signal colour changes. Adding a palette here makes it appear
 * in the CMS dropdown automatically (also add it to the options list in
 * public/admin/config.yml).
 */
export const themes = {
  amber: {
    label: "Amber Signal",
    accent: "#ff9d4a",
    accentStrong: "#ffb066",
    accentSoft: "rgba(255,157,74,0.12)",
    accentLine: "rgba(255,157,74,0.35)",
    onAccent: "#12100c",
  },
  cyan: {
    label: "Cyan Nebula",
    accent: "#4ac9ff",
    accentStrong: "#72d6ff",
    accentSoft: "rgba(74,201,255,0.12)",
    accentLine: "rgba(74,201,255,0.35)",
    onAccent: "#06131a",
  },
  emerald: {
    label: "Emerald Terminal",
    accent: "#4ade9a",
    accentStrong: "#6fe6b0",
    accentSoft: "rgba(74,222,154,0.12)",
    accentLine: "rgba(74,222,154,0.35)",
    onAccent: "#06170f",
  },
  violet: {
    label: "Violet Pulse",
    accent: "#a78bff",
    accentStrong: "#bda6ff",
    accentSoft: "rgba(167,139,255,0.12)",
    accentLine: "rgba(167,139,255,0.35)",
    onAccent: "#100c1c",
  },
  crimson: {
    label: "Crimson Alert",
    accent: "#ff6b7a",
    accentStrong: "#ff8a96",
    accentSoft: "rgba(255,107,122,0.12)",
    accentLine: "rgba(255,107,122,0.35)",
    onAccent: "#1a0709",
  },
} as const;

export type ThemeKey = keyof typeof themes;

/** Resolves a palette key from the CMS, falling back safely. */
export function resolveTheme(key: string | undefined): (typeof themes)[ThemeKey] {
  return themes[(key as ThemeKey)] ?? themes.amber;
}

export type Cluster = (typeof clusters)[number];
