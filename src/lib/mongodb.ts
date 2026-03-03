import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog'

let client: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb

  // BLINDAJE PARA EL BUILD: Si estamos construyendo la app, NO conectamos a la DB real.
  // Esto evita el exit code 1 en Easypanel.
  if (
    process.env.IS_BUILD_PHASE === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL // Caso de seguridad extra
  ) {
    console.log("Modo Build detectado: Usando Mock de base de datos");
    return {
      isMock: true,
      collection: () => ({
        find: () => ({
          toArray: () => Promise.resolve([]), sort: () => ({
            toArray: () => Promise.resolve([]),
            limit: () => ({ toArray: () => Promise.resolve([]) })
          }), limit: () => ({ toArray: () => Promise.resolve([]) })
        }),
        findOne: () => Promise.resolve(null),
        updateOne: () => Promise.resolve({}),
        insertOne: () => Promise.resolve({ insertedId: 'temp' }),
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
