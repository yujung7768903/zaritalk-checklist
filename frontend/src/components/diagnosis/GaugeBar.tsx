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
      <div className="h-2 bg-bg rounded-full overflow-hidden my-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
      {ticks && (
        <div className="flex justify-between text-[11px] text-tertiary">
          {ticks.map((t, i) => (
            <span key={i} style={t.color ? { color: t.color } : undefined}>{t.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
