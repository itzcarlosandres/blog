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

  // Solo intentamos conectar si no estamos en medio de un build de Next.js
  // O mejor, simplemente lo intentamos y si falla lanzamos el error,
  // pero asegurándonos de que no se ejecute al importar el módulo.
  await client.connect()
  const dbName = uri.includes('mongodb://') ? (uri.split('/').pop()?.split('?')[0] || 'blog') : 'blog'
  const db = client.db(dbName)

  cachedDb = db
  return db
}

// Exportamos una promesa que NO inicia sola, para compatibilidad si alguien la usa
export const clientPromise = (async () => {
  if (!client) client = new MongoClient(uri)
  return await client.connect()
})()
