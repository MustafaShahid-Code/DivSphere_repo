import type { APIRoute } from "astro";
import { site } from "../config/site";

/**
 * Generated at build time so the sitemap URL always matches the real
 * domain — no risk of a stale hard-coded host in a static file.
 */
export const GET: APIRoute = () => {
  const body = `# ${site.name} — robots.txt

User-agent: *
Allow: /

# The CMS admin panel holds no public content.
Disallow: /admin/

# Common tracking parameters — prevents duplicate-content crawling
# of the same page across ad campaigns.
Disallow: /*?*utm_
Disallow: /*?*gclid=
Disallow: /*?*fbclid=

Sitemap: ${site.url}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
