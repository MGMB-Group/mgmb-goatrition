import { NextRequest, NextResponse } from 'next/server'
import { getMockScanResults } from '@/lib/nutrition'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image')

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 },
      )
    }

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800))

    const filename =
      image instanceof File ? image.name : String(image)

    const results = getMockScanResults(filename)

    return NextResponse.json({ results })
  } catch (err) {
    console.error('[vision]', err)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 },
    )
  }
}
