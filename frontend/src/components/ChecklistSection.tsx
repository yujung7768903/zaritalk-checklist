import { useState } from 'react'
import type { ChecklistSection as Section } from '../types/checklist'
import ChecklistItemRow from './ChecklistItem'

interface Props {
  section: Section
  completedIds: Set<string>
  onToggle: (itemId: string) => void
  onDetail: (itemId: string) => void
}

export default function ChecklistSection({ section, completedIds, onToggle, onDetail }: Props) {
  const total = section.items.length
  const completed = section.items.filter(i => completedIds.has(i.id)).length
  const allDone = completed === total
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="mb-2">
      <button
        onClick={() => setCollapsed(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-bg"
      >
        <span className={`text-sm font-semibold ${allDone ? 'text-disabled' : 'text-text'}`}>
          {section.title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary">{completed}/{total}</span>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
          >
            <path d="M4 6L8 10L12 6" stroke="var(--color-border-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="bg-white">
          {section.items.map(item => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              completed={completedIds.has(item.id)}
              onToggle={() => onToggle(item.id)}
              onDetail={() => onDetail(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
