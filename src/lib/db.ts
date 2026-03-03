import { connectToDatabase } from '@/lib/mongodb'

export interface User {
  _id?: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  hashedPassword?: string
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR'
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  _id?: string
  name: string
  slug: string
  description?: string
  createdAt: Date
}

export interface Tag {
  _id?: string
  name: string
  slug: string
  createdAt: Date
}

export interface Post {
  _id?: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  publishedAt?: Date
  views: number
  seoTitle?: string
  seoDesc?: string
  authorId: string
  categoryId?: string
  tagIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: string
  content: string
  author: string
  email?: string
  approved: boolean
  postId: string
  userId?: string
  createdAt: Date
}

export async function getUsers() {
  const db = await connectToDatabase()
  if (!db) return []
  return db.collection<User>('users').find({}).toArray()
}

export async function getPosts() {
  const db = await connectToDatabase()
  if (!db) return []
  return db.collection<Post>('posts').find({}).toArray()
}

export async function getCategories() {
  const db = await connectToDatabase()
  if (!db) return []
  return db.collection<Category>('categories').find({}).toArray()
}

export async function getComments() {
  const db = await connectToDatabase()
  if (!db) return []
  return db.collection<Comment>('comments').find({}).toArray()
}
