export interface User {
  id: string
  email: string
  password: string
  name: string
  role: 'user' | 'admin'
  weight?: number
  height?: number
  age?: number
  sex?: 'male' | 'female'
  goal?: 'lose' | 'maintain' | 'gain'
  dailyCalorieTarget?: number
  proteinTarget?: number
  carbsTarget?: number
  fatTarget?: number
  fighterMode?: boolean
  targetWeight?: number
  createdAt: string
}

export interface FoodItem {
  id: string
  name: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  id: string
  userId: string
  date: string
  name: string
  items: FoodItem[]
  createdAt: string
}

export interface Activity {
  id: string
  userId: string
  date: string
  type: string
  duration: number
  intensity: 'low' | 'medium' | 'high'
  caloriesBurned: number
  notes?: string
  createdAt: string
}

export interface ScanUsage {
  userId: string
  weekStart: string
  count: number          // scans used this week
  totalScans: number     // lifetime total scans
  hitLimitAt?: string    // ISO timestamp when weekly limit was first hit this week
  earlyAccessClicked: boolean // did user click "Join Early Access" after hitting limit
}

export interface AdminStats {
  totalUsers: number
  totalScans: number
  avgScansPerUser: number
  usersWhoHitLimit: number
  pctUsersHitLimit: number
  usersWhoClickedEarlyAccess: number
  pctClickedEarlyAccess: number
  totalEarlyAccessSignups: number
}

export interface EarlyAccessSignup {
  id: string
  userId?: string
  email: string
  trainingType: string
  weightClass?: string
  goal: string
  createdAt: string
}

export interface DaySummary {
  date: string
  totalCaloriesIn: number
  totalCaloriesOut: number
  netCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  calorieTarget: number
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
  compliance: number
}
