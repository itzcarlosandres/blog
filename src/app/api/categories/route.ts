import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { slugify } from "@/lib/utils"

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = categorySchema.parse(body)
    const db = await connectToDatabase()

    const newCategory = {
      ...validated,
      slug: slugify(validated.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('categories').insertOne(newCategory)

    return NextResponse.json({ ...newCategory, id: result.insertedId.toString() }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating category" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray()
    const posts = await db.collection('posts').find({}).toArray()

    const mappedCategories = categories.map(cat => ({
      ...cat,
      id: cat._id.toString(),
      _count: {
        posts: posts.filter(p => p.categoryId === cat._id.toString()).length
      }
    }))

    return NextResponse.json(mappedCategories)
  } catch (error) {
    console.error("GET Categories Error:", error)
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}
