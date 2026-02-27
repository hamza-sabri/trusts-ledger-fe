"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useTheme } from "next-themes"
import { Moon, Sun, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileHeader() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Shield className="h-4 w-4" />
        </div>
        <h1 className="font-bold text-foreground text-base">سجل الأمانات</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl h-9 w-9"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">تبديل السمة</span>
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
          {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "م"}
        </div>
      </div>
    </header>
  )
}
