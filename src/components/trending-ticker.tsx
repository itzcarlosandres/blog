"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface TrendingItem {
    id: string
    title: string
    slug: string
}

interface TrendingTickerProps {
    items: TrendingItem[]
}

export function TrendingTicker({ items }: TrendingTickerProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Placeholder keywords to fill up if not enough items
    const keywords = ["IA", "Apple", "OpenAI", "Gadgets", "Futuro", "Ciencia", "Smartphones"]

    return (
        <div className="bg-[#0f172a] border-b border-white/5 py-3 overflow-hidden">
            <div className="container mx-auto px-4 flex items-center gap-4">
                <div className="flex items-center gap-2 whitespace-nowrap shrink-0 group">
                    <span role="img" aria-label="fire" className="text-sm animate-bounce group-hover:animate-pulse">🔥</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00a2a2]">Hoy se habla de</span>
                    <ChevronRight className="h-3 w-3 text-white/30 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <div className="flex gap-12 whitespace-nowrap text-[10px] font-bold text-white/60 tracking-wider items-center animate-ticker hover:[animation-play-state:paused]">
                        {/* Original content */}
                        {[...items, ...keywords.map(kw => ({ id: kw, title: kw, slug: '#' }))].map((p, idx) => (
                            <div key={`${p.id}-${idx}`} className="flex items-center gap-12">
                                <Link href={p.slug === '#' ? '#' : `/blog/${p.slug}`} className="hover:text-white transition-colors uppercase">
                                    {p.title.split(' ').slice(0, 2).join(' ')}
                                </Link>
                                <span className="text-white/20">—</span>
                            </div>
                        ))}
                        {/* Cloned content for seamless loop */}
                        {[...items, ...keywords.map(kw => ({ id: kw, title: kw, slug: '#' }))].map((p, idx) => (
                            <div key={`clone-${p.id}-${idx}`} className="flex items-center gap-12">
                                <Link href={p.slug === '#' ? '#' : `/blog/${p.slug}`} className="hover:text-white transition-colors uppercase">
                                    {p.title.split(' ').slice(0, 2).join(' ')}
                                </Link>
                                <span className="text-white/20">—</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
