import { MetadataRoute } from 'next'
import { getPosts, getCategories } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Fetch data
    const posts = await getPosts()
    const categories = await getCategories()

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }))

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${baseUrl}/categoria/${cat.slug}`,
        changeFrequency: 'monthly',
        priority: 0.6,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...postEntries,
        ...categoryEntries,
    ]
}
