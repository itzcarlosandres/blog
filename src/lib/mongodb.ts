import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog'

let client: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb

  // Solo devolvemos el Mock si estamos estrictamente en fase de build
  // y NO tenemos una URL de base de datos válida.
  if (process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL) {
    return {
      isMock: true,
      collection: () => ({
        find: () => ({ toArray: () => Promise.resolve([]), sort: () => ({ toArray: () => Promise.resolve([]) }), limit: () => ({ toArray: () => Promise.resolve([]) }) }),
        findOne: () => Promise.resolve(null),
        updateOne: () => Promise.resolve({}),
        insertOne: () => Promise.resolve({ insertedId: 'temp' }),
      })
    } as any as Db
  }

  if (!client) {
    client = new MongoClient(uri)
  }

  try {
    await client.connect()

    // Extraer nombre de DB de la cadena o usar 'blog'
    let dbName = 'blog'
    try {
      const url = new URL(uri)
      dbName = url.pathname.replace('/', '') || 'blog'
    } catch (e) { }

    const db = client.db(dbName)
    cachedDb = db
    return db
  } catch (error) {
    console.error("Fallo real de conexión a MongoDB:", error)
    throw error
  }
}

export default client
