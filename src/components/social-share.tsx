"use client"

import { Facebook, Twitter, Linkedin, Share2, Link as LinkIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SocialShareProps {
    title: string
}

export function SocialShare({ title }: SocialShareProps) {
    const [copied, setCopied] = useState(false)

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&title=${encodeURIComponent(title)}`,
    }

    const copyToClipboard = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const openShare = (url: string) => {
        window.open(url, "_blank", "width=600,height=400")
    }

    return (
        <div className="mt-16 py-8 border-y border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Share2 className="h-4 w-4 text-[#00a2a2]" /> COMPARTE ESTA NOTICIA
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openShare(shareUrls.facebook)}
                    className="h-10 w-10 rounded-full border-[#00a2a2]/20 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm"
                >
                    <Facebook className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openShare(shareUrls.twitter)}
                    className="h-10 w-10 rounded-full border-[#00a2a2]/20 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm"
                >
                    <Twitter className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openShare(shareUrls.linkedin)}
                    className="h-10 w-10 rounded-full border-[#00a2a2]/20 hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm"
                >
                    <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="h-10 w-10 rounded-full border-[#00a2a2]/20 hover:bg-[#00a2a2] hover:text-white transition-all shadow-sm"
                >
                    {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
