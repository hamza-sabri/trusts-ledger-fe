import { AuthProvider } from "@/lib/auth/auth-context"
import { QueryProvider } from "@/providers/query-provider"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}
