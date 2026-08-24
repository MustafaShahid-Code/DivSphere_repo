import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content collections. Each schema is enforced at build time — if the
 * CMS (or a hand-edited file) produces content missing a required field,
 * the build fails loudly rather than shipping a broken page.
 *
 * The `order` field controls display order within a collection.
 */

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    cluster: z.enum(["build", "run", "learn", "transform", "shape", "protect", "sustain"]),
    description: z.string(),
    /** Optional SEO overrides for the individual service detail page. */
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    sector: z.string(),
    category: z.string(),
    /** Short summary shown on cards and used as the meta description. */
    description: z.string(),
    /** Headline result, shown on the card. */
    metric: z.string(),
    /** Optional SEO overrides for the detail page. */
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    /** Engagement facts shown in the detail page sidebar. */
    client: z.string().optional(),
    duration: z.string().optional(),
    /** Services delivered — links back to the Services page. */
    servicesUsed: z.array(z.string()).default([]),
    /** Up to four measurable outcomes shown as a results grid. */
    results: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    publishDate: z.coerce.date().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    excerpt: z.string(),
    /** Drives <time> elements, sitemap lastmod, and BlogPosting schema. */
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("DivSphere"),
    readTime: z.string(),
    /** Optional SEO override — falls back to `excerpt`. */
    seoDescription: z.string().optional(),
    /** Optional shorter title for search results (keep under ~50 chars). */
    seoTitle: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/testimonials" }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const careers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/careers" }),
  schema: z.object({
    title: z.string(),
    department: z.string(),
    employmentType: z.string(),
    location: z.string(),
    /**
     * Optional real posting date for JobPosting schema. Falls back to
     * build time when not set — see the datePosted comment in
     * careers/[...slug].astro for why setting this matters.
     */
    datePosted: z.coerce.date().optional(),
    /** Optional SEO overrides for the individual role detail page. */
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, caseStudies, blog, testimonials, careers };
