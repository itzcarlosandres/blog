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
    await db.collection('users').deleteOne({ _id: new ObjectId(params.id) })

    // Si viene de un formulario, redirigimos
    if (request.headers.get("accept")?.includes("text/html")) {
      return redirect("/admin/users")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE User Error:", error)
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return POST(request, { params })
}
