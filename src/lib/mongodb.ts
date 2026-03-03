import { MongoClient, Db } from 'mongodb'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const rawUri = process.env.DATABASE_URL
const uri = rawUri.includes('prisma+postgres')
  ? 'mongodb://localhost:27017/blog' // Fallback para dev local si detecta Prisma Postgres
  : rawUri

const client = new MongoClient(uri)

let cachedDb: Db

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb
  }

  await client.connect()
  const dbName = uri.includes('mongodb://') ? (uri.split('/').pop()?.split('?')[0] || 'blog') : 'blog'
  const db = client.db(dbName)

  cachedDb = db
  return db
}

export default client
