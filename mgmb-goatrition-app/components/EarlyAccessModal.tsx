'use client'

import { useState } from 'react'
import { X, Flame, Zap, ChevronRight, Camera, TrendingUp, Shield } from 'lucide-react'
import { earlyAccessStore, scanStore, genId, MAX_FREE_SCANS } from '@/lib/store'
import { useAuth } from '@/lib/context'

interface EarlyAccessModalProps {
  open: boolean
  onClose: () => void
  /** If true, shows the scan-limit exceeded banner at the top */
  limitReached?: boolean
}

const TRAINING_TYPES = [
  { value: 'boxing', label: 'Boxing' },
  { value: 'muay_thai', label: 'Muay Thai' },
  { value: 'mma', label: 'MMA' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'other', label: 'Other' },
]

const GOALS = [
  { value: 'cut', label: 'Cut Weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'bulk', label: 'Bulk Up' },
]

const WEIGHT_CLASSES = [
  '', 'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
  'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight',
]

export default function EarlyAccessModal({ open, onClose, limitReached = false }: EarlyAccessModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    email: user?.email ?? '',
    trainingType: '',
    weightClass: '',
    goal: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.trainingType) e.trainingType = 'Select your discipline'
    if (!form.goal) e.goal = 'Select your goal'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      earlyAccessStore.create({
        id: genId(),
        userId: user?.id,
        email: form.email,
        trainingType: form.trainingType,
        weightClass: form.weightClass || undefined,
        goal: form.goal,
        createdAt: new Date().toISOString(),
      })
      // Track that this user clicked Early Access (for admin analytics)
      if (user?.id) {
        scanStore.markEarlyAccessClicked(user.id)
      }
      setStep('success')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="early-access-title"
    >
      <div className="relative w-full max-w-md animate-fade-in-up rounded-lg border border-[#222] bg-[#111] shadow-2xl">
        {/* Red accent top bar */}
        <div className="h-1 w-full rounded-t-lg bg-[#dc2626]" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6b7280] transition-colors hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {step === 'form' ? (
            <>
              {/* Scan limit banner — shown when user hits the weekly cap */}
              {limitReached && (
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3">
                  <Camera size={16} className="mt-0.5 flex-shrink-0 text-[#dc2626]" />
                  <div>
                    <p className="text-sm font-bold text-[#dc2626]">Weekly scan limit reached</p>
                    <p className="mt-0.5 text-xs text-[#9ca3af]">
                      You&apos;ve used all {MAX_FREE_SCANS} free scans this week. Limit resets every Monday.
                    </p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#dc2626]/15 ring-1 ring-[#dc2626]/30">
                  <Flame size={22} className="text-[#dc2626]" />
                </div>
                <div>
                  <h2
                    id="early-access-title"
                    className="font-black uppercase tracking-wide text-white"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.5rem' }}
                  >
                    GOAT PRO
                  </h2>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#dc2626]">
                    Unlimited Scans — Coming Soon
                  </p>
                </div>
              </div>

              {/* Pro feature pills */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { icon: Camera, label: 'Unlimited Scans' },
                  { icon: TrendingUp, label: 'Advanced Stats' },
                  { icon: Shield, label: 'Fighter Tools' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] px-2 py-3 text-center"
                  >
                    <Icon size={16} className="text-[#dc2626]" />
                    <span className="text-[10px] font-medium leading-tight text-[#9ca3af]">{label}</span>
                  </div>
                ))}
              </div>

              <p className="mb-5 text-sm leading-relaxed text-[#6b7280]">
                Built for fighters in serious training. Be first in line when GOAT PRO launches.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#444] transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]/50"
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-[#dc2626]">{errors.email}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]">
                    Training Discipline
                  </label>
                  <select
                    value={form.trainingType}
                    onChange={(e) => setForm({ ...form, trainingType: e.target.value })}
                    className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white transition-colors focus:border-[#dc2626]"
                  >
                    <option value="">Select discipline</option>
                    {TRAINING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {errors.trainingType && <p className="mt-1 text-xs text-[#dc2626]">{errors.trainingType}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]">
                      Weight Class
                    </label>
                    <select
                      value={form.weightClass}
                      onChange={(e) => setForm({ ...form, weightClass: e.target.value })}
                      className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white focus:border-[#dc2626]"
                    >
                      <option value="">Optional</option>
                      {WEIGHT_CLASSES.filter(Boolean).map((wc) => (
                        <option key={wc} value={wc}>{wc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]">
                      Current Goal
                    </label>
                    <select
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      className="w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white focus:border-[#dc2626]"
                    >
                      <option value="">Select goal</option>
                      {GOALS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                    {errors.goal && <p className="mt-1 text-xs text-[#dc2626]">{errors.goal}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[#dc2626] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#ef4444] active:scale-[0.98] disabled:opacity-60"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {submitting ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Zap size={15} />
                      Join Early Access
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="py-4 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dc2626]/10 ring-2 ring-[#dc2626]/30 animate-pulse-red">
                    <Zap size={36} className="text-[#dc2626]" />
                  </div>
                </div>
              </div>
              <h2
                className="mb-1 font-black uppercase tracking-wide text-white"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2rem' }}
              >
                YOU&apos;RE IN
              </h2>
              <p className="mb-1 text-sm font-medium text-[#dc2626] uppercase tracking-widest">
                Early Access Confirmed
              </p>
              <p className="mb-6 text-sm text-[#6b7280]">
                We&apos;ll notify you the moment GOAT PRO goes live. Stay disciplined.
              </p>
              {/* Weekly reset reminder */}
              {limitReached && (
                <p className="mb-4 rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] px-4 py-3 text-xs text-[#6b7280]">
                  Your weekly scan limit resets every Monday at midnight.
                </p>
              )}
              <button
                onClick={onClose}
                className="rounded border border-[#222] bg-[#1a1a1a] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#222]"
              >
                Back to Training
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
