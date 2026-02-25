interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Deterministic per-100g nutrition database
const DB: Record<string, NutritionData> = {
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13 },
  tuna: { calories: 132, protein: 28, carbs: 0, fat: 1.4 },
  turkey: { calories: 135, protein: 30, carbs: 0, fat: 1 },
  pork: { calories: 242, protein: 27, carbs: 0, fat: 14 },
  oats: { calories: 389, protein: 17, carbs: 66, fat: 7 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  cheese: { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  pasta: { calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  yogurt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  almonds: { calories: 579, protein: 21, carbs: 22, fat: 50 },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  sweet_potato: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  avocado: { calories: 160, protein: 2, carbs: 9, fat: 15 },
  whey: { calories: 400, protein: 80, carbs: 7, fat: 5 },
  protein_shake: { calories: 120, protein: 25, carbs: 5, fat: 2 },
  steak: { calories: 271, protein: 26, carbs: 0, fat: 18 },
  shrimp: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
}

function djb2(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
    h = h >>> 0
  }
  return h
}

export function getNutrition(name: string, grams: number): NutritionData {
  const key = name.toLowerCase().replace(/[\s-]/g, '_').trim()

  for (const [food, data] of Object.entries(DB)) {
    if (key.includes(food) || food.includes(key)) {
      const f = grams / 100
      return {
        calories: Math.round(data.calories * f),
        protein: Math.round(data.protein * f * 10) / 10,
        carbs: Math.round(data.carbs * f * 10) / 10,
        fat: Math.round(data.fat * f * 10) / 10,
      }
    }
  }

  // Deterministic fallback based on name hash
  const h = djb2(key)
  const baseCal = 60 + (h % 280)
  const basePro = 3 + (h % 32)
  const baseCarb = 5 + ((h >> 3) % 45)
  const baseFat = 1 + ((h >> 6) % 18)
  const f = grams / 100

  return {
    calories: Math.round(baseCal * f),
    protein: Math.round(basePro * f * 10) / 10,
    carbs: Math.round(baseCarb * f * 10) / 10,
    fat: Math.round(baseFat * f * 10) / 10,
  }
}

export function getMockScanResults(filename = ''): Array<{
  name: string
  estimatedGrams: number
  confidence: number
}> {
  const h = djb2(filename || String(Date.now()))
  const foods = [
    'Grilled Chicken Breast',
    'Brown Rice',
    'Steamed Broccoli',
    'Mixed Salad',
    'Scrambled Eggs',
    'Oatmeal',
    'Salmon Fillet',
    'Sweet Potato',
    'Protein Shake',
    'Avocado Toast',
    'Pasta Bolognese',
    'Beef Steak',
  ]
  const pick1 = foods[h % foods.length]
  const pick2 = foods[(h >> 2) % foods.length]
  const results = [
    {
      name: pick1,
      estimatedGrams: 100 + (h % 150),
      confidence: 0.75 + ((h % 20) / 100),
    },
  ]
  if (pick2 !== pick1) {
    results.push({
      name: pick2,
      estimatedGrams: 50 + ((h >> 4) % 100),
      confidence: 0.6 + (((h >> 4) % 25) / 100),
    })
  }
  return results
}
