import { connectToDatabase } from "./mongodb"

export async function getSiteSettings() {
    try {
        const db = await connectToDatabase()
        const settings = await db.collection('settings').findOne({ id: 'site_settings' })

        if (!settings) {
            return {
                siteName: "Mi Blog",
                siteDesc: "Una plataforma de contenidos de alta calidad.",
                logoText: "BLOG PRO",
                logoIcon: "Zap",
                contactEmail: "admin@blog.com"
            }
        }

        return settings
    } catch (error) {
        console.error("Error fetching site settings:", error)
        return {
            siteName: "Mi Blog",
            siteDesc: "Una plataforma de contenidos de alta calidad.",
            logoText: "BLOG PRO",
            logoIcon: "Zap",
            contactEmail: "admin@blog.com"
        }
    }
}
