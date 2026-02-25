'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Camera, TrendingUp, Zap, RefreshCw,
  ShieldAlert, BarChart3, Target,
} from 'lucide-react'
import { useAuth } from '@/lib/context'
import { adminStore, earlyAccessStore, usersStore } from '@/lib/store'
import type { AdminStats, EarlyAccessSignup } from '@/lib/types'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div className={`rounded-lg border p-5 ${accent ? 'border-[#dc2626]/30 bg-[#dc2626]/5' : 'border-[#1e1e1e] bg-[#111]'}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-[#6b7280]">{label}</span>
        <Icon size={16} className={accent ? 'text-[#dc2626]' : 'text-[#6b7280]'} />
      </div>
      <p
        className="font-black leading-none text-white"
        style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2rem' }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-[#6b7280]">{sub}</p>}
    </div>
  )
}

// ─── Pct bar ──────────────────────────────────────────────────────────────────
function PctBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-[#9ca3af]">{label}</span>
        <span className="font-mono font-bold text-white">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
        <div
          className="macro-fill h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isLoading: loading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [signups, setSignups] = useState<EarlyAccessSignup[]>([])
  const [lastRefreshed, setLastRefreshed] = useState<string>('')

  function loadData() {
    setStats(adminStore.getStats())
    setSignups(earlyAccessStore.getAll().slice().reverse())
    setLastRefreshed(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === 'admin') loadData()
  }, [user])

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#333] border-t-[#dc2626]" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
            <ShieldAlert size={11} />
            Admin Only
          </div>
          <h1
            className="font-black uppercase tracking-tight text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(2rem, 7vw, 3rem)' }}
          >
            Validation Analytics
          </h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            Real-time insights from localStorage — last updated {lastRefreshed}
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded border border-[#222] bg-[#111] px-4 py-2 text-sm text-[#9ca3af] transition-colors hover:bg-[#1a1a1a] hover:text-white"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Primary stat grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          sub="registered accounts"
          icon={Users}
        />
        <StatCard
          label="Total Scans"
          value={stats.totalScans}
          sub="lifetime AI scans"
          icon={Camera}
        />
        <StatCard
          label="Avg Scans / User"
          value={stats.avgScansPerUser}
          sub={`out of ${5} free`}
          icon={BarChart3}
        />
        <StatCard
          label="Early Access"
          value={stats.totalEarlyAccessSignups}
          sub="signups collected"
          icon={Zap}
          accent
        />
      </div>

      {/* Funnel metrics */}
      <div className="mb-4 rounded-lg border border-[#1e1e1e] bg-[#111] p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#dc2626]" />
          <h2
            className="font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Validation Funnel
          </h2>
        </div>

        <div className="space-y-4">
          <PctBar
            label={`Users who hit scan limit (${stats.usersWhoHitLimit} of ${stats.totalUsers})`}
            pct={stats.pctUsersHitLimit}
            color="#f59e0b"
          />
          <PctBar
            label={`Limit-hit users who clicked Early Access (${stats.usersWhoClickedEarlyAccess} of ${stats.usersWhoHitLimit})`}
            pct={stats.pctClickedEarlyAccess}
            color="#dc2626"
          />
        </div>

        {/* Funnel summary */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#1e1e1e] pt-4">
          {[
            { label: 'Registered', value: stats.totalUsers, color: '#6b7280' },
            { label: 'Hit Limit', value: stats.usersWhoHitLimit, color: '#f59e0b' },
            { label: 'Clicked EA', value: stats.usersWhoClickedEarlyAccess, color: '#dc2626' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg bg-[#0d0d0d] px-3 py-3 text-center">
              <p
                className="font-black leading-none"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.75rem', color }}
              >
                {value}
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Target indicator */}
      <div className="mb-4 rounded-lg border border-[#1e1e1e] bg-[#111] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Target size={16} className="text-[#6b7280]" />
          <h2
            className="font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Validation Targets
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: '% Users Hitting Limit',
              current: stats.pctUsersHitLimit,
              target: 30,
              description: 'Healthy engagement signal',
            },
            {
              label: '% Clicking Early Access',
              current: stats.pctClickedEarlyAccess,
              target: 50,
              description: 'Demand conversion rate',
            },
            {
              label: 'Early Access Signups',
              current: stats.totalEarlyAccessSignups,
              target: 50,
              description: 'Absolute signup goal',
            },
          ].map(({ label, current, target, description }) => {
            const achieved = current >= target
            return (
              <div key={label} className={`rounded-lg border p-3 ${achieved ? 'border-[#22c55e]/25 bg-[#22c55e]/5' : 'border-[#1e1e1e] bg-[#0d0d0d]'}`}>
                <p className="mb-0.5 text-xs font-medium text-[#9ca3af]">{label}</p>
                <p className={`text-xl font-black ${achieved ? 'text-[#22c55e]' : 'text-white'}`}
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {current}{typeof current === 'number' && label.includes('%') ? '' : ''}
                  <span className="text-sm font-normal text-[#555]"> / {target}</span>
                </p>
                <p className="mt-1 text-[10px] text-[#555]">{description}</p>
                {achieved && (
                  <span className="mt-1.5 inline-block rounded bg-[#22c55e]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#22c55e]">
                    Target Hit
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Early Access signup table */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111]">
        <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#dc2626]" />
            <h2
              className="font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Early Access Signups
            </h2>
          </div>
          <span className="rounded bg-[#dc2626]/15 px-2 py-0.5 text-xs font-bold text-[#dc2626]">
            {signups.length} total
          </span>
        </div>

        {signups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Zap size={24} className="text-[#333]" />
            <p className="text-sm text-[#555]">No early access signups yet.</p>
            <p className="text-xs text-[#333]">Signups appear here when users hit the scan limit and submit the form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['Email', 'Discipline', 'Goal', 'Weight Class', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#6b7280]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {signups.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3 text-white">{s.email}</td>
                    <td className="px-4 py-3 capitalize text-[#9ca3af]">{s.trainingType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 capitalize text-[#9ca3af]">{s.goal}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{s.weightClass ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#555]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
