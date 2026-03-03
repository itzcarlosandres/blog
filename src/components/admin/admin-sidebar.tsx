"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  FolderTree,
  LogOut,
  BarChart3,
  Cog,
  Image as ImageIcon
} from "lucide-react"

interface AdminSidebarProps {
  userRole: string
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Artículos", href: "/admin/posts", icon: FileText },
  { name: "Categorías", href: "/admin/categories", icon: FolderTree },
  { name: "Biblioteca", href: "/admin/media", icon: ImageIcon },
  { name: "Comentarios", href: "/admin/comments", icon: MessageSquare },
  { name: "Usuarios", href: "/admin/users", icon: Users, adminOnly: true },
  { name: "Analítica", href: "/admin/analytics", icon: BarChart3 },
  { name: "Configuración", href: "/admin/settings", icon: Cog },
]

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  )

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-slate-300">
      <div className="flex h-20 items-center px-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Blog Admin</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 px-4 space-y-8">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-4 mb-4">Menú Principal</p>
          <nav className="space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-11 px-4 transition-all duration-200 group",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-primary-foreground" : "text-slate-500 group-hover:text-white"
                    )} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-4 mb-4">Configuración</p>
          <nav className="space-y-1">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 px-4 text-slate-400 hover:text-white hover:bg-white/5 group"
              >
                <LogOut className="h-4 w-4 text-slate-500 group-hover:text-white" />
                <span className="font-medium">Ir al Sitio Público</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
              {userRole[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Usuario Activo</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{userRole.toLowerCase()}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full h-8 text-[10px] bg-transparent border-slate-700 hover:bg-slate-700 text-slate-300">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
