import { connectToDatabase } from "@/lib/mongodb"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, MessageCircle } from "lucide-react"

async function getPostsData() {
  const db = await connectToDatabase()
  const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray()
  const categories = await db.collection('categories').find({}).toArray()
  const comments = await db.collection('comments').find({}).toArray()

  return posts.map(post => {
    const postComments = comments.filter(c => c.postId === post._id.toString())
    const category = categories.find(c => c._id.toString() === post.categoryId)

    return {
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      published: post.published,
      createdAt: post.createdAt,
      views: post.views || 0,
      author: { name: "Admin" },
      category: category ? { name: category.name } : null,
      commentCount: postComments.length
    }
  })
}

export default async function PostsPage() {
  const posts = await getPostsData()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Artículos</h2>
          <p className="text-muted-foreground">
            Crea, edita y gestiona todo tu contenido desde un solo lugar.
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo artículo
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-border bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventario de Contenido</CardTitle>
              <CardDescription>Tienes un total de {posts.length} artículos redactados.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider">Filtrar</Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider">Exportar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-muted/50">
                  <th className="pb-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Artículo</th>
                  <th className="pb-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoría</th>
                  <th className="pb-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="pb-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Rendimiento</th>
                  <th className="pb-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha</th>
                  <th className="pb-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/30">
                {posts.map((post) => (
                  <tr key={post.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-5 pr-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-none mb-1 group-hover:text-primary transition-colors">{post.title}</span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded">/{post.slug}</span>
                      </div>
                    </td>
                    <td className="py-5 text-sm">
                      {post.category ? (
                        <Badge variant="outline" className="font-medium bg-secondary/30 border-secondary-foreground/10">
                          {post.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Sin categoría</span>
                      )}
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${post.published ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className={`text-[11px] font-bold uppercase ${post.published ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                          {post.published ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.commentCount}</span>
                      </div>
                    </td>
                    <td className="py-5 text-xs font-medium text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <form action={`/api/posts/${post.id}/delete`} method="POST">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {posts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm italic">No hay artículos que mostrar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
