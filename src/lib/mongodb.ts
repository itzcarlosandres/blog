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

  try {
    await client.connect()
    const dbName = uri.includes('mongodb://') ? (uri.split('/').pop()?.split('?')[0] || 'blog') : 'blog'
    const db = client.db(dbName)
    cachedDb = db
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Exportamos una función en lugar de una promesa inmediata para evitar conexiones durante el build
export async function getMongoClientPromise() {
  if (!client) {
    client = new MongoClient(uri)
  }
  return client.connect()
}

export default client
