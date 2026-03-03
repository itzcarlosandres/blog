import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog'
// Función segura para obtener el nombre de la base de datos
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

export async function connectToDatabase() {
  if (cachedDb) return cachedDb

  if (!client) {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    })
  }

  try {
    // Si estamos en el BUILD de Next.js, evitamos bloquear el proceso
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log("Build phase detected: Skipping real DB connection")
      return null as any
    }

    await client.connect()
    const db = client.db(dbName)
    cachedDb = db
    return db
  } catch (error) {
    // En el build, no queremos que un error de conexión detenga todo
    console.error("MongoDB connection error:", error)
    if (process.env.NODE_ENV === 'production') {
      return null as any // Retornamos null en lugar de romper el build
    }
    throw error
  }
}

export default client
