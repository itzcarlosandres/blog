import { getPosts } from "@/lib/db"

export async function GET() {
    const posts = await getPosts()
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const publishedPosts = posts.filter(p => p.published).sort((a, b) =>
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    )

    const itemsXml = publishedPosts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ""}]]></description>
    </item>
  `).join("")

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Blog Premium</title>
  <link>${baseUrl}</link>
  <description>Las últimas noticias del blog</description>
  <language>es</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
  ${itemsXml}
</channel>
</rss>`

    return new Response(rssXml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "s-maxage=3600, stale-while-revalidate",
        },
    })
}
