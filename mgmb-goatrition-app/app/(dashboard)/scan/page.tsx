'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, Upload, Zap, Lock, AlertTriangle, CheckCircle, RotateCcw, X } from 'lucide-react'
import { useAuth } from '@/lib/context'
import { scanStore, MAX_FREE_SCANS } from '@/lib/store'
import EarlyAccessModal from '@/components/EarlyAccessModal'
import type { ScanUsage } from '@/lib/types'

interface ScanResult {
  name: string
  estimatedGrams: number
  confidence: number
}

export default function ScanPage() {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [usage, setUsage] = useState<ScanUsage | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<ScanResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showEarlyAccess, setShowEarlyAccess] = useState(false)

  // Load scan usage on mount
  useEffect(() => {
    if (user?.id) {
      setUsage(scanStore.getUsage(user.id))
    }
  }, [user?.id])

  const remaining = usage ? Math.max(0, MAX_FREE_SCANS - usage.count) : MAX_FREE_SCANS
  const limitReached = remaining === 0
  const usedPct = usage ? Math.min(100, (usage.count / MAX_FREE_SCANS) * 100) : 0

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setResults(null)

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleScan() {
    if (!user?.id || !preview || limitReached) return

    // Pre-flight check
    if (!scanStore.canScan(user.id)) {
      setUsage(scanStore.getUsage(user.id))
      setShowEarlyAccess(true)
      return
    }

    setScanning(true)
    setError(null)

    try {
      // Convert preview data URL to Blob for FormData
      const res = await fetch(preview)
      const blob = await res.blob()
      const formData = new FormData()
      formData.append('image', blob, 'meal.jpg')

      const response = await fetch('/api/vision', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Scan failed')
      }

      const data = await response.json()
      // Increment AFTER a successful scan
      const updated = scanStore.increment(user.id)
      setUsage(updated)
      setResults(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setScanning(false)
    }
  }

  function handleReset() {
    setPreview(null)
    setResults(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function openEarlyAccess() {
    if (user?.id) scanStore.markEarlyAccessClicked(user.id)
    setShowEarlyAccess(true)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-black uppercase tracking-tight text-white"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(2.5rem, 8vw, 3.5rem)' }}
        >
          AI Meal Scan
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Snap your meal — AI identifies foods and estimates macros.
        </p>
      </div>

      {/* Scan usage meter */}
      <div className="mb-5 rounded-lg border border-[#1e1e1e] bg-[#111] p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={15} className={limitReached ? 'text-[#dc2626]' : 'text-[#6b7280]'} />
            <span className="text-sm font-medium text-white">Weekly Scans</span>
          </div>
          <span className={`text-sm font-bold tabular-nums ${limitReached ? 'text-[#dc2626]' : 'text-white'}`}>
            {usage?.count ?? 0} / {MAX_FREE_SCANS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
          <div
            className="macro-fill h-full rounded-full transition-all"
            style={{
              width: `${usedPct}%`,
              backgroundColor: limitReached ? '#dc2626' : usedPct > 60 ? '#f59e0b' : '#22c55e',
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-[#6b7280]">
            {limitReached
              ? 'Limit reached — resets Monday'
              : `${remaining} scan${remaining !== 1 ? 's' : ''} remaining this week`}
          </p>
          {limitReached && (
            <button
              onClick={openEarlyAccess}
              className="flex items-center gap-1 text-xs font-bold text-[#dc2626] hover:text-[#ef4444] transition-colors"
            >
              <Zap size={11} />
              Get unlimited
            </button>
          )}
        </div>
      </div>

      {/* Upload / scan area */}
      {!limitReached ? (
        <div className="mb-4 overflow-hidden rounded-lg border border-[#222] bg-[#111]">
          {!preview ? (
            /* Drop zone */
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group flex w-full flex-col items-center justify-center gap-3 p-12 transition-colors hover:bg-[#1a1a1a]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#333] transition-colors group-hover:border-[#dc2626]/50">
                <Upload size={24} className="text-[#555] group-hover:text-[#dc2626]/70 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#9ca3af]">Click to upload meal photo</p>
                <p className="text-xs text-[#555]">JPG, PNG, WebP — max 5MB</p>
              </div>
            </button>
          ) : (
            /* Preview + scan button */
            <div>
              <div className="relative">
                <img
                  src={preview}
                  alt="Meal photo preview for AI scanning"
                  className="max-h-64 w-full object-cover"
                />
                <button
                  onClick={handleReset}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90 transition-colors"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex gap-2 p-4">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded border border-[#222] bg-[#1a1a1a] px-4 py-2.5 text-sm text-[#9ca3af] transition-colors hover:bg-[#222] hover:text-white"
                >
                  <RotateCcw size={14} />
                  Change
                </button>
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-[#dc2626] px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#ef4444] disabled:opacity-60 active:scale-[0.98]"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {scanning ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      Scan Meal
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload meal photo"
          />
        </div>
      ) : (
        /* Limit reached block */
        <div className="mb-4 rounded-lg border border-[#dc2626]/30 bg-[#dc2626]/5 p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dc2626]/15">
              <Lock size={22} className="text-[#dc2626]" />
            </div>
          </div>
          <h3
            className="mb-1 font-black uppercase tracking-wide text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.25rem' }}
          >
            Weekly Limit Reached
          </h3>
          <p className="mb-4 text-sm text-[#6b7280]">
            You&apos;ve used all {MAX_FREE_SCANS} free scans. Limit resets every Monday.
          </p>
          <button
            onClick={openEarlyAccess}
            className="inline-flex items-center gap-2 rounded bg-[#dc2626] px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#ef4444]"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            <Zap size={15} />
            Join Early Access
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#dc2626]">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Scan results */}
      {results && results.length > 0 && (
        <div className="mb-4 rounded-lg border border-[#222] bg-[#111]">
          <div className="flex items-center gap-2 border-b border-[#1e1e1e] px-4 py-3">
            <CheckCircle size={16} className="text-[#22c55e]" />
            <h3
              className="font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Detected Foods
            </h3>
            <span className="ml-auto text-xs text-[#6b7280]">{results.length} item{results.length !== 1 ? 's' : ''}</span>
          </div>
          <ul className="divide-y divide-[#1a1a1a]">
            {results.map((item, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium capitalize text-white">{item.name}</p>
                  <p className="text-xs text-[#6b7280]">{item.estimatedGrams}g estimated</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#1a1a1a]">
                    <div
                      className="h-full rounded-full bg-[#22c55e]"
                      style={{ width: `${Math.round(item.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-[#6b7280]">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#1e1e1e] px-4 py-3">
            <p className="text-xs text-[#6b7280]">
              Use the Meals page to add these items with full nutrition data via the nutrition lookup.
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111] p-4">
        <h3
          className="mb-3 font-bold uppercase tracking-wide text-white"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          How It Works
        </h3>
        <ol className="space-y-2">
          {[
            'Upload a clear photo of your meal',
            'AI identifies food items and estimates portion sizes',
            'Review confidence scores for each detected item',
            'Use Meals page to log full macro breakdown',
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-[#9ca3af]">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[10px] font-bold text-[#dc2626]">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Early Access Modal */}
      <EarlyAccessModal
        open={showEarlyAccess}
        onClose={() => setShowEarlyAccess(false)}
        limitReached={limitReached}
      />
    </div>
  )
}
