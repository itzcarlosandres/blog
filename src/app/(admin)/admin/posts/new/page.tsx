"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, Image as ImageIcon, Search, Settings, FileText, Send, Calendar } from "lucide-react"
import { slugify } from "@/lib/utils"
import { TiptapEditor } from "@/components/admin/tiptap-editor"

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDesc, setSeoDesc] = useState("")
  const [published, setPublished] = useState(true)
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16))
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.map((c: any) => ({ id: c._id || c.id, name: c.name })))
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }
    fetchCategories()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        const data = await response.json()
        setCoverImage(data.url)
      } else {
        throw new Error("Error al subir imagen")
      }
    } catch (err) {
      console.error(err)
      setError("No se pudo subir la imagen")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          coverImage,
          categoryId,
          seoTitle,
          seoDesc,
          published,
          publishedAt: new Date(publishedAt).toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error creating post")
      }

      router.push("/admin/posts")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border hover:bg-muted transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Nuevo Artículo</h2>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1 italic">Redacción de contenido editorial</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/posts">
            <Button variant="ghost" className="font-bold uppercase text-[10px] tracking-widest">Descartar</Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? "Procesando..." : "Publicar Contenido"}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-2xl ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-muted/30 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Cuerpo del Artículo</span>
              </div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Editor de Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl">
                  <AlertDescription className="font-bold uppercase text-[10px] tracking-widest">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest ml-1">Título de Impacto</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Título del artículo..."
                  required
                  className="h-14 bg-background/50 border-none ring-1 ring-border focus-visible:ring-primary/50 text-xl font-bold rounded-2xl px-6"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="excerpt" className="text-[10px] font-black uppercase tracking-widest ml-1">Introducción / Extracto (Lead)</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Breve resumen para captar la atención..."
                  rows={3}
                  className="bg-background/50 border-none ring-1 ring-border focus-visible:ring-primary/50 font-medium rounded-2xl p-6 resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-widest ml-1">Desarrollo del Artículo (Editor Visual)</Label>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Optimization Card */}
          <Card className="border-none shadow-2xl ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-muted/30 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Optimización de Motores de Búsqueda</span>
              </div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Panel SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <Label htmlFor="seoTitle" className="text-[10px] font-black uppercase tracking-widest ml-1">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Título optimizado para Google (opcional)..."
                  className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="seoDesc" className="text-[10px] font-black uppercase tracking-widest ml-1">SEO Description</Label>
                <Textarea
                  id="seoDesc"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Meta descripción para buscadores..."
                  rows={2}
                  className="bg-background/50 border-none ring-1 ring-border rounded-xl p-4"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings Area */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem] sticky top-8">
            <CardHeader className="bg-muted/30 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Configuración</span>
              </div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-3">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest ml-1">Clasificación</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4">
                    <SelectValue placeholder="Seleccionar Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest ml-1">URL Personalizada / ID</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-del-articulo"
                  required
                  className="bg-background/50 border-none ring-1 ring-border rounded-xl px-4 font-mono text-xs"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="coverImage" className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" /> Imagen de Portada
                </Label>

                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-xl border-dashed border-2 hover:bg-muted font-bold text-xs gap-2"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>Subiendo...</>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4" />
                          {coverImage ? "Cambiar Imagen" : "Subir Imagen de Portada"}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.2em]">
                      <span className="bg-card px-2 text-muted-foreground/50 italic">O usa una URL</span>
                    </div>
                  </div>

                  <Input
                    id="coverImage"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="bg-background/50 border-none ring-1 ring-border rounded-xl px-4 text-[10px] h-10"
                  />
                </div>

                {coverImage && (
                  <div className="mt-4 aspect-video relative rounded-2xl overflow-hidden ring-1 ring-border shadow-2xl group">
                    <img src={coverImage} alt="Preview" className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-700" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-8 rounded-lg text-[9px] font-black uppercase"
                        onClick={() => setCoverImage("")}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="publishedAt" className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Fecha de Publicación
                </Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="bg-background/50 border-none ring-1 ring-border rounded-xl px-4 text-xs h-12"
                />
                <p className="text-[8px] text-muted-foreground italic font-medium px-1">
                  * El artículo solo será visible si está marcado como "Publicado" y la fecha es pasada.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-2xl">
                <div className="space-y-0.5">
                  <Label htmlFor="published" className="text-[10px] font-black uppercase tracking-widest">Visibilidad Pública</Label>
                  <p className="text-[10px] text-muted-foreground font-bold italic uppercase">¿Publicar ahora?</p>
                </div>
                <Checkbox
                  id="published"
                  checked={published}
                  onCheckedChange={(checked: boolean | "indeterminate") => setPublished(checked === true)}
                  className="h-6 w-6 rounded-lg border-2 border-primary data-[state=checked]:bg-primary transition-all"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
