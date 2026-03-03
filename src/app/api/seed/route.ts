import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const db = await connectToDatabase()

        // 1. Crear usuario Admin
        const hashedPassword = await bcrypt.hash("admin123", 10)
        await db.collection('users').updateOne(
            { email: "admin@example.com" },
            {
                $set: {
                    name: "Administrador",
                    email: "admin@example.com",
                    hashedPassword,
                    role: "ADMIN",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            },
            { upsert: true }
        )

        // 2. Crear categoría
        await db.collection('categories').updateOne(
            { slug: "tecnologia" },
            {
                $set: {
                    name: "Tecnología",
                    slug: "tecnologia",
                    description: "Artículos sobre tecnología y desarrollo",
                    createdAt: new Date(),
                }
            },
            { upsert: true }
        )
        const category = await db.collection('categories').findOne({ slug: "tecnologia" })

        // 3. Crear Post de ejemplo
        await db.collection('posts').updateOne(
            { slug: "bienvenida-al-blog" },
            {
                $set: {
                    title: "Bienvenida a nuestro Blog Premium",
                    slug: "bienvenida-al-blog",
                    content: "<p>¡Hola! Este es nuestro primer artículo en el nuevo Blog Premium impulsado por MongoDB y Next.js.</p>",
                    excerpt: "Un saludo inicial de bienvenida a nuestra plataforma.",
                    published: true,
                    publishedAt: new Date(),
                    views: 0,
                    categoryId: category?._id.toString(),
                    authorId: "temp",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            },
            { upsert: true }
        )

        return NextResponse.json({ message: "Base de datos poblada exitosamente" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
