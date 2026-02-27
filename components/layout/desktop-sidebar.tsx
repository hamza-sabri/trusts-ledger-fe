"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LogOut, Moon, Sun, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
]

export function DesktopSidebar() {
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed right-0 top-0 h-dvh w-64 flex-col border-l border-sidebar-border bg-sidebar z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-sidebar-foreground text-lg leading-tight">
            سجل الأمانات
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-bold">
            م
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              المستخدم
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex-1 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 ml-2" />
            ) : (
              <Moon className="h-4 w-4 ml-2" />
            )}
            {theme === "dark" ? "فاتح" : "داكن"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex-1 rounded-xl text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 ml-2" />
            خروج
          </Button>
        </div>
      </div>
    </aside>
  )
}
