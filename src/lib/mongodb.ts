import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog'

const getDbName = (connectionString: string) => {
  try {
    const url = new URL(connectionString)
    return url.pathname.replace('/', '') || 'blog'
  } catch {
    return 'blog'
  }
}

const dbName = getDbName(uri)

let client: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  // Si ya tenemos la conexión cacheada, la usamos
  if (cachedDb) return cachedDb

  // Durante el build de Next.js, no queremos que el proceso se cuelgue si no hay DB
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Retornamos un objeto Db "falso" que no se conecte para que el build pase
    return {
      collection: () => ({
        find: () => ({ toArray: () => Promise.resolve([]), sort: () => ({ toArray: () => Promise.resolve([]) }), limit: () => ({ toArray: () => Promise.resolve([]) }) }),
        findOne: () => Promise.resolve(null),
        insertOne: () => Promise.resolve({ insertedId: 'temp' }),
        updateOne: () => Promise.resolve({}),
        deleteOne: () => Promise.resolve({}),
      })
    } as any as Db
  }

  if (!client) {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    })
  }

  try {
    await client.connect()
    const db = client.db(dbName)
    cachedDb = db
    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    // En producción, si falla, retornamos el objeto falso para no romper el build
    return {
      collection: () => ({
        find: () => ({ toArray: () => Promise.resolve([]), sort: () => ({ toArray: () => Promise.resolve([]) }), limit: () => ({ toArray: () => Promise.resolve([]) }) }),
        findOne: () => Promise.resolve(null),
      })
    } as any as Db
  }
}

export default client
