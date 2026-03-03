import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1),
  author: z.string().min(1),
  email: z.string().email().optional(),
  postId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = commentSchema.parse(body)
    const db = await connectToDatabase()

    const newComment = {
      ...validated,
      approved: false, // Comments require approval
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('comments').insertOne(newComment)

    return NextResponse.json({ ...newComment, id: result.insertedId.toString() }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating comment" }, { status: 500 })
  }
}
