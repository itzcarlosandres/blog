import { connectToDatabase } from "@/lib/mongodb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Eye, ArrowUpRight, ArrowDownRight, Globe, Smartphone, Laptop, Tablet } from "lucide-react"

async function getAnalyticsData() {
    const db = await connectToDatabase()
    const posts = await db.collection('posts').find({}).toArray()

    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0)
    const avgViews = totalViews / (posts.length || 1)

    // Datos simulados para una apariencia premium
    const trafficSources = [
        { name: "Google", value: 45, change: "+12%" },
        { name: "Directo", value: 25, change: "+5%" },
        { name: "Redes Sociales", value: 20, change: "-2%" },
        { name: "Referidos", value: 10, change: "+8%" }
    ]

    const deviceData = [
        { type: "Móvil", value: "65%", icon: Smartphone },
        { type: "Escritorio", value: "30%", icon: Laptop },
        { type: "Tablet", value: "5%", icon: Tablet }
    ]

    return { totalViews, avgViews, totalPosts: posts.length, trafficSources, deviceData }
}

export default async function AnalyticsPage() {
    const data = await getAnalyticsData()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tight">Analítica Avanzada</h2>
                <p className="text-muted-foreground italic">Comprende a tu audiencia y optimiza tu impacto.</p>
            </div>

            {/* Main Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: "Vistas Totales", value: data.totalViews, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { title: "Promedio por Post", value: Math.round(data.avgViews), icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
                    { title: "Artículos Publicados", value: data.totalPosts, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl ring-1 ring-border bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
                            <div className={`${stat.bg} p-2 rounded-xl`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{stat.value.toLocaleString()}</div>
                            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-bold">
                                <ArrowUpRight className="h-3 w-3 text-green-500" /> +14.2% desde el mes anterior
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Traffic Sources */}
                <Card className="border-none shadow-2xl ring-1 ring-border overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Fuentes de Tráfico</CardTitle>
                        <CardDescription>¿De dónde vienen tus lectores?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {data.trafficSources.map((source, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            {source.name}
                                        </span>
                                        <span className="text-muted-foreground font-mono">{source.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${source.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Devices */}
                <Card className="border-none shadow-2xl ring-1 ring-border bg-gradient-to-br from-card to-muted/20">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Dispositivos</CardTitle>
                        <CardDescription>Optimización de experiencia</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center h-[250px]">
                        <div className="grid grid-cols-3 gap-4">
                            {data.deviceData.map((device, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-background/50 border border-border">
                                    <device.icon className="h-6 w-6 text-primary" />
                                    <span className="text-2xl font-black italic">{device.value}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{device.type}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
