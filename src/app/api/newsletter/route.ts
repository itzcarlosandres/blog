import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { z } from "zod"

const subscriberSchema = z.object({
    email: z.string().email("Email inválido"),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = subscriberSchema.parse(body)

        const db = await connectToDatabase()

        // Check if already exists
        const existing = await db.collection("subscribers").findOne({ email })
        if (existing) {
            return NextResponse.json({ message: "Ya estás suscrito" }, { status: 200 })
        }

        await db.collection("subscribers").insertOne({
            email,
            subscribedAt: new Date(),
            active: true
        })

        return NextResponse.json({ success: true, message: "¡Gracias por suscribirte!" }, { status: 201 })
    } catch (error) {
        console.error("Newsletter Error:", error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }
        return NextResponse.json({ error: "Ocurrió un error al procesar tu solicitud" }, { status: 500 })
    }
}
