"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
]

export function MobileBottomNav() {
  const { logout } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[64px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors text-muted-foreground min-w-[64px]"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">خروج</span>
        </button>
      </div>
    </nav>
  )
}
