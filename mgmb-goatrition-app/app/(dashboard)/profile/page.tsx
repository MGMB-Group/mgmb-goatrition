'use client'

import { useState } from 'react'
import { User, Save, CheckCircle, Zap } from 'lucide-react'
import { useAuth } from '@/lib/context'
import { usersStore } from '@/lib/store'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name:              user?.name              ?? '',
    weight:            String(user?.weight     ?? ''),
    height:            String(user?.height     ?? ''),
    age:               String(user?.age        ?? ''),
    sex:               user?.sex               ?? 'male',
    goal:              user?.goal              ?? 'maintain',
    dailyCalorieTarget:String(user?.dailyCalorieTarget ?? 2500),
    proteinTarget:     String(user?.proteinTarget      ?? 180),
    carbsTarget:       String(user?.carbsTarget        ?? 250),
    fatTarget:         String(user?.fatTarget          ?? 70),
  })

  if (!user) return null

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave(e: React.FormEvent) {
  e.preventDefault()

  if (!user) return

  usersStore.update(user.id, {
      name:               form.name,
      weight:             form.weight  ? Number(form.weight)  : undefined,
      height:             form.height  ? Number(form.height)  : undefined,
      age:                form.age     ? Number(form.age)     : undefined,
      sex:                form.sex     as 'male' | 'female',
      goal:               form.goal    as 'lose' | 'maintain' | 'gain',
      dailyCalorieTarget: Number(form.dailyCalorieTarget) || 2500,
      proteinTarget:      Number(form.proteinTarget)      || 180,
      carbsTarget:        Number(form.carbsTarget)        || 250,
      fatTarget:          Number(form.fatTarget)          || 70,
    })
    refreshUser()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputCls =
    'w-full rounded border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#555] transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]'
  const labelCls =
    'mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]'

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1
            className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Profile
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">Manage your athlete profile and nutrition targets.</p>
        </div>
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#dc2626]/15">
          <User size={22} className="text-[#dc2626]" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identity */}
        <section className="rounded-lg border border-[#222] bg-[#111] p-5">
          <h2
            className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Identity
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="p-name">Fighter Name</label>
              <input
                id="p-name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputCls}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="p-sex">Sex</label>
              <select
                id="p-sex"
                value={form.sex}
                onChange={(e) => handleChange('sex', e.target.value)}
                className={inputCls}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className={labelCls} htmlFor="p-age">Age</label>
              <input
                id="p-age"
                type="number"
                min={10}
                max={100}
                value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className={inputCls}
                placeholder="Years"
              />
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="rounded-lg border border-[#222] bg-[#111] p-5">
          <h2
            className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Body Metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-weight">Body Weight (kg)</label>
              <input
                id="p-weight"
                type="number"
                min={30}
                max={300}
                step={0.1}
                value={form.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className={inputCls}
                placeholder="e.g. 75"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-height">Height (cm)</label>
              <input
                id="p-height"
                type="number"
                min={100}
                max={250}
                value={form.height}
                onChange={(e) => handleChange('height', e.target.value)}
                className={inputCls}
                placeholder="e.g. 178"
              />
            </div>
          </div>
        </section>

        {/* Goal */}
        <section className="rounded-lg border border-[#222] bg-[#111] p-5">
          <h2
            className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Goal
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(['lose', 'maintain', 'gain'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleChange('goal', g)}
                className={`rounded border py-3 text-sm font-bold uppercase tracking-wider transition ${
                  form.goal === g
                    ? 'border-[#dc2626] bg-[#dc2626]/15 text-[#dc2626]'
                    : 'border-[#222] bg-[#1a1a1a] text-[#6b7280] hover:border-[#333] hover:text-white'
                }`}
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                {g === 'lose' ? 'Cut' : g === 'maintain' ? 'Maintain' : 'Bulk'}
              </button>
            ))}
          </div>
        </section>

        {/* Nutrition targets */}
        <section className="rounded-lg border border-[#222] bg-[#111] p-5">
          <h2
            className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Daily Targets
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="p-cal">
                Calories (kcal)
              </label>
              <input
                id="p-cal"
                type="number"
                min={800}
                max={8000}
                value={form.dailyCalorieTarget}
                onChange={(e) => handleChange('dailyCalorieTarget', e.target.value)}
                className={inputCls}
              />
            </div>
            {[
              { id: 'p-pro', label: 'Protein (g)', field: 'proteinTarget', color: '#ef4444' },
              { id: 'p-carb', label: 'Carbohydrates (g)', field: 'carbsTarget', color: '#f59e0b' },
              { id: 'p-fat', label: 'Fat (g)', field: 'fatTarget', color: '#3b82f6' },
            ].map(({ id, label, field, color }) => (
              <div key={field}>
                <label
                  className="mb-1 block text-xs font-medium uppercase tracking-wider"
                  style={{ color }}
                  htmlFor={id}
                >
                  {label}
                </label>
                <input
                  id={id}
                  type="number"
                  min={0}
                  max={1000}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Fighter Mode teaser */}
        <div className="flex items-center justify-between rounded-lg border border-[#dc2626]/20 bg-[#dc2626]/8 px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#dc2626]" />
            <span className="text-sm font-medium text-white">Fighter Mode</span>
          </div>
          <span className="rounded bg-[#dc2626]/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#dc2626]">
            Phase 2
          </span>
        </div>

        {/* Save */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded bg-[#dc2626] py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#ef4444] active:scale-[0.98]"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          {saved ? (
            <>
              <CheckCircle size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  )
}
