import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { redirect } from "next/navigation"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await connectToDatabase()
    await db.collection('comments').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { approved: true, updatedAt: new Date() } }
    )

    // Si viene de un formulario, redirigimos
    if (request.headers.get("accept")?.includes("text/html")) {
      return redirect("/admin/comments")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("APPROVE Comment Error:", error)
    return NextResponse.json({ error: "Error approving comment" }, { status: 500 })
  }
}
