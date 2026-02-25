import { NextRequest, NextResponse } from 'next/server'
import { getNutrition } from '@/lib/nutrition'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, grams } = body as { name?: string; grams?: number }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    if (!grams || typeof grams !== 'number' || grams <= 0) {
      return NextResponse.json({ error: 'grams must be a positive number' }, { status: 400 })
    }

    const result = getNutrition(name.trim(), grams)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[nutrition/search]', err)
    return NextResponse.json({ error: 'Failed to lookup nutrition' }, { status: 500 })
  }
}
