import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const db = await connectToDatabase()
        const settings = await db.collection('settings').findOne({ id: 'site_settings' })

        if (!settings) {
            // Return default settings
            return NextResponse.json({
                siteName: "Mi Blog",
                siteDesc: "Una plataforma de contenidos de alta calidad.",
                logoText: "BLOG PRO",
                logoIcon: "Zap",
                contactEmail: "admin@blog.com"
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("GET Settings Error:", error)
        return NextResponse.json({ error: "Error fetching settings" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const db = await connectToDatabase()

        const updatedSettings = {
            ...body,
            id: 'site_settings',
            updatedAt: new Date()
        }

        delete updatedSettings._id // Ensure we don't try to update the immutable _id

        await db.collection('settings').updateOne(
            { id: 'site_settings' },
            { $set: updatedSettings },
            { upsert: true }
        )

        return NextResponse.json(updatedSettings)
    } catch (error) {
        console.error("POST Settings Error:", error)
        return NextResponse.json({ error: "Error saving settings" }, { status: 500 })
    }
}
