import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validated = credentialsSchema.parse(credentials)

          const db = await connectToDatabase()
          if (!db || (db as any).isMock) {
            console.error("CRÍTICO: El sistema está usando una base de datos MOCK. Revisa DATABASE_URL.");
            return null
          }

          const user = await db.collection('users').findOne({
            email: validated.email.toLowerCase().trim()
          })

          if (!user) {
            console.log("LOGIN FALLIDO: No existe el usuario ->", validated.email);
            return null
          }

          if (!user.hashedPassword) {
            console.log("LOGIN FALLIDO: El usuario no tiene contraseña definida");
            return null
          }

          const isValid = await bcrypt.compare(
            validated.password,
            user.hashedPassword
          )

          if (!isValid) {
            console.log("LOGIN FALLIDO: Contraseña incorrecta para", validated.email);
            return null
          }

          console.log("LOGIN EXITOSO: Bienvenido", user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error: any) {
          console.error("ERROR SISTEMA LOGIN:", error.message);
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
          (session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
