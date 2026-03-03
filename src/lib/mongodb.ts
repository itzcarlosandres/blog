import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog'

let client: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb

  // SI estamos en fase de construcción (Build), servimos un objeto falso
  // para que Next.js no intente conectar a una DB que no existe en el build.
  if (process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      collection: () => ({
        find: () => ({ toArray: () => Promise.resolve([]), sort: () => ({ toArray: () => Promise.resolve([]) }), limit: () => ({ toArray: () => Promise.resolve([]) }) }),
        findOne: () => Promise.resolve(null),
        insertOne: () => Promise.resolve({ insertedId: 'temp' }),
        updateOne: () => Promise.resolve({}),
        deleteOne: () => Promise.resolve({}),
        countDocuments: () => Promise.resolve(0),
      })
    } as any as Db
  }

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
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export default client
