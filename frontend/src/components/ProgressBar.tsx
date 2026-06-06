interface Props {
  completed: number
  total: number
}

export default function ProgressBar({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="px-4 py-3 bg-white border-b border-border">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-text">진행률</span>
        <span className="text-sm font-semibold text-primary">{completed} / {total}</span>
      </div>
      <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
