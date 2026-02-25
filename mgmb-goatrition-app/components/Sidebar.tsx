'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  Camera,
  User,
  Swords,
  BarChart3,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '@/lib/context'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/activities', label: 'Activities', icon: Dumbbell },
  { href: '/scan', label: 'AI Scan', icon: Camera },
  { href: '/fighter-mode', label: 'Fighter Mode', icon: Swords },
  { href: '/profile', label: 'Profile', icon: User },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-[#1e1e1e] bg-[#0d0d0d]
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[#1e1e1e] px-4">
          <Logo size="sm" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4" role="navigation">
          <ul className="space-y-0.5 px-2" role="list">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all duration-150
                    ${isActive(href)
                      ? 'bg-[#dc2626]/15 text-[#dc2626]'
                      : 'text-[#9ca3af] hover:bg-[#1a1a1a] hover:text-white'}
                  `}
                  aria-current={isActive(href) ? 'page' : undefined}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${
                      isActive(href) ? 'text-[#dc2626]' : 'text-[#6b7280] group-hover:text-[#9ca3af]'
                    }`}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive(href) && (
                    <ChevronRight size={14} className="text-[#dc2626]" />
                  )}
                  {label === 'AI Scan' && (
                    <span className="rounded bg-[#dc2626]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#dc2626]">
                      AI
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Admin link */}
          {user?.role === 'admin' && (
            <div className="mt-4 border-t border-[#1e1e1e] pt-4 px-2">
              <Link
                href="/admin"
                onClick={onClose}
                className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive('/admin')
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-[#6b7280] hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <Shield size={18} className="flex-shrink-0 text-amber-500" />
                <span>Admin</span>
                <span className="ml-auto rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                  ADMIN
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#1e1e1e] p-3">
          <div className="mb-2 flex items-center gap-3 rounded bg-[#1a1a1a] px-3 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#dc2626]/20">
              <span className="text-xs font-bold text-[#dc2626]">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name ?? 'Fighter'}</p>
              <p className="truncate text-xs text-[#6b7280]">{user?.email ?? ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-[#6b7280] transition-colors hover:bg-[#1a1a1a] hover:text-white"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
