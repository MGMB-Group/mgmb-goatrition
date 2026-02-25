'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Bell } from 'lucide-react'
import { AuthProvider, useAuth } from '@/lib/context'
import Sidebar from '@/components/Sidebar'
import Logo from '@/components/Logo'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1e1e1e] border-t-[#dc2626]" />
          <p className="text-xs uppercase tracking-widest text-[#555]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-[#080808]">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-16 items-center justify-between border-b border-[#1e1e1e] bg-[#0d0d0d] px-4 lg:hidden">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <button
              className="text-[#6b7280] transition hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded p-1.5 text-[#6b7280] transition hover:bg-[#1a1a1a] hover:text-white"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" role="main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
