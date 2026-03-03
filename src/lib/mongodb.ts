import { MongoClient, Db } from 'mongodb'

const rawUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog'
const uri = rawUri.includes('prisma+postgres')
  ? 'mongodb://localhost:27017/blog'
  : rawUri

let client: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedDb) return cachedDb

  if (!client) {
    client = new MongoClient(uri)
  }

  await client.connect()
  const dbName = uri.includes('mongodb://') ? (uri.split('/').pop()?.split('?')[0] || 'blog') : 'blog'
  const db = client.db(dbName)

  cachedDb = db
  return db
}

export default client
