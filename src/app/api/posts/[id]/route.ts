import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ObjectId } from "mongodb"

const postUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await connectToDatabase()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(params.id) })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ ...post, id: post._id.toString() })
  } catch (error) {
    console.error("GET Post Error:", error)
    return NextResponse.json({ error: "Error fetching post" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = postUpdateSchema.parse(body)
    const db = await connectToDatabase()

    const existingPost = await db.collection('posts').findOne({ _id: new ObjectId(params.id) })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const updateData: any = {
      ...validated,
      updatedAt: new Date(),
    }

    if (validated.publishedAt !== undefined) {
      updateData.publishedAt = validated.publishedAt ? new Date(validated.publishedAt) : null
    } else if (validated.published === true && !existingPost.publishedAt) {
      updateData.publishedAt = new Date()
    }

    await db.collection('posts').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    return NextResponse.json({ ...existingPost, ...updateData, id: params.id })
  } catch (error) {
    console.error("PUT Post Error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error updating post" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await connectToDatabase()
    await db.collection('posts').deleteOne({ _id: new ObjectId(params.id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE Post Error:", error)
    return NextResponse.json({ error: "Error deleting post" }, { status: 500 })
  }
}
