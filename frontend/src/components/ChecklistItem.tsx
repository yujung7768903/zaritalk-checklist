import type { ChecklistItem as Item } from '../types/checklist'

interface Props {
  item: Item
  completed: boolean
  onToggle: () => void
  onDetail: () => void
}

export default function ChecklistItem({ item, completed, onToggle, onDetail }: Props) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#F1F3F6] last:border-b-0 cursor-pointer ${
        completed ? 'bg-[#FAFBFC]' : 'bg-white'
      }`}
    >
      <button
        onClick={onToggle}
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          completed
            ? 'bg-[#2C7FFF] border-[#2C7FFF]'
            : 'border-[#CDD1D5] bg-white'
        }`}
      >
        {completed && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <button className="flex-1 text-left min-w-0" onClick={onDetail}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.important && (
            <span className="shrink-0 text-xs font-semibold text-[#FF3B30] bg-[#FFF0EE] px-1.5 py-0.5 rounded-md">
              중요
            </span>
          )}
          <span className={`text-sm font-medium leading-snug ${completed ? 'text-[#AAA] line-through' : 'text-[#222]'}`}>
            {item.title}
          </span>
        </div>
      </button>

      <button onClick={onDetail} className="shrink-0 text-[#CDD1D5] p-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
