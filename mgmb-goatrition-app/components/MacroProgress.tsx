'use client'

interface MacroProgressProps {
  label: string
  current: number
  target: number
  color: string
  unit?: string
}

export default function MacroProgress({
  label,
  current,
  target,
  color,
  unit = 'g',
}: MacroProgressProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const over = target > 0 && current > target

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#6b7280]">{label}</span>
        <span className={`text-xs font-semibold ${over ? 'text-[#f59e0b]' : 'text-white'}`}>
          {current.toFixed(0)}{unit}
          {target > 0 && (
            <span className="text-[#555]"> / {target}{unit}</span>
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
        <div
          className="macro-fill h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? '#f59e0b' : color,
          }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={target}
          aria-label={`${label} progress`}
        />
      </div>
    </div>
  )
}
