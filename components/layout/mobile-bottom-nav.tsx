"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LogOut, ShieldCheck, Coins, Users, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/persons", label: "الأشخاص", icon: Users },
  { href: "/dashboard/currencies", label: "العملات", icon: Coins },
  { href: "/dashboard/stats", label: "الإحصائيات", icon: BarChart3 },
  { href: "/dashboard/security", label: "الأمان", icon: ShieldCheck },
]

export function MobileBottomNav() {
  const { logout } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-md shadow-[0_-2px_10px_-3px_oklch(0_0_0/0.06)] safe-area-pb">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px] min-h-[48px] justify-center",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {/* Active dot indicator */}
              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors text-muted-foreground min-w-[56px] min-h-[48px] justify-center"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">خروج</span>
        </button>
      </div>
    </nav>
  )
}
