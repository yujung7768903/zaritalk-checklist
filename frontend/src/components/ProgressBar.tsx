interface Props {
  completed: number
  total: number
}

export default function ProgressBar({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="px-4 py-3 bg-white border-b border-[#E5E8EB]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#222]">진행률</span>
        <span className="text-sm font-semibold text-[#2C7FFF]">{completed} / {total}</span>
      </div>
      <div className="w-full h-2 bg-[#F1F3F6] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2C7FFF] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
