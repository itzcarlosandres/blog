import { connectToDatabase } from "@/lib/mongodb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, MessageSquare, Eye, TrendingUp, Calendar, Zap, ArrowRight } from "lucide-react"
import { formatDate } from "@/lib/utils"

async function getStats() {
  const db = await connectToDatabase()

  const [totalPosts, totalUsers, totalComments, posts, users, categories] = await Promise.all([
    db.collection('posts').countDocuments(),
    db.collection('users').countDocuments(),
    db.collection('comments').countDocuments(),
    db.collection('posts').find({}).toArray(),
    db.collection('users').find({}).toArray(),
    db.collection('categories').find({}).toArray(),
  ])

  const totalViews = posts.reduce((acc, post) => acc + (post.views || 0), 0)

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const topPosts = [...posts]
    .filter(p => p.published)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)

  return {
    totalPosts,
    totalUsers,
    totalComments,
    totalViews,
    recentPosts: recentPosts.map(p => ({
      ...p,
      id: p._id.toString(),
      title: p.title,
      published: p.published,
      createdAt: p.createdAt,
      author: users.find(u => u._id.toString() === p.authorId) || { name: "Redacción" },
      category: categories.find(c => c._id.toString() === p.categoryId) || { name: "Sin categoría" }
    })),
    topPosts: topPosts.map(p => ({
      ...p,
      id: p._id.toString(),
      title: p.title,
      views: p.views || 0,
    })),
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full">
            Centro de Operaciones
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none italic">
            Dashboard <span className="text-muted-foreground/30 font-normal">Executive</span>
          </h2>
          <p className="text-muted-foreground font-medium text-sm lg:text-base italic max-w-xl">
            Monitoreo en tiempo real de la arquitectura de contenido y métricas de participación global.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-2xl self-start">
          <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-xl shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status: Live</span>
          </div>
        </div>
      </div>

      {/* Futuristic Stats Architecture */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Publicaciones", value: stats.totalPosts, icon: FileText, color: "from-blue-600 to-indigo-600", trend: "+2", sub: "Artículos Totales" },
          { label: "Participación", value: stats.totalUsers, icon: Users, color: "from-purple-600 to-pink-600", trend: "12", sub: "Lectores Activos" },
          { label: "Moderación", value: stats.totalComments, icon: MessageSquare, color: "from-orange-600 to-amber-600", trend: "5", sub: "Nuevos Mensajes" },
          { label: "Visibilidad", value: stats.totalViews, icon: Eye, color: "from-emerald-600 to-teal-600", trend: "15%", sub: "Vistas Globales" }
        ].map((item, i) => (
          <Card key={i} className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] hover:bg-card/60 transition-all duration-500 shadow-2xl hover:shadow-primary/5 cursor-default">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity blur-3xl`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{item.label}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-4xl font-black tracking-tighter tabular-nums italic">{item.value.toLocaleString()}</div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{item.sub}</p>
                  <Badge variant="outline" className="text-[9px] font-black border-white/10 bg-white/5 group-hover:bg-primary group-hover:text-white transition-colors">{item.trend}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-12">
        {/* Recent Activity Luxury List */}
        <Card className="md:col-span-12 lg:col-span-7 bg-card/20 backdrop-blur-md border-white/5 rounded-[3.5rem] overflow-hidden">
          <CardHeader className="p-10 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black tracking-tight italic">Actividad Reciente</CardTitle>
                <CardDescription className="text-xs font-medium uppercase tracking-widest">Los últimos movimientos editoriales</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-primary opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="space-y-8">
              {stats.recentPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-6 group relative p-4 rounded-3xl hover:bg-white/5 transition-all">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-inner border border-white/5 ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {post.published ? 'LIVE' : 'DRAFT'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black leading-tight truncate group-hover:text-primary transition-colors cursor-default tracking-tight">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{post.category.name}</p>
                      <div className="h-1 w-1 rounded-full bg-white/20" />
                      <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-muted/30 border border-white/5 flex items-center justify-center text-[9px] font-black">{post.author.name[0]}</div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Impact Insights */}
        <Card className="md:col-span-12 lg:col-span-5 bg-card/20 backdrop-blur-md border-white/5 rounded-[3.5rem] overflow-hidden">
          <CardHeader className="p-10 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight italic">Puntos de Impacto</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-widest">Artículos con mayor tracción global</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="space-y-10">
              {stats.topPosts.map((post, idx) => (
                <div key={post.id} className="space-y-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-2xl font-black text-primary/10 italic tabular-nums group-hover:text-primary/30 transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                      <p className="text-sm font-black leading-tight truncate tracking-tight">{post.title}</p>
                    </div>
                    <span className="text-[10px] font-black tabular-nums bg-white/5 px-3 py-1 rounded-full border border-white/5 group-hover:bg-primary group-hover:text-white transition-colors">
                      {post.views} VISTAS
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary/50 to-primary h-full transition-all duration-[2000ms] ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      style={{ width: `${Math.min((post.views / (stats.totalViews || 1)) * 100 * 5, 100)}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-12 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Zap className="h-20 w-20 text-primary" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Meta Insight</p>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
                  "El 40% de tu tráfico proviene de la sección de Tecnología. Considera aumentar la frecuencia de publicación allí."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
