import { connectToDatabase } from "@/lib/mongodb"
import { getSiteSettings } from "@/lib/settings"
export const dynamic = 'force-dynamic'
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { formatDate, readingTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as LucideIcons from "lucide-react"
import { Clock, MessageCircle, ChevronRight, Menu, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface Category {
  id: string
  name: string
  description?: string
  slug: string
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  publishedAt?: Date
  author: { name: string }
  category: { name: string; slug: string }
  commentCount: number
}

async function getCategoryData(slug: string): Promise<{ category: Category; posts: Post[]; categories: any[]; settings: any } | null> {
  const db = await connectToDatabase()
  const settings = await getSiteSettings()
  const category = await db.collection('categories').findOne({ slug })

  if (!category) {
    return null
  }

  const posts = await db.collection('posts')
    .find({
      published: true,
      categoryId: category._id.toString(),
    })
    .sort({ publishedAt: -1 })
    .toArray()

  const authors = await db.collection('users').find({}).toArray()
  const allCategories = await db.collection('categories').find({}).toArray()
  const comments = await db.collection('comments').find({}).toArray()

  const fullPosts: Post[] = posts.map(p => ({
    id: p._id.toString(),
    title: p.title as string,
    slug: p.slug as string,
    content: p.content as string,
    excerpt: p.excerpt as string,
    coverImage: p.coverImage as string,
    publishedAt: p.publishedAt as Date,
    author: (authors.find(u => u._id?.toString() === p.authorId) as any) || { name: "Redacción" },
    category: (allCategories.find(c => c._id?.toString() === p.categoryId) as any) || { name: "Sin categoría", slug: "#" },
    commentCount: comments.filter(c => c.postId === p._id.toString() && c.approved).length
  }))

  return {
    category: {
      id: category._id.toString(),
      name: category.name as string,
      description: category.description as string,
      slug: category.slug as string
    },
    posts: fullPosts,
    categories: allCategories.map(c => ({ id: c._id.toString(), name: c.name, slug: c.slug })),
    settings
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const data = await getCategoryData(params.slug)
  if (!data) notFound()
  const { category, posts, categories, settings } = data

  const LogoIcon = (LucideIcons as any)[settings.logoIcon] || LucideIcons.Zap

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Dynamic Style Header */}
      <header className="sticky top-0 z-50 w-full bg-[#1e293b] text-white shadow-xl">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-[#00a2a2] p-2 rounded-sm">
                <LogoIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic hidden sm:block leading-none">
                {settings.logoText || "BLOG PRO"}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <div className="bg-[#00a2a2] hidden md:block overflow-x-auto no-scrollbar">
          <div className="container mx-auto h-10 flex items-center gap-8 px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            {categories.map(cat => (
              <Link key={cat.id} href={`/blog?categoria=${cat.slug}`} className={`hover:text-black transition-colors ${category.id === cat.id ? 'text-black' : ''}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Section Title */}
        <div className="mb-16 border-b-4 border-[#00a2a2] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00a2a2] mb-2">
              <ChevronRight className="h-3 w-3" /> SECCIÓN ESPECIALIZADA
            </div>
            <h1 className="text-4xl lg:text-8xl font-black italic tracking-tighter leading-none uppercase">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-4 text-muted-foreground font-bold text-sm uppercase italic tracking-widest max-w-2xl">{category.description}</p>
            )}
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">
            {posts.length} Documentos en esta sección
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-10">
            {posts.length === 0 ? (
              <div className="py-32 text-center bg-muted/20 border-2 border-dashed border-border rounded-sm">
                <h3 className="text-xl font-black italic uppercase">No hay resultados</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Prueba con otra categoría</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="flex flex-col md:flex-row gap-8 pb-10 border-b border-border group">
                  <Link href={`/blog/${post.slug}`} className="md:w-2/5 aspect-video relative overflow-hidden rounded-sm bg-muted shadow-lg">
                    {post.coverImage ? (
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-[10px] text-muted-foreground/20 uppercase tracking-widest italic">Visual Xataka</div>
                    )}
                    <Badge className="absolute top-4 left-4 z-10 bg-[#00a2a2] text-white rounded-none border-none text-[8px] font-black uppercase">
                      {category.name}
                    </Badge>
                  </Link>
                  <div className="flex-1 space-y-4">
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter leading-tight uppercase group-hover:text-[#00a2a2] transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="text-[#00a2a2]">{post.author.name}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(post.publishedAt!)}</div>
                      <span>•</span>
                      <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.commentCount}</div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 200) + "..."}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="lg:col-span-4 space-y-12">
            <section className="bg-[#1e293b] text-white p-8 rounded-sm">
              <h3 className="text-xl font-black italic uppercase leading-tight mb-4 tracking-tighter">Sobre esta sección</h3>
              <p className="text-xs font-bold text-white/40 mb-8 uppercase tracking-widest italic leading-relaxed">
                Contenido exclusivo curado por el equipo de Xataka Clone centrado en {category.name}.
              </p>
              <Link href="/blog">
                <Button className="w-full bg-[#00a2a2] hover:bg-white hover:text-black rounded-none font-black uppercase text-xs h-12 transition-all">VER TODO EL ARCHIVO</Button>
              </Link>
            </section>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1e293b] text-white py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">© {new Date().getFullYear()} XATAKA CLONE — DIGITAL NEWS SYSTEM.</p>
            <div className="flex gap-6 text-[10px] font-black uppercase text-white/30">
              <Link href="/" className="hover:text-white">INICIO</Link>
              <Link href="/blog" className="hover:text-white">NOTICIAS</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
