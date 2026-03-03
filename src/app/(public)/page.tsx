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
import { Menu, Clock, MessageCircle, ChevronRight, TrendingUp, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Newsletter } from "@/components/newsletter"
import { TrendingTicker } from "@/components/trending-ticker"

async function getHomeData() {
  const allPosts = await getPosts()
  const allCategories = await getCategories()
  const settings = await getSiteSettings()

  const now = new Date()
  const publishedPosts = allPosts.filter(p => p.published && new Date(p.publishedAt || 0) <= now)

  // Xataka-style needs a mix of featured and recent
  const posts = [...publishedPosts].sort((a, b) =>
    new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  ).map(post => ({
    ...post,
    id: post._id?.toString(),
    author: { name: "Redacción", image: null },
    category: allCategories.find(c => c._id?.toString() === post.categoryId),
  }))

  const categories = allCategories.slice(0, 10).map(cat => ({
    ...cat,
    id: cat._id?.toString(),
  }))

  return { posts, categories, settings }
}

export default async function HomePage() {
  const { posts, categories, settings } = await getHomeData()

  const featuredPost = posts[0]
  const secondPost = posts[1]
  const thirdPost = posts[2]
  const fourthPost = posts[3]
  const remainingPosts = posts.slice(4)

  const LogoIcon = (LucideIcons as any)[settings.logoIcon] || LucideIcons.Zap

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Dynamic Style Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-[#1e293b] text-white shadow-xl">
        {/* Top Header */}
        <div className="border-b border-white/10">
          <div className="container mx-auto h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-[#00a2a2] p-2 rounded-sm">
                  <LogoIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase italic hidden sm:block">
                  {settings.logoText || "BLOG PRO"}
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/70">
              {categories.slice(0, 4).map(cat => (
                <Link key={cat.id} href={`/ blog ? categoria = ${cat.slug} `} className="hover:text-[#00a2a2] transition-colors">{cat.name}</Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Search className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Link href="/login" className="hidden sm:block">
                <Badge variant="outline" className="border-white/20 text-white cursor-pointer hover:bg-white/10">Admin</Badge>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Navigation (Categories) */}
        <div className="bg-[#00a2a2] hidden md:block overflow-x-auto no-scrollbar border-b border-white/10">
          <div className="container mx-auto h-11 flex items-center gap-8 px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            {categories.map(cat => (
              <Link key={cat.id} href={`/ blog ? categoria = ${cat.slug} `} className="hover:text-black transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Sub-Bar (Hoy se habla de) */}
        <TrendingTicker items={posts.slice(0, 10).map(p => ({ id: p.id!, title: p.title, slug: p.slug }))} />
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Premium News Ticker / Trending */}
        <div className="relative group mb-12">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-0 overflow-hidden py-1 border-y-2 border-primary/10 bg-muted/30 backdrop-blur-sm rounded-none">
            <div className="relative z-20 flex items-center gap-2 font-black text-white bg-primary px-6 py-3 uppercase text-[11px] tracking-[0.2em] italic skew-x-[-12deg] -ml-2 select-none shadow-xl shadow-primary/20">
              <div className="skew-x-[12deg] flex items-center gap-2">
                <TrendingUp className="h-4 w-4 animate-pulse" /> TRENDING
              </div>
            </div>

            <div className="flex gap-12 overflow-x-auto no-scrollbar whitespace-nowrap font-black text-[11px] uppercase tracking-wider py-3 px-8">
              {posts.slice(0, 6).map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/ blog / ${p.slug} `}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 group/item"
                >
                  <span className="text-primary/30 font-black italic">#{idx + 1}</span>
                  <span className="group-hover/item:translate-x-1 transition-transform">{p.title}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors mx-2" />
                </Link>
              ))}
              {/* Duplicate for seamless feel if empty spaces exist */}
              {posts.slice(0, 3).map((p, idx) => (
                <Link
                  key={`dup - ${p.id} `}
                  href={`/ blog / ${p.slug} `}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 group/item md:hidden lg:flex"
                >
                  <span className="text-primary/30 font-black italic">#{idx + 7}</span>
                  <span className="group-hover/item:translate-x-1 transition-transform">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Xataka Mosaic Grid (Hero) */}
        {posts.length >= 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 h-auto lg:h-[600px] mb-12">
            {/* Main Featured Item */}
            <article className="lg:col-span-2 lg:row-span-2 relative group overflow-hidden bg-black rounded-sm border border-border">
              <Link href={`/ blog / ${featuredPost.slug} `} className="absolute inset-0 z-10" />
              <div className="relative h-full w-full opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-700">
                {featuredPost.coverImage && (
                  <Image src={featuredPost.coverImage} alt={featuredPost.title} fill className="object-cover" priority />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 p-8 z-20 w-full">
                <Badge className="bg-[#00a2a2] text-white border-none rounded-none text-[10px] font-black mb-4 group-hover:scale-110 transition-transform origin-left">
                  {featuredPost.category?.name || "DESTACADO"}
                </Badge>
                <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight tracking-tighter italic">
                  {featuredPost.title}
                </h2>
                <div className="flex items-center gap-4 mt-6 text-white/60 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(featuredPost.publishedAt!)}</div>
                  <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 12</div>
                </div>
              </div>
            </article>

            {/* Second Item */}
            <article className="lg:col-span-2 relative group overflow-hidden bg-black rounded-sm border border-border">
              <Link href={`/ blog / ${secondPost.slug} `} className="absolute inset-0 z-10" />
              <div className="relative h-full w-full opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-700">
                {secondPost.coverImage && (
                  <Image src={secondPost.coverImage} alt={secondPost.title} fill className="object-cover" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 p-6 z-20">
                <Badge className="bg-orange-500 text-white border-none rounded-none text-[9px] font-black mb-2 uppercase">
                  {secondPost.category?.name || "ANÁLISIS"}
                </Badge>
                <h3 className="text-xl lg:text-2xl font-black text-white leading-tight tracking-tighter italic">
                  {secondPost.title}
                </h3>
              </div>
            </article>

            {/* Third & Fourth Items */}
            <article className="relative group overflow-hidden bg-black rounded-sm border border-border">
              <Link href={`/ blog / ${thirdPost.slug} `} className="absolute inset-0 z-10" />
              <div className="relative h-full w-full opacity-60 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-700">
                {thirdPost.coverImage && (
                  <Image src={thirdPost.coverImage} alt={thirdPost.title} fill className="object-cover" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 p-4 z-20">
                <Badge className="bg-purple-600 text-white border-none rounded-none text-[8px] font-black mb-1 uppercase">
                  {thirdPost.category?.name || "NOTICIA"}
                </Badge>
                <h4 className="text-lg font-black text-white leading-tight tracking-tight italic">
                  {thirdPost.title}
                </h4>
              </div>
            </article>

            <article className="relative group overflow-hidden bg-black rounded-sm border border-border">
              <Link href={`/ blog / ${fourthPost.slug} `} className="absolute inset-0 z-10" />
              <div className="relative h-full w-full opacity-60 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-700">
                {fourthPost.coverImage && (
                  <Image src={fourthPost.coverImage} alt={fourthPost.title} fill className="object-cover" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 p-4 z-20">
                <Badge className="bg-blue-600 text-white border-none rounded-none text-[8px] font-black mb-1 uppercase">
                  {fourthPost.category?.name || "CIENCIA"}
                </Badge>
                <h4 className="text-lg font-black text-white leading-tight tracking-tight italic">
                  {fourthPost.title}
                </h4>
              </div>
            </article>
          </div>
        )}

        {/* Home Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black italic border-b-4 border-[#00a2a2] pr-4">ÚLTIMAS NOTICIAS</h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            {remainingPosts.map((post) => (
              <article key={post.id} className="flex flex-col md:flex-row gap-6 border-b border-border pb-10 group">
                <Link href={`/ blog / ${post.slug} `} className="md:w-1/3 aspect-video relative overflow-hidden rounded-sm bg-muted">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-[10px] text-muted-foreground/30 uppercase tracking-widest italic">Xataka Image</div>
                  )}
                </Link>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#00a2a2]/10 text-[#00a2a2] hover:bg-[#00a2a2] hover:text-white border-none rounded-none text-[10px] font-black uppercase tracking-widest py-1 transition-colors">
                      {post.category?.name || "General"}
                    </Badge>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Clock className="h-3 w-3" /> {formatDate(post.publishedAt!)}
                    </div>
                  </div>
                  <Link href={`/ blog / ${post.slug} `}>
                    <h3 className="text-xl lg:text-2xl font-black leading-tight tracking-tight group-hover:text-[#00a2a2] transition-colors italic uppercase">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-3">
                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 160) + "..."}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                      <MessageCircle className="h-3.5 w-3.5" /> 8 Comentarios
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground">• {readingTime(post.content)}</span>
                  </div>
                </div>
              </article>
            ))}

            <Button variant="outline" className="w-full h-14 rounded-none font-black uppercase tracking-widest text-[#00a2a2] border-[#00a2a2]/20 hover:bg-[#00a2a2] hover:text-white transition-all group">
              Cargar más artículos <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <section className="bg-muted/30 p-8 rounded-sm border border-border">
              <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-[#00a2a2] pl-3 mb-6">MÁS LEÍDO</h3>
              <div className="space-y-6">
                {posts.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex gap-4 group">
                    <span className="text-3xl font-black italic text-muted-foreground/20 group-hover:text-[#00a2a2]/30 transition-colors">0{i + 1}</span>
                    <Link href={`/ blog / ${p.slug} `} className="text-sm font-black leading-snug hover:text-[#00a2a2] transition-colors tracking-tight uppercase italic">
                      {p.title}
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-8 border-2 border-[#00a2a2] rounded-sm bg-background">
              <h3 className="text-xl font-black italic mb-4 uppercase tracking-tighter">SUSCRÍBETE A LA NEWSLETTER</h3>
              <p className="text-xs font-bold text-muted-foreground mb-6 leading-relaxed">Lo mejor de Xataka en tu móvil y correo. Tecnología al alcance de un click.</p>
              <div className="space-y-4">
                <Input placeholder="Tu correo electrónico..." className="rounded-none border-border font-bold text-xs h-12" />
                <Button className="w-full bg-[#00a2a2] rounded-none font-black uppercase text-xs h-12 shadow-lg shadow-[#00a2a2]/20">SUSCRIBIRSE</Button>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-[#00a2a2] pl-3 mb-6">ESPECIALES</h3>
              <div className="grid grid-cols-2 gap-4">
                {categories.slice(0, 4).map(cat => (
                  <Link key={cat.id} href={`/ blog ? categoria = ${cat.slug} `} className="flex flex-col items-center justify-center p-6 bg-card border border-border hover:bg-[#00a2a2] hover:text-white transition-all group">
                    <span className="text-xs font-black uppercase tracking-widest text-center">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <section className="container mx-auto px-4 py-20">
        <Newsletter />
      </section>

      <footer className="bg-[#1e293b] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-4 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-[#00a2a2] px-2 py-1 rounded-sm font-black text-xl tracking-tighter italic">X</div>
                <span className="text-2xl font-black tracking-tighter uppercase italic">XATAKA CLONE</span>
              </div>
              <p className="text-sm text-white/50 font-medium max-w-sm leading-relaxed">
                Publicación de tecnología, ciencia y mundo digital. Análisis, noticias y lo último en gadgets y software.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-8 rounded-full bg-white/5 border border-white/10" />)}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00a2a2] mb-6">SECCIONES</h4>
              <nav className="flex flex-col gap-3 text-xs font-black uppercase text-white/60">
                <Link href="#" className="hover:text-white">Móviles</Link>
                <Link href="#" className="hover:text-white">Relojes Inteligentes</Link>
                <Link href="#" className="hover:text-white">Informática</Link>
                <Link href="#" className="hover:text-white">Fotografía</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00a2a2] mb-6">MÁS XATAKA</h4>
              <nav className="flex flex-col gap-3 text-xs font-black uppercase text-white/60">
                <Link href="#" className="hover:text-white">Xataka Móvil</Link>
                <Link href="#" className="hover:text-white">Xataka Foto</Link>
                <Link href="#" className="hover:text-white">Xataka Android</Link>
                <Link href="#" className="hover:text-white">Xataka Smart Home</Link>
              </nav>
            </div>
          </div>
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">© {new Date().getFullYear()} XATAKA CLONE — WEBEDIA BRAND SYSTEM.</p>
            <div className="flex gap-6 text-[10px] font-black uppercase text-white/30">
              <Link href="#" className="hover:text-white">Aviso Legal</Link>
              <Link href="#" className="hover:text-white">Privacidad</Link>
              <Link href="#" className="hover:text-white">Publicidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
