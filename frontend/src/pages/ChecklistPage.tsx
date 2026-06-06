import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ChecklistType, ChecklistSection, SituationConfig, SituationCondition } from '../types/checklist'
import { newHomeSections } from '../constants/checklists/newHome'
import { moveSections } from '../constants/checklists/move'
import { useChecklist } from '../hooks/useChecklist'
import { useSituationConfig } from '../hooks/useSituationConfig'
import ProgressBar from '../components/ProgressBar'
import ChecklistSectionComp from '../components/ChecklistSection'
import ChecklistItemDetail from '../components/ChecklistItemDetail'
import SituationSetup from '../components/SituationSetup'

const SECTION_MAP = {
  'new-home': newHomeSections,
  'move': moveSections,
}

const TITLE_MAP = {
  'new-home': '새 집 구하기',
  'move': '이사',
}

const SITUATION_TYPES: ChecklistType[] = ['move', 'new-home']

function matchesSituation(cond: SituationCondition, config: SituationConfig): boolean {
  if (cond.currentHousing && config.currentHousing && !cond.currentHousing.includes(config.currentHousing)) return false
  if (cond.nextHousing && !cond.nextHousing.includes(config.nextHousing)) return false
  if (cond.exitType && config.exitType && !cond.exitType.includes(config.exitType)) return false
  return true
}

function applyConditions(sections: ChecklistSection[], config: SituationConfig): ChecklistSection[] {
  return sections
    .filter(s => !s.showWhen || matchesSituation(s.showWhen, config))
    .map(s => ({
      ...s,
      items: s.items.filter(i => !i.showWhen || matchesSituation(i.showWhen, config)),
    }))
}

export default function ChecklistPage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const checklistType = (type as ChecklistType) ?? 'new-home'
  const allSections = SECTION_MAP[checklistType] ?? []
  const hasSituationConfig = SITUATION_TYPES.includes(checklistType)

  const { config, saveConfig } = useSituationConfig(checklistType)

  const sections = useMemo(
    () => (hasSituationConfig && config ? applyConditions(allSections, config) : allSections),
    [allSections, config, hasSituationConfig]
  )

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
    <div className="w-full min-h-screen bg-bg">
      <div className="w-full max-w-[640px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex items-center justify-between px-4 pt-12 pb-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-sub"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base font-bold text-text">
              {TITLE_MAP[checklistType]}
            </h1>
            <button onClick={handleReset} className="text-xs text-tertiary p-2 -mr-2">
              초기화
            </button>
          </div>
          <ProgressBar completed={completedCount} total={totalCount} />
        </div>

        {/* Situation setup */}
        {hasSituationConfig && (
          <SituationSetup checklistType={checklistType} config={config} onSave={saveConfig} />
        )}

        {/* Not configured yet — prompt */}
        {hasSituationConfig && !config && (
          <div className="mx-4 mt-2 mb-2 bg-subtle rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-tertiary">상황을 설정하면 맞춤 체크리스트를 볼 수 있습니다</p>
          </div>
        )}

        {/* All done banner */}
        {allDone && (
          <div className="mx-4 mt-3 bg-primary-light rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-bold text-primary">모든 항목 완료!</p>
              <p className="text-xs text-primary-medium">꼼꼼히 확인하셨네요. 안전한 계약 되세요!</p>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="pt-3 pb-8">
          {(!hasSituationConfig || config) && sections.map(section => (
            <ChecklistSectionComp
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
          onClose={() => setSelectedItemId(null)}
        />
      </div>
    </div>
  )
}
