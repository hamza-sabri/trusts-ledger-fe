"use client"

import { AuthProvider, useAuth } from "@/lib/auth/auth-context"
import { QueryProvider } from "@/providers/query-provider"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-dvh md:mr-64">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content */}
        <div className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <DashboardGuard>{children}</DashboardGuard>
      </AuthProvider>
    </QueryProvider>
  )
}
