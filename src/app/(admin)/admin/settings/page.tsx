"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Globe, Shield, Bell, Palette, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react"
import * as LucideIcons from "lucide-react"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        siteName: "",
        siteDesc: "",
        logoText: "",
        logoIcon: "Zap",
        contactEmail: ""
    })

    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch("/api/settings")
                if (response.ok) {
                    const data = await response.json()
                    setSettings({
                        siteName: data.siteName || "",
                        siteDesc: data.siteDesc || "",
                        logoText: data.logoText || "",
                        logoIcon: data.logoIcon || "Zap",
                        contactEmail: data.contactEmail || ""
                    })
                }
            } catch (error) {
                console.error("Error fetching settings:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                alert("Configuración guardada correctamente")
            } else {
                throw new Error("Error al guardar")
            }
        } catch (error) {
            alert("No se pudieron guardar los cambios.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cargando Preferencias...</p>
            </div>
        )
    }

    // Get icon component dynamically if it exists in lucide-react
    const LogoIconComponent = (LucideIcons as any)[settings.logoIcon] || LucideIcons.Zap

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Configuración</h2>
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest italic mt-1">Personalización global del ecosistema blog</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    {saving ? "Guardando..." : "Sincronizar Cambios"}
                    <Sparkles className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Sidebar Nav */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { name: "General", icon: Globe, active: true },
                        { name: "Seguridad", icon: Shield, active: false },
                        { name: "Notificaciones", icon: Bell, active: false },
                        { name: "Identidad Visual", icon: ImageIcon, active: false }
                    ].map((item, i) => (
                        <Button key={i} variant={item.active ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-12 rounded-xl font-bold tracking-tight">
                            <item.icon className={`h-4 w-4 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                            {item.name}
                        </Button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Site Identity Card */}
                    <Card className="border-none shadow-2xl ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-muted/30 pb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identidad de Marca</span>
                            </div>
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Logotipo y Branding</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase italic mt-1">Configura la primera impresión de tu sitio.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="logoIcon" className="text-[10px] font-black uppercase tracking-widest ml-1">Icono Lucide (Nombre)</Label>
                                        <Input
                                            id="logoIcon"
                                            value={settings.logoIcon}
                                            onChange={(e) => setSettings({ ...settings, logoIcon: e.target.value })}
                                            placeholder="Ej: Zap, Search, Chrome..."
                                            className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4 font-bold"
                                        />
                                        <p className="text-[9px] text-muted-foreground font-medium italic mt-1">Usa cualquier nombre de icono de Lucide React.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="logoText" className="text-[10px] font-black uppercase tracking-widest ml-1">Texto del Logo</Label>
                                        <Input
                                            id="logoText"
                                            value={settings.logoText}
                                            onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                                            placeholder="MI BLOG PRO"
                                            className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4 font-black italic grayscale uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border rounded-[2rem] space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Vista Previa del Cabezal</span>
                                    <div className="flex items-center gap-2 bg-[#1e293b] p-6 rounded-xl text-white shadow-2xl scale-110">
                                        <div className="bg-[#00a2a2] p-2 rounded-sm text-white">
                                            <LogoIconComponent className="h-6 w-6" />
                                        </div>
                                        <span className="text-2xl font-black tracking-tighter uppercase italic">{settings.logoText || "LOGO TEXT"}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl ring-1 ring-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-muted/30 pb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sistema Metadatos</span>
                            </div>
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Información del Sitio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8">
                            <div className="space-y-2">
                                <Label htmlFor="siteName" className="text-[10px] font-black uppercase tracking-widest ml-1">Nombre Global</Label>
                                <Input
                                    id="siteName"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteDesc" className="text-[10px] font-black uppercase tracking-widest ml-1">Descripción (SEO)</Label>
                                <textarea
                                    id="siteDesc"
                                    className="w-full min-h-[100px] bg-background/50 border-none ring-1 ring-border rounded-[1.5rem] px-4 py-3 text-sm outline-none"
                                    value={settings.siteDesc}
                                    onChange={(e) => setSettings({ ...settings, siteDesc: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail" className="text-[10px] font-black uppercase tracking-widest ml-1">Email de Administración</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="h-12 bg-background/50 border-none ring-1 ring-border rounded-xl px-4"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
