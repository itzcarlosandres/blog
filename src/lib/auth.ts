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
          const user = await db.collection('users').findOne({
            email: validated.email
          })

          if (!user || !user.hashedPassword) {
            console.log("Login Error: Usuario no encontrado o sin contraseña");
            return null
          }

          const isValid = await bcrypt.compare(
            validated.password,
            user.hashedPassword
          )

          if (!isValid) {
            console.log("Login Error: Contraseña incorrecta para", validated.email);
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("Login System Error:", error);
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "EDITOR" | "AUTHOR"
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
