// MET-based calorie burn: Calories = MET × weight(kg) × duration(hours)

type Intensity = 'low' | 'medium' | 'high'

const MET_TABLE: Record<string, Record<Intensity, number>> = {
  boxing:       { low: 6.0, medium: 9.0,  high: 12.5 },
  'muay thai':  { low: 7.0, medium: 10.0, high: 13.5 },
  mma:          { low: 7.0, medium: 10.5, high: 14.0 },
  wrestling:    { low: 6.0, medium: 9.0,  high: 12.0 },
  kickboxing:   { low: 6.5, medium: 9.5,  high: 12.5 },
  jiu_jitsu:    { low: 5.5, medium: 8.0,  high: 11.0 },
  running:      { low: 7.0, medium: 10.0, high: 13.0 },
  sprints:      { low: 8.0, medium: 12.0, high: 15.0 },
  cycling:      { low: 5.0, medium: 8.0,  high: 11.0 },
  swimming:     { low: 5.0, medium: 8.0,  high: 10.0 },
  gym:          { low: 4.0, medium: 6.0,  high: 8.0  },
  weightlifting:{ low: 3.5, medium: 5.5,  high: 7.5  },
  crossfit:     { low: 6.0, medium: 9.0,  high: 12.0 },
  hiit:         { low: 7.0, medium: 10.0, high: 13.0 },
  yoga:         { low: 2.5, medium: 3.5,  high: 4.5  },
  walking:      { low: 2.5, medium: 3.5,  high: 4.5  },
  jump_rope:    { low: 8.0, medium: 11.0, high: 13.0 },
  default:      { low: 4.0, medium: 6.0,  high: 8.0  },
}

export const ACTIVITY_TYPES = [
  'Boxing',
  'Muay Thai',
  'MMA',
  'Wrestling',
  'Kickboxing',
  'Jiu Jitsu',
  'Running',
  'Sprints',
  'Cycling',
  'Swimming',
  'Gym',
  'Weightlifting',
  'CrossFit',
  'HIIT',
  'Yoga',
  'Walking',
  'Jump Rope',
]

export function calculateCaloriesBurned(
  activityType: string,
  durationMinutes: number,
  intensity: Intensity,
  weightKg: number = 75,
): number {
  const key = activityType.toLowerCase().replace(/\s+/g, '_')
  const mets = MET_TABLE[key] ?? MET_TABLE.default
  const met = mets[intensity]
  const hours = durationMinutes / 60
  return Math.round(met * weightKg * hours)
}
