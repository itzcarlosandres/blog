import { connectToDatabase } from "@/lib/mongodb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, FolderOpen, Tag, Settings, Layers } from "lucide-react"

async function getCategoriesData() {
  const db = await connectToDatabase()
  const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray()
  const posts = await db.collection('posts').find({}).toArray()

  return categories.map(cat => ({
    id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    postCount: posts.filter(p => p.categoryId === cat._id.toString()).length
  }))
}

export default async function CategoriesPage() {
  const categories = await getCategoriesData()

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Gestión de Categorías</h2>
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1 italic">Organización estructural del contenido editorial</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Create Category Form */}
        <div className="lg:col-span-4">
          <Card className="border-none shadow-2xl ring-1 ring-border bg-card/50 backdrop-blur-sm sticky top-8 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-muted/30 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Arquitectura</span>
              </div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Nueva Sección</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase italic tracking-wider">Define una nueva etiqueta temática.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form action="/api/categories" method="POST" className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Nombre Editorial</label>
                  <Input name="name" placeholder="Ej: Inteligencia Artificial" required className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Descripción (Brief)</label>
                  <Input name="description" placeholder="Breve descripción..." className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4" />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                  Crear Categoría
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-muted/30 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Directorio</span>
              </div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Índice Temático</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/10">
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Categoría</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volumen</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {categories.map((category) => (
                      <tr key={category.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20 shadow-inner">
                              <Tag className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-black italic uppercase tracking-tighter text-base leading-none mb-1 group-hover:text-primary transition-colors">{category.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono italic">/{category.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${category.postCount > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                              {category.postCount} Artículos
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <form action={`/api/categories/${category.id}/delete`} method="POST">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all disabled:opacity-20"
                                disabled={category.postCount > 0}
                                title={category.postCount > 0 ? "No puedes eliminar una categoría con contenido activo" : "Eliminar categoría"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted transition-all text-muted-foreground">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {categories.length === 0 && (
                <div className="py-32 text-center opacity-30">
                  <FolderOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Sin Estructura Definida</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
