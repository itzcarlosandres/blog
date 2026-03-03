import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog'
const dbName = uri.split('/').pop()?.split('?')[0] || 'blog'

let client: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedDb) return cachedDb

  if (!client) {
    client = new MongoClient(uri)
  }

  await client.connect()
  const db = client.db(dbName)
  cachedDb = db
  return db
}

export default client
