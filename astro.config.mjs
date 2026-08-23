import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

/**
 * The production domain. Read from PUBLIC_SITE_URL so it can be set
 * per-environment — set as a GitHub Actions repo Variable, which the
 * build in .github/workflows/deploy.yml reads (see README → "Going
 * live"). This value is what makes canonical URLs and sitemap.xml
 * correct — it MUST be the real domain before launch.
 */
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://divsphere.co";

export default defineConfig({
  site: SITE_URL,

  // Every page is pre-rendered to static HTML at build time.
  // This is what makes the site crawlable without JavaScript.
  output: "static",

  integrations: [
    sitemap({
      // Keep the CMS admin panel and 404 out of the sitemap.
      filter: (page) => !page.includes("/admin"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  build: {
    // Emit /services/index.html rather than /services.html so URLs
    // resolve cleanly on any static host.
    format: "directory",
    inlineStylesheets: "auto",
  },

  compressHTML: true,

  vite: {
    build: {
      cssMinify: true,
    },
  },
});
