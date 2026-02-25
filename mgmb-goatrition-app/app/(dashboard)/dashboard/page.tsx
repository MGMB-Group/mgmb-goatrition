'use client'

import { useState, useEffect } from 'react'
import { Flame, TrendingDown, Dumbbell, Target, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { mealsStore, activitiesStore, todayStr } from '@/lib/store'
import MacroProgress from '@/components/MacroProgress'
import type { Meal, Activity } from '@/lib/types'

interface DayTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  burned: number
}

function calcTotals(meals: Meal[], activities: Activity[]): DayTotals {
  const calories = meals.reduce((s, m) => s + m.items.reduce((si, i) => si + i.calories, 0), 0)
  const protein = meals.reduce((s, m) => s + m.items.reduce((si, i) => si + i.protein, 0), 0)
  const carbs = meals.reduce((s, m) => s + m.items.reduce((si, i) => si + i.carbs, 0), 0)
  const fat = meals.reduce((s, m) => s + m.items.reduce((si, i) => si + i.fat, 0), 0)
  const burned = activities.reduce((s, a) => s + a.caloriesBurned, 0)
  return { calories, protein: Math.round(protein * 10) / 10, carbs: Math.round(carbs * 10) / 10, fat: Math.round(fat * 10) / 10, burned }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(todayStr())
  const [meals, setMeals] = useState<Meal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!user) return
    setMeals(mealsStore.getByDate(user.id, date))
    setActivities(activitiesStore.getByDate(user.id, date))
  }, [user, date])

  const totals = calcTotals(meals, activities)
  const netCalories = totals.calories - totals.burned
  const calorieTarget = user?.dailyCalorieTarget ?? 2500
  const proteinTarget = user?.proteinTarget ?? 180
  const carbsTarget = user?.carbsTarget ?? 250
  const fatTarget = user?.fatTarget ?? 70
  const calorieBalance = netCalories - calorieTarget
  const progress = calorieTarget > 0 ? Math.min((netCalories / calorieTarget) * 100, 100) : 0

  function fmtDate(d: string) {
    const today = todayStr()
    const yest = new Date(); yest.setDate(yest.getDate() - 1)
    if (d === today) return 'Today'
    if (d === yest.toISOString().split('T')[0]) return 'Yesterday'
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  function changeDate(delta: number) {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    setDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[#6b7280]">
            Welcome back, <span className="font-medium text-[#dc2626]">{user?.name}</span>
          </p>
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-2 rounded-lg border border-[#222] bg-[#111] px-3 py-2">
          <button
            onClick={() => changeDate(-1)}
            className="text-[#6b7280] transition hover:text-white"
            aria-label="Previous day"
          >
            ‹
          </button>
          <span className="min-w-[100px] text-center text-sm font-medium text-white">
            {fmtDate(date)}
          </span>
          <button
            onClick={() => changeDate(1)}
            disabled={date >= todayStr()}
            className="text-[#6b7280] transition hover:text-white disabled:opacity-30"
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </div>

      {/* Calorie ring + stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net calories card */}
        <div className="col-span-full sm:col-span-2 lg:col-span-1 rounded-lg border border-[#222] bg-[#111] p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6b7280]">
            <Target size={14} />
            Net Calories
          </div>
          <div
            className={`font-display text-5xl font-black tabular-nums ${
              netCalories > calorieTarget ? 'text-[#f59e0b]' : 'text-white'
            }`}
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            {netCalories.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Target: <span className="text-white">{calorieTarget.toLocaleString()} kcal</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                backgroundColor: netCalories > calorieTarget ? '#f59e0b' : '#dc2626',
              }}
            />
          </div>
          <div className={`mt-1 text-xs font-medium ${calorieBalance > 0 ? 'text-[#f59e0b]' : 'text-[#22c55e]'}`}>
            {calorieBalance > 0 ? `+${calorieBalance} over` : `${Math.abs(calorieBalance)} remaining`}
          </div>
        </div>

        {/* Stats cards */}
        {[
          { label: 'Calories In', value: totals.calories.toLocaleString(), unit: 'kcal', icon: Flame, color: '#dc2626' },
          { label: 'Burned', value: totals.burned.toLocaleString(), unit: 'kcal', icon: Dumbbell, color: '#3b82f6' },
          { label: 'Meals Logged', value: meals.length.toString(), unit: 'meals', icon: TrendingDown, color: '#22c55e' },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-[#222] bg-[#111] p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6b7280]">
              <Icon size={14} style={{ color }} />
              {label}
            </div>
            <div
              className="font-display text-4xl font-black text-white tabular-nums"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              {value}
            </div>
            <div className="mt-1 text-xs text-[#555]">{unit}</div>
          </div>
        ))}
      </div>

      {/* Macro progress */}
      <div className="mb-5 rounded-lg border border-[#222] bg-[#111] p-5">
        <h2
          className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-white"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Macro Breakdown
        </h2>
        <div className="space-y-4">
          <MacroProgress label="Protein" current={totals.protein} target={proteinTarget} color="#ef4444" />
          <MacroProgress label="Carbohydrates" current={totals.carbs} target={carbsTarget} color="#f59e0b" />
          <MacroProgress label="Fat" current={totals.fat} target={fatTarget} color="#3b82f6" />
        </div>
      </div>

      {/* Quick actions + recent meals/activities */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Meals */}
        <div className="rounded-lg border border-[#222] bg-[#111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="font-display text-lg font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Meals Today
            </h2>
            <Link
              href="/meals"
              className="flex items-center gap-1 text-xs font-medium text-[#dc2626] transition hover:text-[#ef4444]"
            >
              <Plus size={14} />
              Add
            </Link>
          </div>
          {meals.length === 0 ? (
            <div className="rounded border border-dashed border-[#222] py-8 text-center">
              <p className="text-sm text-[#555]">No meals logged</p>
              <Link
                href="/meals"
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#dc2626] hover:text-[#ef4444]"
              >
                <Plus size={12} />Log your first meal
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {meals.slice(0, 4).map((meal) => {
                const mCal = meal.items.reduce((s, i) => s + i.calories, 0)
                return (
                  <li key={meal.id} className="flex items-center justify-between rounded bg-[#1a1a1a] px-3 py-2">
                    <span className="text-sm font-medium capitalize text-white">{meal.name}</span>
                    <span className="text-sm font-semibold text-[#dc2626]">{mCal} kcal</span>
                  </li>
                )
              })}
              {meals.length > 4 && (
                <Link href="/meals" className="flex items-center justify-center gap-1 py-1 text-xs text-[#6b7280] hover:text-white">
                  +{meals.length - 4} more <ChevronRight size={12} />
                </Link>
              )}
            </ul>
          )}
        </div>

        {/* Activities */}
        <div className="rounded-lg border border-[#222] bg-[#111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="font-display text-lg font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Activities Today
            </h2>
            <Link
              href="/activities"
              className="flex items-center gap-1 text-xs font-medium text-[#dc2626] transition hover:text-[#ef4444]"
            >
              <Plus size={14} />
              Log
            </Link>
          </div>
          {activities.length === 0 ? (
            <div className="rounded border border-dashed border-[#222] py-8 text-center">
              <p className="text-sm text-[#555]">No activities logged</p>
              <Link
                href="/activities"
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#dc2626] hover:text-[#ef4444]"
              >
                <Plus size={12} />Log training session
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {activities.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded bg-[#1a1a1a] px-3 py-2">
                  <div>
                    <span className="text-sm font-medium capitalize text-white">{a.type}</span>
                    <span className="ml-2 text-xs text-[#6b7280]">{a.duration}min · {a.intensity}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#3b82f6]">-{a.caloriesBurned} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Fighter Mode CTA if not enabled */}
      {!user?.fighterMode && (
        <div className="mt-5 flex items-center justify-between rounded-lg border border-[#dc2626]/20 bg-[#dc2626]/8 p-4">
          <div>
            <p
              className="font-display text-lg font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Fighter Mode Available
            </p>
            <p className="text-xs text-[#9ca3af]">Weight cut tracker, compliance score, 7-day summary</p>
          </div>
          <Link
            href="/fighter-mode"
            className="flex-shrink-0 rounded bg-[#dc2626] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ef4444]"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Enable
          </Link>
        </div>
      )}
    </div>
  )
}
