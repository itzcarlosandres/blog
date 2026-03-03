import { connectToDatabase } from "@/lib/mongodb"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, XCircle, MessageSquare, ShieldCheck, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"

async function getCommentsData() {
  const db = await connectToDatabase()
  const comments = await db.collection('comments').find({}).sort({ createdAt: -1 }).toArray()
  const posts = await db.collection('posts').find({}).toArray()

  return comments.map(c => ({
    id: c._id.toString(),
    author: c.author,
    email: c.email,
    content: c.content,
    approved: c.approved,
    createdAt: c.createdAt,
    post: posts.find(p => p._id.toString() === c.postId) || { title: "Post eliminado", slug: "#" }
  }))
}

export default async function CommentsPage() {
  const comments = await getCommentsData()

  const pendingCount = comments.filter((c) => !c.approved).length
  const approvedCount = comments.filter((c) => c.approved).length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comentarios</h2>
          <p className="text-muted-foreground">Supervisa e interactúa con la comunidad de tu blog.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-none shadow-lg ring-1 ring-border bg-yellow-500/10">
            <p className="text-[10px] font-black uppercase text-yellow-600 dark:text-yellow-400 mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-500">{pendingCount}</p>
          </Card>
          <Card className="p-4 border-none shadow-lg ring-1 ring-border bg-green-500/10">
            <p className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 mb-1">Aprobados</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">{approvedCount}</p>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-border overflow-hidden bg-card/60 backdrop-blur-sm">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Flujo de Conversación
          </CardTitle>
          <CardDescription>Ultimos {comments.length} comentarios recibidos.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6">
            {comments.length === 0 ? (
              <div className="py-20 text-center opacity-50">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium">Aún no hay comentarios en tus artículos.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`group relative rounded-2xl border p-6 transition-all duration-300 ${comment.approved
                      ? "bg-background hover:shadow-md border-muted/50"
                      : "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/50 shadow-sm"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner bg-gradient-to-tr ${comment.approved ? 'from-slate-400 to-slate-500' : 'from-yellow-400 to-orange-500'}`}>
                        {comment.author[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm tracking-tight">{comment.author}</span>
                          {!comment.approved && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[9px] font-black px-1.5 py-0 border-none uppercase">Nuevo</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(comment.createdAt)}</span>
                          {comment.email && <span>• {comment.email}</span>}
                        </div>
                      </div>
                    </div>
                    {comment.approved ? (
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Aprobado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 animate-pulse">
                        <Clock className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Esperando</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                    "{comment.content}"
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-muted/30">
                    <Link
                      href={`/blog/${comment.post.slug}`}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 group/link"
                    >
                      <span>Artículo: {comment.post.title}</span>
                    </Link>
                    <div className="flex gap-3">
                      {!comment.approved && (
                        <form action={`/api/comments/${comment.id}/approve`} method="POST">
                          <Button size="sm" className="h-8 rounded-lg bg-green-600 hover:bg-green-700 font-bold text-[10px] uppercase px-3">
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Aprobar
                          </Button>
                        </form>
                      )}
                      <form action={`/api/comments/${comment.id}/delete`} method="POST">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-destructive hover:bg-destructive/10 font-bold text-[10px] uppercase px-3">
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
