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
            return null
          }

          const isValid = await bcrypt.compare(
            validated.password,
            user.hashedPassword
          )

          if (!isValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
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
