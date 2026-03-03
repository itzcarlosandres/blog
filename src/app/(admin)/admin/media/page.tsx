"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, Check, Eye, Image as ImageIcon, Search, Filter, Loader2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface MediaFile {
    name: string
    url: string
    size: number
    createdAt: string
}

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaFile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

    const fetchMedia = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/media")
            if (res.ok) {
                const data = await res.json()
                setMedia(data)
            }
        } catch (err) {
            console.error("Error fetching media:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedia()
    }, [])

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(window.location.origin + url)
        setCopiedUrl(url)
        setTimeout(() => setCopiedUrl(null), 2000)
    }

    const handleDelete = async (filename: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) return

        try {
            const res = await fetch("/api/media", {
                method: "DELETE",
                body: JSON.stringify({ filename }),
            })
            if (res.ok) {
                setMedia(media.filter(m => m.name !== filename))
            }
        } catch (err) {
            console.error("Error deleting media:", err)
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const filteredMedia = media.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full">
                        Almacenamiento Global
                    </Badge>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none italic">
                        Biblioteca <span className="text-muted-foreground/30 font-normal">Multimedia</span>
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm lg:text-base italic max-w-xl">
                        Gestiona todos los recursos visuales subidos al servidor. Reutiliza o elimina contenido con un clic.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={fetchMedia}
                        variant="outline"
                        className="h-14 px-6 rounded-2xl bg-card/40 border-white/5 font-black uppercase text-[10px] tracking-widest gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="BUSCAR EN LA BIBLIOTECA..."
                        className="h-14 pl-12 bg-card/40 border-white/5 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    Resultados: <span className="text-foreground">{filteredMedia.length} archivos</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Cargando biblioteca...</p>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-card/20 rounded-[3rem] border border-dashed border-white/10 italic text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p>La biblioteca está vacía o no hay resultados para tu búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredMedia.map((file) => (
                        <Card key={file.name} className="group overflow-hidden bg-card/40 border-white/5 rounded-[2.5rem] hover:bg-card/60 transition-all duration-500 shadow-2xl">
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => window.open(file.url, '_blank')}
                                        className="h-10 w-10 rounded-xl"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => copyToClipboard(file.url)}
                                        className="h-10 w-10 rounded-xl"
                                    >
                                        {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(file.name)}
                                        className="h-10 w-10 rounded-xl"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-white truncate" title={file.name}>
                                        {file.name}
                                    </p>
                                    <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                        <span>{formatSize(file.size)}</span>
                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
