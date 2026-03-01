"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LogOut, Moon, Sun, Shield, ShieldCheck, Coins, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/persons", label: "الأشخاص", icon: Users },
  { href: "/dashboard/currencies", label: "العملات", icon: Coins },
  { href: "/dashboard/stats", label: "الإحصائيات", icon: BarChart3 },
  { href: "/dashboard/security", label: "الأمان", icon: ShieldCheck },
]

export function DesktopSidebar() {
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed right-0 top-0 h-dvh w-64 flex-col border-l border-sidebar-border bg-sidebar z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
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
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  )}
                >
                  {/* Active bar indicator */}
                  {isActive && (
                    <span className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-sidebar-primary" />
                  )}
                  <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border/60 p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary/15 text-sidebar-primary text-sm font-bold ring-2 ring-sidebar-primary/10">
            م
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              المستخدم
            </p>
            <p className="text-[11px] text-sidebar-foreground/50">مسؤول</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex-1 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/40 transition-all duration-150"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 ms-2" />
            ) : (
              <Moon className="h-4 w-4 ms-2" />
            )}
            {theme === "dark" ? "فاتح" : "داكن"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex-1 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-150"
          >
            <LogOut className="h-4 w-4 ms-2" />
            خروج
          </Button>
        </div>
      </div>
    </aside>
  )
}
