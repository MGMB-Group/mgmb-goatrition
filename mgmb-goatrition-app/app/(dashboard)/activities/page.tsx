'use client'

import { Dumbbell, Clock, Flame, Zap, Plus } from 'lucide-react'

const ACTIVITY_TYPES = [
  { name: 'Boxing', icon: '🥊', desc: 'Sparring, bag work, pad work', met: 9.5 },
  { name: 'Muay Thai', icon: '🦵', desc: 'Clinch, kicks, combinations', met: 10 },
  { name: 'MMA', icon: '🥋', desc: 'Mixed martial arts training', met: 10.5 },
  { name: 'Running', icon: '🏃', desc: 'Cardio endurance training', met: 8.5 },
  { name: 'Gym / Weights', icon: '🏋️', desc: 'Strength and conditioning', met: 6 },
  { name: 'Wrestling', icon: '🤼', desc: 'Takedowns, grappling', met: 8 },
]

export default function ActivitiesPage() {
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
          Activities
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Log training sessions and track calories burned — coming in Phase 2.
        </p>
      </div>

      {/* Preview of activity types */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {ACTIVITY_TYPES.map(({ name, desc, met }) => (
          <div
            key={name}
            className="flex items-center gap-4 rounded-lg border border-[#1e1e1e] bg-[#111] p-4 opacity-60"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[#dc2626]/10">
              <Dumbbell size={18} className="text-[#dc2626]" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="font-display text-lg font-bold uppercase tracking-wide text-white"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                {name}
              </p>
              <p className="truncate text-xs text-[#555]">{desc}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#dc2626]">MET {met}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What's coming */}
      <div className="rounded-lg border border-[#222] bg-[#111] p-6">
        <h2
          className="mb-4 font-display text-2xl font-black uppercase tracking-wide text-white"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          What's Coming in Phase 2
        </h2>
        <ul className="space-y-3">
          {[
            { icon: Plus,   text: 'Log any activity type with duration and intensity' },
            { icon: Flame,  text: 'MET-based calorie burn calculation' },
            { icon: Clock,  text: 'Daily activity history per date' },
            { icon: Dumbbell, text: 'Net calorie integration with dashboard' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-[#9ca3af]">
              <Icon size={16} className="mt-0.5 flex-shrink-0 text-[#dc2626]" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
