'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Camera, Dumbbell, BarChart3, Swords, ChevronRight, Shield, Zap } from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuth } from '@/lib/context'
import { AuthProvider } from '@/lib/context'

function LandingContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isLoading && user) router.replace('/dashboard')
  }, [user, isLoading, router])

  if (!mounted || isLoading) return null

  return (
    <div className="min-h-screen bg-[#080808] bg-tactical-grid font-sans">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-[#1e1e1e]/50 bg-[#080808]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo size="sm" linkTo="/" />
          <nav className="flex items-center gap-3" aria-label="Auth navigation">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#9ca3af] transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 rounded bg-[#dc2626] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#ef4444]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Get Started <ChevronRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/GXsrVLHVmJqnk7RIaoEqp-IqCOGLd3HI4DKiibQ79SIxDQUYxEHp.png"
            alt="MGMB Goatrition fighter brand identity with boxing gloves and red badge logo"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#dc2626]">
            <Zap size={12} />
            Free Early Access — Limited Spots
          </div>

          <h1
            className="mb-4 font-display text-6xl font-black uppercase leading-none tracking-tight text-white sm:text-8xl md:text-9xl"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            MGMB
            <br />
            <span className="text-[#dc2626]">GOATRITION</span>
          </h1>

          <p
            className="mb-3 font-display text-2xl font-bold uppercase tracking-[0.3em] text-[#9ca3af] sm:text-3xl"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Fuel discipline. Track power.
          </p>

          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[#6b7280]">
            The nutrition tracker engineered for fighters. AI meal analysis, MET-based calorie burn, macro targets — everything a serious athlete needs.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded bg-[#dc2626] px-8 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-[#ef4444] animate-pulse-red"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              <Flame size={18} />
              Start Free Now
            </Link>
            <Link
              href="/login"
              className="rounded border border-[#333] px-8 py-4 text-base font-bold uppercase tracking-widest text-[#9ca3af] transition-all hover:border-[#555] hover:text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Login
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-4 border-t border-[#1e1e1e] pt-10 sm:grid-cols-3">
            {[
              { value: '5', label: 'Free AI Scans / Week' },
              { value: '20+', label: 'Activity Types' },
              { value: '100%', label: 'Fighter Focused' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="font-display text-3xl font-black text-[#dc2626] sm:text-4xl"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-wider text-[#6b7280]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-14 text-center">
          <h2
            className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Built for the <span className="text-[#dc2626]">Grind</span>
          </h2>
          <p className="mt-3 text-[#6b7280]">Every feature designed around how fighters eat and train.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Camera,
              title: 'AI Meal Scanner',
              desc: 'Snap a photo of your meal and get instant macro breakdown. 5 free scans per week.',
              badge: 'Free Tier',
            },
            {
              icon: Dumbbell,
              title: 'Activity Tracker',
              desc: 'Log boxing, MMA, gym sessions and more. MET-based formula estimates real calories burned.',
              badge: null,
            },
            {
              icon: BarChart3,
              title: 'Macro Targets',
              desc: 'Set protein, carb and fat targets. Daily progress bars show where you stand at a glance.',
              badge: null,
            },
            {
              icon: Swords,
              title: 'Fighter Mode',
              desc: 'Weight cut progress tracker, daily compliance score and 7-day performance summary.',
              badge: 'Exclusive',
            },
            {
              icon: Flame,
              title: 'Net Calories',
              desc: 'Calories in minus calories burned equals your net daily score. Stay on target or adjust.',
              badge: null,
            },
            {
              icon: Shield,
              title: 'GOAT PRO',
              desc: 'Unlimited scans, advanced analytics, and priority access. Coming soon — join the waitlist.',
              badge: 'Coming Soon',
            },
          ].map(({ icon: Icon, title, desc, badge }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-lg border border-[#1e1e1e] bg-[#111] p-6 transition-all hover:border-[#dc2626]/30 hover:bg-[#141414]"
            >
              {badge && (
                <span className="absolute right-3 top-3 rounded bg-[#dc2626]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#dc2626]">
                  {badge}
                </span>
              )}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded bg-[#dc2626]/10">
                <Icon size={20} className="text-[#dc2626]" />
              </div>
              <h3
                className="mb-2 font-display text-xl font-bold uppercase tracking-wide text-white"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[#6b7280]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1e1e1e] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2
            className="mb-4 font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Ready to <span className="text-[#dc2626]">Dominate?</span>
          </h2>
          <p className="mb-8 text-[#6b7280]">Free to start. No credit card. Built for fighters who take their nutrition seriously.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded bg-[#dc2626] px-10 py-4 text-lg font-black uppercase tracking-widest text-white transition-all hover:bg-[#ef4444]"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            <Flame size={20} />
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo size="sm" showText={true} />
            <p className="text-xs text-[#555]">
              &copy; {new Date().getFullYear()} MGMB Goatrition. Fuel Discipline. Track Power.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  )
}
