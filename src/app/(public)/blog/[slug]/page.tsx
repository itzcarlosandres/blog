import { connectToDatabase } from "@/lib/mongodb"
import { getSiteSettings } from "@/lib/settings"
import { ObjectId } from "mongodb"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { formatDate, readingTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import * as LucideIcons from "lucide-react"
import { Search, Clock, MessageCircle, ChevronRight, Menu, Share2, Facebook, Twitter, Linkedin, TrendingUp, Zap } from "lucide-react"
import DOMPurify from "isomorphic-dompurify"
import { ReadingProgress } from "@/components/reading-progress"
import { SocialShare } from "@/components/social-share"
import { Newsletter } from "@/components/newsletter"
import { TrendingTicker } from "@/components/trending-ticker"

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  publishedAt?: Date
  views: number
  author: { name: string; image?: string | null }
  category: { name: string; slug: string } | null
  comments: any[]
}

interface BlogPostPageProps {
  params: { slug: string }
}

async function getPostData(slug: string): Promise<{ post: Post; relatedPosts: any[]; categories: any[]; settings: any } | null> {
  const db = await connectToDatabase()
  const settings = await getSiteSettings()
  const post = await db.collection('posts').findOne({ slug, published: true })

  if (!post) return null

  db.collection('posts').updateOne({ _id: post._id }, { $inc: { views: 1 } })

  const author = (post.authorId && ObjectId.isValid(post.authorId))
    ? await db.collection('users').findOne({ _id: new ObjectId(post.authorId) })
    : null

  const category = (post.categoryId && ObjectId.isValid(post.categoryId))
    ? await db.collection('categories').findOne({ _id: new ObjectId(post.categoryId) })
    : null
  const comments = await db.collection('comments').find({ postId: post._id.toString(), approved: true }).sort({ createdAt: -1 }).toArray()
  const categories = await db.collection('categories').find().limit(8).toArray()

  // Enhanced Related Posts Algorithm
  let relatedPosts = await db.collection('posts')
    .find({
      published: true,
      categoryId: post.categoryId,
      _id: { $ne: post._id },
      publishedAt: { $lte: new Date() }
    })
    .sort({ publishedAt: -1 })
    .limit(5)
    .toArray()

  // If not enough related posts in same category, fill with latest posts
  if (relatedPosts.length < 3) {
    const additionalPosts = await db.collection('posts')
      .find({
        published: true,
        _id: { $ne: post._id, $nin: relatedPosts.map(p => p._id) },
        publishedAt: { $lte: new Date() }
      })
      .sort({ publishedAt: -1 })
      .limit(5 - relatedPosts.length)
      .toArray()
    relatedPosts = [...relatedPosts, ...additionalPosts]
  }

  return {
    post: {
      id: post._id.toString(),
      title: post.title as string,
      slug: post.slug as string,
      content: post.content as string,
      excerpt: post.excerpt as string,
      coverImage: post.coverImage as string,
      publishedAt: post.publishedAt as Date,
      views: post.views || 0,
      author: author ? { name: author.name, image: author.image } : { name: "Redacción" },
      category: category ? { name: category.name, slug: category.slug } : null,
      comments: comments.map(c => ({ ...c, id: c._id.toString() }))
    },
    relatedPosts: relatedPosts.map(p => ({ ...p, id: p._id.toString() })),
    categories: categories.map(c => ({ ...c, id: c._id.toString() })),
    settings
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const data = await getPostData(params.slug)
  if (!data) return { title: "Noticia no encontrada" }
  const { post, settings } = data

  // Use SEO specific fields if available, otherwise fallback to post title/excerpt
  const title = (post as any).seoTitle || post.title
  const description = (post as any).seoDesc || post.excerpt || post.title

  return {
    title: `${title} - ${settings.siteName || 'Blog'}`,
    description: description,
    openGraph: post.coverImage ? { images: [{ url: post.coverImage }] } : undefined,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const data = await getPostData(params.slug)
  if (!data) notFound()
  const { post, relatedPosts, categories, settings } = data

  const LogoIcon = (LucideIcons as any)[settings.logoIcon] || LucideIcons.Zap

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
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
        <div className="bg-[#00a2a2] hidden md:block overflow-x-auto no-scrollbar border-b border-white/10">
          <div className="container mx-auto h-11 flex items-center gap-8 px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            {categories.map(cat => (
              <Link key={cat.id} href={`/blog?categoria=${cat.slug}`} className="hover:text-black transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Sub-Bar (Hoy se habla de) */}
        <TrendingTicker items={relatedPosts.slice(0, 5).map(p => ({ id: p.id, title: p.title, slug: p.slug }))} />
      </header>

      {/* Reading Progress Component (Client Side Logic) */}
      <ReadingProgress />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00a2a2] mb-6">
          <Link href="/" className="hover:underline">INICIO</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:underline">NOTICIAS</Link>
          {post.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/blog?categoria=${post.category.slug}`} className="hover:underline">{post.category.name}</Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Content */}
          <article className="lg:col-span-8">
            <header className="mb-10">
              <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter leading-none uppercase mb-8">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 py-4 border-y border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#00a2a2] flex items-center justify-center text-white text-[8px] font-black uppercase">
                    {post.author.name[0]}
                  </div>
                  <span className="text-[#00a2a2]">{post.author.name}</span>
                </div>
                <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {formatDate(post.publishedAt!)}</div>
                <div className="flex items-center gap-1.5"><MessageCircle className="h-3 w-3" /> {post.comments.length} COMENTARIOS</div>
                <Badge className="ml-auto bg-[#00a2a2] text-white border-none rounded-none text-[8px] px-2 py-0.5">{post.category?.name || "ACTUALIDAD"}</Badge>
              </div>
            </header>

            {/* Intro / Excerpt */}
            {post.excerpt && (
              <div className="text-xl lg:text-2xl font-bold leading-relaxed mb-10 text-muted-foreground border-l-4 border-[#00a2a2] pl-6 italic">
                {post.excerpt}
              </div>
            )}

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative aspect-video mb-12 shadow-2xl rounded-sm overflow-hidden group">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
                <div className="absolute bottom-4 right-4 bg-black/50 text-[8px] text-white/70 px-2 py-1 font-black backdrop-blur-sm uppercase">Imagen del artículo</div>
              </div>
            )}

            {/* Content Body */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-p:leading-relaxed prose-p:font-medium prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-[#00a2a2] prose-blockquote:bg-muted/30 prose-blockquote:rounded-sm prose-img:rounded-sm shadow-inner-sm"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />

            {/* Social Share Functional */}
            <SocialShare title={post.title} />

            {/* Newsletter Subscription */}
            <div className="mt-16">
              <Newsletter />
            </div>

            {/* Comments Section */}
            <section className="mt-20">
              <h3 className="text-2xl font-black italic uppercase border-b-4 border-[#00a2a2] inline-block pr-6 pb-2 mb-10">
                COMENTARIOS ({post.comments.length})
              </h3>

              <div className="bg-muted/20 p-8 border border-border rounded-sm mb-12">
                <form className="space-y-6" action="/api/comments" method="POST">
                  <input type="hidden" name="postId" value={post.id} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <input type="text" name="author" placeholder="TU NOMBRE (PÚBLICO)" required className="bg-background border-border h-12 px-4 text-xs font-black uppercase tracking-widest outline-none focus:border-[#00a2a2] transition-colors" />
                    <input type="email" name="email" placeholder="TU CORREO (NO SE PUBLICARÁ)" required className="bg-background border-border h-12 px-4 text-xs font-black uppercase tracking-widest outline-none focus:border-[#00a2a2] transition-colors" />
                  </div>
                  <textarea name="content" placeholder="¿QUÉ OPINAS DE ESTO?..." required rows={4} className="w-full bg-background border-border p-4 text-sm font-medium outline-none focus:border-[#00a2a2] transition-colors" />
                  <Button className="w-full bg-[#00a2a2] hover:bg-black rounded-none font-black uppercase text-xs h-14 tracking-[0.2em] shadow-lg shadow-[#00a2a2]/20 transition-all">
                    ENVIAR COMENTARIO
                  </Button>
                </form>
              </div>

              <div className="space-y-8">
                {post.comments.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground italic uppercase text-xs font-bold tracking-widest">Aún no hay opiniones. Sé el primero.</div>
                ) : (
                  post.comments.map(comment => (
                    <div key={comment.id} className="p-8 bg-card border border-border rounded-sm hover:border-[#00a2a2]/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#00a2a2]">{comment.author}</span>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{formatDate(comment.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-relaxed italic border-l-2 border-muted pl-4">"{comment.content}"</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <section className="bg-muted/30 p-8 border border-border rounded-sm">
              <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-[#00a2a2] pl-3 mb-8">TAMBIÉN TE PUEDE INTERESAR</h3>
              <div className="space-y-8">
                {relatedPosts.map(related => (
                  <Link key={related.id} href={`/blog/${related.slug}`} className="flex gap-4 group">
                    <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-sm bg-muted border border-border shadow-sm">
                      {related.coverImage && <Image src={related.coverImage} alt={related.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black italic uppercase leading-snug tracking-tighter group-hover:text-[#00a2a2] transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-[0.1em]">{formatDate(related.publishedAt!)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="p-8 border-2 border-[#00a2a2] bg-background rounded-sm">
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-4">LO ÚLTIMO EN TU EMAIL</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed mb-8 italic">No te pierdas ningún análisis profundo de la actualidad tecnológica.</p>
              <div className="space-y-4">
                <input placeholder="TU EMAIL AQUÍ..." className="w-full h-12 px-4 bg-muted/50 border-border text-[10px] font-black uppercase outline-none focus:border-[#00a2a2] transition-colors" />
                <Button className="w-full bg-[#00a2a2] hover:bg-black rounded-none h-12 font-black uppercase text-[10px] tracking-widest">SUSCRIBIRME GRATIS</Button>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-[#00a2a2] pl-3 mb-8 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> TENDENCIAS
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <Link key={cat.id} href={`/blog?categoria=${cat.slug}`} className="p-3 border border-border text-[9px] font-black uppercase tracking-widest text-center hover:bg-[#00a2a2] hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
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
