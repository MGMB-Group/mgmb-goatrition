'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import { AuthProvider, useAuth } from '@/lib/context'
import { usersStore } from '@/lib/store'
import { verifyPassword } from '@/lib/auth-utils'

function LoginForm() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard')
  }, [user, isLoading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      const found = usersStore.findByEmail(form.email)
      if (!found || !verifyPassword(form.password, found.password)) {
        setError('Invalid email or password')
        return
      }
      login(found.id)
      router.push('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] bg-tactical-grid px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" linkTo="/" />
        </div>

        <div className="rounded-lg border border-[#222] bg-[#111] p-8 shadow-2xl">
          <h1
            className="mb-1 font-display text-3xl font-black uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Welcome Back
          </h1>
          <p className="mb-6 text-sm text-[#6b7280]">Log in to continue your training</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-2.5 text-sm text-[#f87171]">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#555] transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                placeholder="fighter@gym.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 pr-10 text-sm text-white placeholder-[#555] transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] transition hover:text-[#9ca3af]"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#dc2626] px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#ef4444] disabled:opacity-60"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              {submitting ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <LogIn size={16} />
                  Login
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#6b7280]">
            No account?{' '}
            <Link href="/register" className="font-medium text-[#dc2626] hover:text-[#ef4444]">
              Create one free
            </Link>
          </p>
        </div>

        {/* Demo admin hint */}
        <p className="mt-4 text-center text-xs text-[#444]">
          Register with <span className="text-[#555]">admin@goatrition.com</span> to get admin access
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
