interface Tick {
  pct: number
  label: string
  color?: string
}

interface Props {
  value: number
  max?: number
  color: string
  ticks?: Tick[]
}

export default function GaugeBar({ value, max = 100, color, ticks }: Props) {
  const width = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div>
      <div className="relative h-2 bg-bg rounded-full overflow-hidden my-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${width}%`, background: color }}
        />
        {ticks?.filter(t => t.pct > 0 && t.pct < 100).map((t, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-white/50"
            style={{ left: `${t.pct}%` }}
          />
        ))}
      </div>
      {ticks && (
        <div className="relative h-4">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="absolute text-[11px] whitespace-nowrap"
              style={{
                left: `${t.pct}%`,
                color: t.color ?? 'var(--color-text-tertiary)',
                transform:
                  t.pct <= 0  ? 'none' :
                  t.pct >= 98 ? 'translateX(-100%)' :
                                'translateX(-50%)',
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
