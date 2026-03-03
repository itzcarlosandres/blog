"use client"

import { useState } from "react"
import { Send, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("loading")

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" }
            })

            const data = await res.json()

            if (res.ok) {
                setStatus("success")
                setMessage(data.message)
                setEmail("")
            } else {
                setStatus("error")
                setMessage(data.error || "Ocurrió un error")
            }
        } catch (err) {
            setStatus("error")
            setMessage("Error de conexión")
        }
    }

    return (
        <div className="relative overflow-hidden bg-card/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 lg:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00a2a2]/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <h3 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter leading-none">
                        Mantente a la <span className="text-primary italic">Vanguardia</span>
                    </h3>
                    <p className="text-muted-foreground font-medium text-sm lg:text-base italic">
                        Suscríbete a nuestro boletín y recibe las noticias tecnológicas más impactantes directamente en tu bandeja de entrada.
                    </p>
                </div>

                {status === "success" ? (
                    <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-500">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                        <p className="font-bold text-lg">{message}</p>
                        <Button variant="outline" onClick={() => setStatus("idle")} className="rounded-xl border-white/5 uppercase text-[10px] font-black tracking-widest">
                            Suscribir otra cuenta
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Input
                                type="email"
                                placeholder="TU EMAIL@EJEMPLO.COM"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 bg-background/50 border-white/5 rounded-2xl px-6 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={status === "loading"}
                            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {status === "loading" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Suscribirme <Send className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                )}

                {status === "error" && (
                    <p className="text-destructive text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-top-2">
                        {message}
                    </p>
                )}

                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">
                    PROMESA DE PRIVACIDAD: CERO SPAM. SOLO CONTENIDO DE VALOR.
                </p>
            </div>
        </div>
    )
}
