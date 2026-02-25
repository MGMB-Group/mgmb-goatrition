'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useAuth } from '@/lib/context'
import { mealsStore, genId, todayStr } from '@/lib/store'
import { getNutrition } from '@/lib/nutrition'
import type { Meal, FoodItem } from '@/lib/types'

const MEAL_NAMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout']

interface NewFood {
  name: string
  grams: string
  calories: string
  protein: string
  carbs: string
  fat: string
  autoFilled: boolean
}

function emptyFood(): NewFood {
  return { name: '', grams: '', calories: '', protein: '', carbs: '', fat: '', autoFilled: false }
}

function MealCard({ meal, onDelete }: { meal: Meal; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const total = {
    cal: meal.items.reduce((s, i) => s + i.calories, 0),
    pro: meal.items.reduce((s, i) => s + i.protein, 0),
    carb: meal.items.reduce((s, i) => s + i.carbs, 0),
    fat: meal.items.reduce((s, i) => s + i.fat, 0),
  }

  return (
    <div className="rounded-lg border border-[#222] bg-[#111] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-[#6b7280] hover:text-white"
            aria-expanded={open}
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <div>
            <h3
              className="font-display text-lg font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              {meal.name}
            </h3>
            <p className="text-xs text-[#6b7280]">{meal.items.length} item{meal.items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-[#dc2626]">{total.cal} kcal</p>
            <p className="text-xs text-[#555]">
              P: {total.pro.toFixed(0)}g · C: {total.carb.toFixed(0)}g · F: {total.fat.toFixed(0)}g
            </p>
          </div>
          <button
            onClick={onDelete}
            className="rounded p-1.5 text-[#555] transition hover:bg-[#1e1e1e] hover:text-[#ef4444]"
            aria-label="Delete meal"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#1e1e1e] px-4 py-3">
          <table className="w-full text-xs" role="table" aria-label="Food items">
            <thead>
              <tr className="text-left text-[#555]">
                <th className="pb-2 font-medium">Food</th>
                <th className="pb-2 font-medium text-right">g</th>
                <th className="pb-2 font-medium text-right">kcal</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell">P</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell">C</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell">F</th>
              </tr>
            </thead>
            <tbody>
              {meal.items.map((item) => (
                <tr key={item.id} className="border-t border-[#1a1a1a] text-[#9ca3af]">
                  <td className="py-1.5 font-medium text-white capitalize">{item.name}</td>
                  <td className="py-1.5 text-right">{item.grams}</td>
                  <td className="py-1.5 text-right text-[#dc2626] font-medium">{item.calories}</td>
                  <td className="py-1.5 text-right hidden sm:table-cell">{item.protein}g</td>
                  <td className="py-1.5 text-right hidden sm:table-cell">{item.carbs}g</td>
                  <td className="py-1.5 text-right hidden sm:table-cell">{item.fat}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function MealsPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(todayStr())
  const [meals, setMeals] = useState<Meal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [mealName, setMealName] = useState('Breakfast')
  const [foods, setFoods] = useState<NewFood[]>([emptyFood()])
  const [lookingUp, setLookingUp] = useState<number | null>(null)

  function loadMeals() {
    if (!user) return
    setMeals(mealsStore.getByDate(user.id, date))
  }

  useEffect(() => { loadMeals() }, [user, date])

  async function lookupNutrition(idx: number) {
    const f = foods[idx]
    if (!f.name || !f.grams) return
    setLookingUp(idx)
    try {
      const res = await fetch('/api/nutrition/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name, grams: Number(f.grams) }),
      })
      const data = await res.json()
      if (data.calories != null) {
        const updated = [...foods]
        updated[idx] = {
          ...updated[idx],
          calories: String(data.calories),
          protein: String(data.protein),
          carbs: String(data.carbs),
          fat: String(data.fat),
          autoFilled: true,
        }
        setFoods(updated)
      }
    } finally {
      setLookingUp(null)
    }
  }

  function addFood() { setFoods([...foods, emptyFood()]) }
  function removeFood(i: number) { setFoods(foods.filter((_, idx) => idx !== i)) }
  function updateFood(i: number, field: keyof NewFood, val: string) {
    const updated = [...foods]
    updated[i] = { ...updated[i], [field]: val, autoFilled: field === 'name' || field === 'grams' ? false : updated[i].autoFilled }
    setFoods(updated)
  }

  function handleSave() {
    if (!user) return
    const items: FoodItem[] = foods
      .filter((f) => f.name && f.grams)
      .map((f) => ({
        id: genId(),
        name: f.name,
        grams: Number(f.grams),
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        carbs: Number(f.carbs) || 0,
        fat: Number(f.fat) || 0,
      }))
    if (!items.length) return
    const meal: Meal = {
      id: genId(),
      userId: user.id,
      date,
      name: mealName,
      items,
      createdAt: new Date().toISOString(),
    }
    mealsStore.create(user.id, meal)
    setShowForm(false)
    setFoods([emptyFood()])
    loadMeals()
  }

  function deleteMeal(id: string) {
    if (!user) return
    mealsStore.delete(user.id, id)
    loadMeals()
  }

  function fmtDate(d: string) {
    const today = todayStr()
    if (d === today) return 'Today'
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  function changeDate(delta: number) {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    setDate(d.toISOString().split('T')[0])
  }

  const dayTotal = {
    cal: meals.reduce((s, m) => s + m.items.reduce((si, i) => si + i.calories, 0), 0),
    pro: meals.reduce((s, m) => s + m.items.reduce((si, i) => si + i.protein, 0), 0),
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Meals
          </h1>
          <p className="text-sm text-[#6b7280]">{dayTotal.cal} kcal · {dayTotal.pro.toFixed(0)}g protein</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date nav */}
          <div className="flex items-center gap-1 rounded-lg border border-[#222] bg-[#111] px-2 py-1.5">
            <button onClick={() => changeDate(-1)} className="px-1 text-[#6b7280] hover:text-white">‹</button>
            <span className="min-w-[80px] text-center text-xs font-medium text-white">{fmtDate(date)}</span>
            <button onClick={() => changeDate(1)} disabled={date >= todayStr()} className="px-1 text-[#6b7280] hover:text-white disabled:opacity-30">›</button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded bg-[#dc2626] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#ef4444]"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            <Plus size={16} />
            Add Meal
          </button>
        </div>
      </div>

      {/* Meal list */}
      <div className="space-y-3">
        {meals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#222] py-16 text-center">
            <p className="text-[#555]">No meals logged for {fmtDate(date)}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 flex items-center gap-1.5 mx-auto text-sm text-[#dc2626] hover:text-[#ef4444]"
            >
              <Plus size={14} />Add your first meal
            </button>
          </div>
        ) : (
          meals.map((m) => (
            <MealCard key={m.id} meal={m} onDelete={() => deleteMeal(m.id)} />
          ))
        )}
      </div>

      {/* Add meal modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-meal-title"
        >
          <div className="w-full max-w-xl rounded-t-xl sm:rounded-xl border border-[#222] bg-[#111] shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
              <h2
                id="add-meal-title"
                className="font-display text-2xl font-black uppercase tracking-wide text-white"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                Add Meal
              </h2>
              <button onClick={() => setShowForm(false)} className="text-[#555] hover:text-white" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Meal name selector */}
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#6b7280]">
                  Meal Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_NAMES.map((n) => (
                    <button
                      key={n}
                      onClick={() => setMealName(n)}
                      className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                        mealName === n
                          ? 'bg-[#dc2626] text-white'
                          : 'bg-[#1a1a1a] text-[#9ca3af] hover:bg-[#222] hover:text-white'
                      }`}
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food items */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#6b7280]">Food Items</label>
                  <button
                    onClick={addFood}
                    className="flex items-center gap-1 text-xs text-[#dc2626] hover:text-[#ef4444]"
                  >
                    <Plus size={12} />Add item
                  </button>
                </div>

                <div className="space-y-3">
                  {foods.map((f, i) => (
                    <div key={i} className="rounded-lg border border-[#1e1e1e] bg-[#161616] p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Food name"
                          value={f.name}
                          onChange={(e) => updateFood(i, 'name', e.target.value)}
                          className="flex-1 rounded border border-[#222] bg-[#1a1a1a] px-2.5 py-2 text-sm text-white placeholder-[#555] focus:border-[#dc2626]"
                        />
                        <input
                          type="number"
                          placeholder="grams"
                          value={f.grams}
                          onChange={(e) => updateFood(i, 'grams', e.target.value)}
                          className="w-20 rounded border border-[#222] bg-[#1a1a1a] px-2.5 py-2 text-sm text-white placeholder-[#555] focus:border-[#dc2626]"
                          min={1}
                        />
                        <button
                          onClick={() => lookupNutrition(i)}
                          disabled={lookingUp === i || !f.name || !f.grams}
                          title="Auto-fill nutrition"
                          className="flex-shrink-0 rounded border border-[#222] bg-[#1a1a1a] p-2 text-[#6b7280] transition hover:border-[#dc2626]/40 hover:text-[#dc2626] disabled:opacity-40"
                        >
                          {lookingUp === i ? (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#555] border-t-[#dc2626]" />
                          ) : (
                            <Search size={14} />
                          )}
                        </button>
                        {foods.length > 1 && (
                          <button onClick={() => removeFood(i)} className="text-[#555] hover:text-[#ef4444]">
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'kcal', field: 'calories' as const, color: '#dc2626' },
                          { label: 'Protein', field: 'protein' as const, color: '#ef4444' },
                          { label: 'Carbs', field: 'carbs' as const, color: '#f59e0b' },
                          { label: 'Fat', field: 'fat' as const, color: '#3b82f6' },
                        ].map(({ label, field, color }) => (
                          <div key={field}>
                            <label className="mb-0.5 block text-[10px] font-medium uppercase text-[#555]" style={{ color }}>
                              {label}
                            </label>
                            <input
                              type="number"
                              value={f[field]}
                              onChange={(e) => updateFood(i, field, e.target.value)}
                              className="w-full rounded border border-[#222] bg-[#1a1a1a] px-2 py-1.5 text-xs text-white focus:border-[#dc2626]"
                              min={0}
                              step={0.1}
                            />
                          </div>
                        ))}
                      </div>

                      {f.autoFilled && (
                        <p className="mt-1.5 text-[10px] text-[#22c55e]">Auto-filled from nutrition database</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#1e1e1e] p-4">
              <button
                onClick={handleSave}
                className="w-full rounded bg-[#dc2626] py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#ef4444]"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                Save Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
