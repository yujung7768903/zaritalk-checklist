import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ChecklistType, ChecklistItem } from '../types/checklist'
import { newHomeSections } from '../constants/checklists/newHome'
import { jeonsaMoveSections } from '../constants/checklists/jeonsaMove'
import { monthlyMoveSections } from '../constants/checklists/monthlyMove'
import { useChecklist } from '../hooks/useChecklist'
import ProgressBar from '../components/ProgressBar'
import ChecklistSection from '../components/ChecklistSection'
import ChecklistItemDetail from '../components/ChecklistItemDetail'

const SECTION_MAP = {
  'new-home': newHomeSections,
  'jeonse-move': jeonsaMoveSections,
  'monthly-move': monthlyMoveSections,
}

const TITLE_MAP = {
  'new-home': '새 집 구하기',
  'jeonse-move': '전세 이사',
  'monthly-move': '월세 이사',
}

export default function ChecklistPage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const checklistType = (type as ChecklistType) ?? 'new-home'
  const sections = SECTION_MAP[checklistType] ?? []

  const { completedIds, toggle, reset } = useChecklist(checklistType)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const allItems = useMemo(() => sections.flatMap(s => s.items), [sections])
  const selectedItem = useMemo(
    () => allItems.find(i => i.id === selectedItemId) ?? null,
    [allItems, selectedItemId]
  )

  const totalCount = allItems.length
  const completedCount = allItems.filter(i => completedIds.has(i.id)).length
  const allDone = completedCount === totalCount && totalCount > 0

  const handleReset = () => {
    if (confirm('모든 체크 항목을 초기화할까요?')) reset()
  }

  return (
    <div className="w-full min-h-screen bg-[#F1F3F6]">
      <div className="w-full max-w-[500px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex items-center justify-between px-4 pt-12 pb-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-[#666]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base font-bold text-[#222]">
              {TITLE_MAP[checklistType]}
            </h1>
            <button onClick={handleReset} className="text-xs text-[#999] p-2 -mr-2">
              초기화
            </button>
          </div>

          <ProgressBar completed={completedCount} total={totalCount} />
        </div>

        {/* All done banner */}
        {allDone && (
          <div className="mx-4 mt-3 bg-[#EBF2FF] rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-bold text-[#2C7FFF]">모든 항목 완료!</p>
              <p className="text-xs text-[#5A9BFF]">꼼꼼히 확인하셨네요. 안전한 계약 되세요!</p>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="pt-3 pb-8">
          {sections.map(section => (
            <ChecklistSection
              key={section.id}
              section={section}
              completedIds={completedIds}
              onToggle={toggle}
              onDetail={setSelectedItemId}
            />
          ))}
        </div>

        {/* Item detail bottom sheet */}
        <ChecklistItemDetail
          item={selectedItem}
          completed={selectedItem ? completedIds.has(selectedItem.id) : false}
          onClose={() => setSelectedItemId(null)}
          onToggle={() => selectedItem && toggle(selectedItem.id)}
        />
      </div>
    </div>
  )
}
