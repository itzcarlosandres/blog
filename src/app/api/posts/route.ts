import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const db = await connectToDatabase()
    const query: any = {}

    if (published !== null) {
      query.published = published === "true"
    }

    if (category) {
      const cat = await db.collection('categories').findOne({ slug: category })
      if (cat) {
        query.categoryId = cat._id.toString()
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ]
    }

    const posts = await db.collection('posts')
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .toArray()

    // Map to keep compatibility with existing frontend expectations
    const mappedPosts = posts.map(p => ({
      ...p,
      id: p._id.toString(),
      author: { name: "Admin" }, // Placeholder for now
    }))

    return NextResponse.json(mappedPosts)
  } catch (error) {
    console.error("GET Posts Error:", error)
    return NextResponse.json({ error: "Error fetching posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = postSchema.parse(body)
    const db = await connectToDatabase()

    const newPost = {
      ...validated,
      authorId: session.user.id,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : (validated.published ? new Date() : null),
    }

    const result = await db.collection('posts').insertOne(newPost)

    return NextResponse.json({ ...newPost, id: result.insertedId.toString() }, { status: 201 })
  } catch (error) {
    console.error("POST Post Error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating post" }, { status: 500 })
  }
}
