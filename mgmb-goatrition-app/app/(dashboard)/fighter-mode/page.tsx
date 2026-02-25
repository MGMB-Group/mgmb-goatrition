'use client'

import { Swords, Zap, Scale, BarChart3, Target, TrendingDown } from 'lucide-react'

export default function FighterModePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#dc2626]/25 bg-[#dc2626]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#dc2626]">
          <Zap size={11} />
          Phase 2
        </div>
        <h1
          className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Fighter Mode
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Built for athletes preparing for competition — weight cuts, compliance, peak performance.
        </p>
      </div>

      {/* Hero preview */}
      <div className="mb-6 overflow-hidden rounded-lg border border-[#dc2626]/20 bg-gradient-to-br from-[#dc2626]/8 to-transparent">
        <div className="relative p-6">
          <div className="absolute right-4 top-4">
            <div className="rounded-full border border-[#dc2626]/30 bg-[#dc2626]/10 p-3">
              <Swords size={22} className="text-[#dc2626]" />
            </div>
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#dc2626]">
            EXCLUSIVE FEATURE
          </p>
          <h2
            className="mb-2 font-display text-3xl font-black uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Competition Prep Mode
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-[#9ca3af]">
            The only tracker built around a fighter's real schedule — weight classes, cut phases,
            and daily performance targets.
          </p>
        </div>

        {/* Mock 7-day compliance grid */}
        <div className="border-t border-[#dc2626]/15 px-6 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6b7280]">
            7-Day Compliance Preview
          </p>
          <div className="flex gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="h-14 w-full rounded opacity-30"
                  style={{
                    backgroundColor: [75, 92, 60, 88, 0, 100, 0][i] > 0 ? '#dc2626' : '#1e1e1e',
                    height: `${Math.max(8, [75, 92, 60, 88, 0, 100, 0][i] * 0.56)}px`,
                    minHeight: 8,
                  }}
                />
                <span className="text-[9px] font-medium text-[#555]">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            icon: Scale,
            title: 'Weight Cut Tracker',
            desc: 'Monitor daily weigh-ins against your target weight class. Visual progress toward fight weight.',
          },
          {
            icon: Target,
            title: 'Daily Compliance Score',
            desc: 'Hit your calorie and protein targets? Get a compliance percentage for each day.',
          },
          {
            icon: BarChart3,
            title: '7-Day Summary Card',
            desc: 'Weekly performance snapshot — average intake, compliance rate, weight trend.',
          },
          {
            icon: TrendingDown,
            title: 'Cut Phase Planning',
            desc: 'Set fight date, current weight, and target weight. Auto-calculate safe daily deficit.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-lg border border-[#1e1e1e] bg-[#111] p-5 opacity-70"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded bg-[#dc2626]/10">
              <Icon size={17} className="text-[#dc2626]" />
            </div>
            <h3
              className="mb-1.5 font-display text-lg font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              {title}
            </h3>
            <p className="text-xs leading-relaxed text-[#6b7280]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
