import { getPosts, getCategories } from "@/lib/db"
import { getSiteSettings } from "@/lib/settings"
export const dynamic = 'force-dynamic'
import Link from "next/link"
import Image from "next/image"
import { formatDate, readingTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import * as LucideIcons from "lucide-react"
import { Search, Menu, Clock, MessageCircle, ChevronRight, Filter, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Newsletter } from "@/components/newsletter"
import { TrendingTicker } from "@/components/trending-ticker"

async function getBlogData(category?: string, search?: string, page: number = 1) {
  const pageSize = 8
  const allPosts = await getPosts()
  const categories = await getCategories()
  const settings = await getSiteSettings()

  let posts = allPosts.filter(p => p.published)

  if (category) {
    posts = posts.filter(p => {
      const postCategory = categories.find(c => c._id?.toString() === p.categoryId)
      return postCategory?.slug === category
    })
  }

  if (search) {
    const searchLower = search.toLowerCase()
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.content.toLowerCase().includes(searchLower)
    )
  }

  const totalPosts = posts.length

  const postsWithRelations = posts.sort((a, b) =>
    new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  )
    .slice((page - 1) * pageSize, page * pageSize)
    .map(post => ({
      ...post,
      id: post._id?.toString(),
      author: { name: "Redacción", image: null },
      category: categories.find(c => c._id?.toString() === post.categoryId),
    }))

  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    id: cat._id?.toString(),
    count: allPosts.filter(p => p.categoryId === cat._id?.toString() && p.published).length
  }))

  const totalPages = Math.ceil(totalPosts / pageSize)

  return {
    posts: postsWithRelations,
    categories: categoriesWithCount,
    allPostsCount: allPosts.filter(p => p.published).length,
    settings,
    totalPages,
    currentPage: page
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { categoria?: string; buscar?: string; pagina?: string }
}) {
  const page = parseInt(searchParams.pagina || "1")
  const { posts, categories, allPostsCount, settings, totalPages, currentPage } = await getBlogData(
    searchParams.categoria,
    searchParams.buscar,
    page
  )

  const activeCategory = categories.find(c => c.slug === searchParams.categoria)
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
            <form className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                name="buscar"
                placeholder="BUSCAR NOTICIA..."
                className="bg-white/10 border-none rounded-none w-64 pl-10 text-[10px] font-black uppercase tracking-widest focus-visible:ring-1 ring-[#00a2a2]"
                defaultValue={searchParams.buscar}
              />
            </form>
            <ThemeToggle />
          </div>
        </div>
        <div className="bg-[#00a2a2] hidden md:block overflow-x-auto no-scrollbar border-b border-white/10">
          <div className="container mx-auto h-11 flex items-center gap-8 px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id} href={`/ blog ? categoria = ${cat.slug} `} className={`hover: text - black transition - colors ${activeCategory?.id === cat.id ? 'text-black' : ''} `}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Sub-Bar (Hoy se habla de) */}
        <TrendingTicker items={posts.slice(0, 8).map(p => ({ id: p.id!, title: p.title, slug: p.slug }))} />
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Section Title */}
        <div className="mb-12 border-b-4 border-[#00a2a2] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00a2a2] mb-2">
              <ChevronRight className="h-3 w-3" /> {activeCategory ? 'SECCIÓN' : 'ARCHIVO'}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter leading-none uppercase">
              {activeCategory ? activeCategory.name : searchParams.buscar ? `RESULTADOS: ${searchParams.buscar} ` : "ÚLTIMAS PUBLICACIONES"}
            </h1>
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
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Prueba con otra búsqueda o categoría</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="flex flex-col md:flex-row gap-8 pb-10 border-b border-border group">
                  <Link href={`/ blog / ${post.slug} `} className="md:w-2/5 aspect-video relative overflow-hidden rounded-sm bg-muted shadow-lg">
                    {post.coverImage ? (
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-[10px] text-muted-foreground/20 uppercase tracking-widest italic">Visual Xataka</div>
                    )}
                    <Badge className="absolute top-4 left-4 z-10 bg-[#00a2a2] text-white rounded-none border-none text-[8px] font-black uppercase">
                      {post.category?.name || "ACTUALIDAD"}
                    </Badge>
                  </Link>
                  <div className="flex-1 space-y-4">
                    <Link href={`/ blog / ${post.slug} `}>
                      <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter leading-tight uppercase group-hover:text-[#00a2a2] transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="text-[#00a2a2]">{post.author.name}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(post.publishedAt!)}</div>
                      <span>•</span>
                      <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 0</div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 200) + "..."}
                    </p>
                  </div>
                </article>
              ))
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pb-10 border-b border-border">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/ blog ? ${new URLSearchParams({
                      ...(searchParams.categoria && { categoria: searchParams.categoria }),
                      ...(searchParams.buscar && { buscar: searchParams.buscar }),
                      pagina: p.toString()
                    }).toString()
                      } `}
                  >
                    <Button
                      variant={p === currentPage ? "default" : "outline"}
                      className={`h - 12 w - 12 rounded - none font - black ${p === currentPage ? 'bg-[#00a2a2]' : 'border-border'} `}
                    >
                      {p}
                    </Button>
                  </Link>
                ))}
              </div>
            )}

            {/* Newsletter Section */}
            <div className="mt-12">
              <Newsletter />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <section className="bg-muted/30 p-8 rounded-sm border border-border">
              <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-[#00a2a2] pl-3 mb-8">FILTRAR POR SECCIÓN</h3>
              <div className="flex flex-col gap-2">
                <Link href="/blog" className={`flex items - center justify - between p - 3 text - [10px] font - black uppercase tracking - widest transition - all ${!searchParams.categoria ? 'bg-[#00a2a2] text-white' : 'hover:bg-muted'} `}>
                  <span>Todo el Archivo</span>
                  <span>{allPostsCount}</span>
                </Link>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/ blog ? categoria = ${cat.slug} `} className={`flex items - center justify - between p - 3 text - [10px] font - black uppercase tracking - widest transition - all ${searchParams.categoria === cat.slug ? 'bg-[#00a2a2] text-white' : 'hover:bg-muted'} `}>
                    <span>{cat.name}</span>
                    <span>{cat.count}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="p-8 bg-[#1e293b] text-white rounded-sm">
              <h3 className="text-xl font-black italic uppercase leading-tight mb-4 tracking-tighter">Accede al panel de control</h3>
              <p className="text-xs font-bold text-white/40 mb-8 uppercase tracking-widest italic">Gestiona el contenido como un profesional</p>
              <Link href="/login">
                <Button className="w-full bg-[#00a2a2] hover:bg-white hover:text-black rounded-none font-black uppercase text-xs h-12 transition-all">ACCEDER AHORA</Button>
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
              <Link href="#" className="hover:text-white">PRIVACIDAD</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
