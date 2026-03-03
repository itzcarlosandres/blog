import { connectToDatabase } from "@/lib/mongodb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, UserPlus, Shield, UserCog, User } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

async function getUsersData() {
  const db = await connectToDatabase()
  const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
  const posts = await db.collection('posts').find({}).toArray()

  return users.map(u => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    postCount: posts.filter(p => p.authorId === u._id.toString()).length
  }))
}

export default async function UsersPage() {
  const users = await getUsersData()

  async function createUser(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string

    const hashedPassword = await bcrypt.hash(password, 10)
    const db = await connectToDatabase()

    await db.collection('users').insertOne({
      name,
      email,
      hashedPassword,
      role: role as "ADMIN" | "EDITOR" | "AUTHOR",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/admin/users")
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
        <p className="text-muted-foreground">Controla quién tiene acceso a la plataforma y qué permisos tienen.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Create User Form */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-xl ring-1 ring-border bg-card/60 backdrop-blur-sm sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Nuevo Perfil
              </CardTitle>
              <CardDescription>Crea credenciales para tu equipo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase text-muted-foreground">Nombre Completo</Label>
                  <Input id="name" name="name" placeholder="Ej: Juan Pérez" required className="rounded-xl bg-muted/50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase text-muted-foreground">Email de Empresa</Label>
                  <Input id="email" name="email" type="email" placeholder="email@ejemplo.com" required className="rounded-xl bg-muted/50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase text-muted-foreground">Contraseña</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required className="rounded-xl bg-muted/50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[10px] font-black uppercase text-muted-foreground">Rol de Accesos</Label>
                  <Select name="role" defaultValue="AUTHOR">
                    <SelectTrigger className="rounded-xl bg-muted/50 border-none">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Amdinistrador</SelectItem>
                      <SelectItem value="EDITOR">Editor de Contenido</SelectItem>
                      <SelectItem value="AUTHOR">Autor Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full rounded-xl font-bold py-6 group">
                  <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  Registrar Usuario
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="lg:col-span-3">
          <Card className="border-none shadow-xl ring-1 ring-border overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" /> Personal Autorizado
              </CardTitle>
              <CardDescription>Visualiza y administra los roles de cada integrante.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/10">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-muted-foreground">Usuario</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-muted-foreground">Permisos</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-muted-foreground">Actividad</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-muted-foreground">Registro</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/30">
                    {users.map((user) => (
                      <tr key={user.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold tracking-tight text-sm leading-none mb-1">{user.name || "—"}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-black text-[9px] px-2 py-0.5 border-none",
                              user.role === "ADMIN" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                user.role === "EDITOR" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                  "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground">{user.postCount} POSTS</span>
                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${Math.min(user.postCount * 10, 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[11px] font-medium text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <form action={`/api/users/${user.id}/delete`} method="POST">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
