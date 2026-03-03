"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-lg font-semibold">Panel de Administración</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <Badge variant="secondary" className="text-xs">
              {user.role}
            </Badge>
          </div>
          <Avatar>
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>
              {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
