'use client'

import type { User, Meal, Activity, ScanUsage, EarlyAccessSignup, AdminStats } from './types'

// ─── Storage keys ────────────────────────────────────────────────────────────
const KEYS = {
  USERS: 'mgmb_users',
  SESSION: 'mgmb_session',
  MEALS: (uid: string) => `mgmb_meals_${uid}`,
  ACTIVITIES: (uid: string) => `mgmb_activities_${uid}`,
  SCAN_USAGE: (uid: string) => `mgmb_scan_${uid}`,
  EARLY_ACCESS: 'mgmb_early_access',
}

// ─── Generic helpers ──────────────────────────────────────────────────────────
function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function remove(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersStore = {
  getAll: (): User[] => get<User[]>(KEYS.USERS, []),
  findByEmail: (email: string): User | undefined =>
    usersStore.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findById: (id: string): User | undefined =>
    usersStore.getAll().find((u) => u.id === id),
  create: (user: User): void => {
    const users = usersStore.getAll()
    users.push(user)
    set(KEYS.USERS, users)
  },
  update: (id: string, updates: Partial<User>): void => {
    const users = usersStore.getAll()
    const i = users.findIndex((u) => u.id === id)
    if (i !== -1) {
      users[i] = { ...users[i], ...updates }
      set(KEYS.USERS, users)
    }
  },
}

// ─── Session ──────────────────────────────────────────────────────────────────
export const sessionStore = {
  get: (): string | null => get<string | null>(KEYS.SESSION, null),
  set: (userId: string): void => set(KEYS.SESSION, userId),
  clear: (): void => remove(KEYS.SESSION),
}

// ─── Meals ────────────────────────────────────────────────────────────────────
export const mealsStore = {
  getAll: (userId: string): Meal[] => get<Meal[]>(KEYS.MEALS(userId), []),
  getByDate: (userId: string, date: string): Meal[] =>
    mealsStore.getAll(userId).filter((m) => m.date === date),
  create: (userId: string, meal: Meal): void => {
    const meals = mealsStore.getAll(userId)
    meals.push(meal)
    set(KEYS.MEALS(userId), meals)
  },
  update: (userId: string, mealId: string, updates: Partial<Meal>): void => {
    const meals = mealsStore.getAll(userId)
    const i = meals.findIndex((m) => m.id === mealId)
    if (i !== -1) {
      meals[i] = { ...meals[i], ...updates }
      set(KEYS.MEALS(userId), meals)
    }
  },
  delete: (userId: string, mealId: string): void => {
    set(
      KEYS.MEALS(userId),
      mealsStore.getAll(userId).filter((m) => m.id !== mealId),
    )
  },
}

// ─── Activities ───────────────────────────────────────────────────────────────
export const activitiesStore = {
  getAll: (userId: string): Activity[] =>
    get<Activity[]>(KEYS.ACTIVITIES(userId), []),
  getByDate: (userId: string, date: string): Activity[] =>
    activitiesStore.getAll(userId).filter((a) => a.date === date),
  getLast7Days: (userId: string): Activity[] => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return activitiesStore
      .getAll(userId)
      .filter((a) => new Date(a.date) >= cutoff)
  },
  create: (userId: string, activity: Activity): void => {
    const acts = activitiesStore.getAll(userId)
    acts.push(activity)
    set(KEYS.ACTIVITIES(userId), acts)
  },
  delete: (userId: string, activityId: string): void => {
    set(
      KEYS.ACTIVITIES(userId),
      activitiesStore.getAll(userId).filter((a) => a.id !== activityId),
    )
  },
}

// ─── Scan usage ───────────────────────────────────────────────────────────────
function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

export const MAX_FREE_SCANS = 5

export const scanStore = {
  /** Get current usage, auto-resetting weekly count if the week has rolled over */
  getUsage: (userId: string): ScanUsage => {
    const stored = get<ScanUsage | null>(KEYS.SCAN_USAGE(userId), null)
    const weekStart = getWeekStart()

    if (!stored) {
      // First time — create a fresh record
      const fresh: ScanUsage = {
        userId,
        weekStart,
        count: 0,
        totalScans: 0,
        earlyAccessClicked: false,
      }
      set(KEYS.SCAN_USAGE(userId), fresh)
      return fresh
    }

    if (stored.weekStart !== weekStart) {
      // New week — reset weekly count, preserve lifetime total and earlyAccessClicked
      const reset: ScanUsage = {
        ...stored,
        weekStart,
        count: 0,
        hitLimitAt: undefined,
        earlyAccessClicked: false,
      }
      set(KEYS.SCAN_USAGE(userId), reset)
      return reset
    }

    return stored
  },

  /** Increment weekly + lifetime count. Returns updated usage. */
  increment: (userId: string): ScanUsage => {
    const usage = scanStore.getUsage(userId)
    const isFirstHit = usage.count + 1 >= MAX_FREE_SCANS && !usage.hitLimitAt
    const updated: ScanUsage = {
      ...usage,
      count: usage.count + 1,
      totalScans: (usage.totalScans ?? 0) + 1,
      hitLimitAt: isFirstHit ? new Date().toISOString() : usage.hitLimitAt,
    }
    set(KEYS.SCAN_USAGE(userId), updated)
    return updated
  },

  /** Mark that the user clicked "Join Early Access" after hitting the limit */
  markEarlyAccessClicked: (userId: string): void => {
    const usage = scanStore.getUsage(userId)
    set(KEYS.SCAN_USAGE(userId), { ...usage, earlyAccessClicked: true })
  },

  canScan: (userId: string): boolean =>
    scanStore.getUsage(userId).count < MAX_FREE_SCANS,

  remaining: (userId: string): number =>
    Math.max(0, MAX_FREE_SCANS - scanStore.getUsage(userId).count),
}

// ─── Admin analytics ──────────────────────────────────────────────────────────
export const adminStore = {
  getStats: (): AdminStats => {
    if (typeof window === 'undefined') {
      return {
        totalUsers: 0, totalScans: 0, avgScansPerUser: 0,
        usersWhoHitLimit: 0, pctUsersHitLimit: 0,
        usersWhoClickedEarlyAccess: 0, pctClickedEarlyAccess: 0,
        totalEarlyAccessSignups: 0,
      }
    }

    const users = get<User[]>(KEYS.USERS, [])
    const nonAdminUsers = users.filter((u) => u.role !== 'admin')
    const total = nonAdminUsers.length

    let totalScans = 0
    let hitLimit = 0
    let clickedEA = 0

    for (const u of nonAdminUsers) {
      const usage = get<ScanUsage | null>(KEYS.SCAN_USAGE(u.id), null)
      if (usage) {
        totalScans += usage.totalScans ?? 0
        if ((usage.totalScans ?? 0) >= MAX_FREE_SCANS || (usage.hitLimitAt != null)) {
          hitLimit++
        }
        if (usage.earlyAccessClicked) clickedEA++
      }
    }

    const earlySignups = get<EarlyAccessSignup[]>(KEYS.EARLY_ACCESS, [])

    return {
      totalUsers: total,
      totalScans,
      avgScansPerUser: total > 0 ? Math.round((totalScans / total) * 10) / 10 : 0,
      usersWhoHitLimit: hitLimit,
      pctUsersHitLimit: total > 0 ? Math.round((hitLimit / total) * 100) : 0,
      usersWhoClickedEarlyAccess: clickedEA,
      pctClickedEarlyAccess: hitLimit > 0 ? Math.round((clickedEA / hitLimit) * 100) : 0,
      totalEarlyAccessSignups: earlySignups.length,
    }
  },
}

// ─── Early Access ─────────────────────────────────────────────────────────────
export const earlyAccessStore = {
  getAll: (): EarlyAccessSignup[] =>
    get<EarlyAccessSignup[]>(KEYS.EARLY_ACCESS, []),
  create: (signup: EarlyAccessSignup): void => {
    const signups = earlyAccessStore.getAll()
    signups.push(signup)
    set(KEYS.EARLY_ACCESS, signups)
  },
}

// ─── ID generator ─────────────────────────────────────────────────────────────
export function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Today date string ────────────────────────────────────────────────────────
export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}
