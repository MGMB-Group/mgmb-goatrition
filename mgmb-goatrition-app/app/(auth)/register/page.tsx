'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import { AuthProvider, useAuth } from '@/lib/context'
import { usersStore, genId } from '@/lib/store'
import { hashPassword } from '@/lib/auth-utils'
import type { User } from '@/lib/types'

function RegisterForm() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard')
  }, [user, isLoading, router])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      const existing = usersStore.findByEmail(form.email)
      if (existing) { setErrors({ email: 'Email already in use' }); return }

      const isAdmin = form.email.toLowerCase() === 'admin@goatrition.com'

      const newUser: User = {
        id: genId(),
        email: form.email.trim().toLowerCase(),
        password: hashPassword(form.password),
        name: form.name.trim(),
        role: isAdmin ? 'admin' : 'user',
        // Sensible defaults
        dailyCalorieTarget: 2500,
        proteinTarget: 180,
        carbsTarget: 250,
        fatTarget: 70,
        goal: 'maintain',
        fighterMode: false,
        createdAt: new Date().toISOString(),
      }
      usersStore.create(newUser)
      login(newUser.id)
      router.push('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  const pwStrength =
    form.password.length === 0 ? 0
    : form.password.length < 8 ? 1
    : form.password.length < 12 ? 2
    : 3

  if (isLoading) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] bg-tactical-grid px-4 py-10">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" linkTo="/" />
        </div>

        <div className="rounded-lg border border-[#222] bg-[#111] p-8 shadow-2xl">
          <h1
            className="mb-1 font-display text-3xl font-black uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Create Account
          </h1>
          <p className="mb-6 text-sm text-[#6b7280]">Join the fighters tracking smart</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]" htmlFor="name">
                Fighter Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#555] transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
                  <AlertCircle size={12} />{errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]" htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#555] transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                placeholder="fighter@gym.com"
              />
              {errors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
                  <AlertCircle size={12} />{errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]" htmlFor="reg-pw">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 pr-10 text-sm text-white placeholder-[#555] transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                  placeholder="Min 8 characters"
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
              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          pwStrength >= n
                            ? n === 1 ? '#dc2626' : n === 2 ? '#f59e0b' : '#22c55e'
                            : '#1e1e1e',
                      }}
                    />
                  ))}
                </div>
              )}
              {errors.password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
                  <AlertCircle size={12} />{errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]" htmlFor="confirm">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 pr-9 text-sm text-white placeholder-[#555] transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                  placeholder="Repeat password"
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#22c55e]" />
                )}
              </div>
              {errors.confirm && (
                <p className="mt-1 flex items-center gap-1 text-xs text-[#f87171]">
                  <AlertCircle size={12} />{errors.confirm}
                </p>
              )}
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
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#6b7280]">
            Already a fighter?{' '}
            <Link href="/login" className="font-medium text-[#dc2626] hover:text-[#ef4444]">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  )
}
