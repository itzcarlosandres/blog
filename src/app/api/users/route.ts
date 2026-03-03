import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]).default("AUTHOR"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = userSchema.parse(body)
    const db = await connectToDatabase()

    const existingUser = await db.collection('users').findOne({ email: validated.email })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    const newUser = {
      name: validated.name,
      email: validated.email,
      hashedPassword,
      role: validated.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('users').insertOne(newUser)

    return NextResponse.json({
      id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating user" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
    const posts = await db.collection('posts').find({}).toArray()

    const mappedUsers = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      _count: {
        posts: posts.filter(p => p.authorId === u._id.toString()).length
      }
    }))

    return NextResponse.json(mappedUsers)
  } catch (error) {
    console.error("GET Users Error:", error)
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
  }
}
