import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { site } from "../config/site";

/**
 * Blog RSS feed at /rss.xml. Keeps the feed in sync with the CMS
 * automatically — every published (non-draft) post appears here with
 * no extra step required after publishing in Decap.
 */
export async function GET(context: APIContext) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );

  return rss({
    title: `${site.name} Insights`,
    description: "Field notes on software delivery, cloud, data, and security.",
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.seoDescription || post.data.excerpt,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}/`,
      author: post.data.author,
      categories: [post.data.category],
    })),
    customData: `<language>${site.lang}</language>`,
  });
}
