import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ChecklistType, ChecklistSection, SituationConfig, SituationCondition } from '../types/checklist'
import { newHomeSections } from '../constants/checklists/newHome'
import { moveSections } from '../constants/checklists/move'
import { useChecklist } from '../hooks/useChecklist'
import { useSituationConfig } from '../hooks/useSituationConfig'
import { useAuth } from '../context/AuthContext'
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
  const { user } = useAuth()
  const checklistType = (type as ChecklistType) ?? 'new-home'
  const allSections = SECTION_MAP[checklistType] ?? []
  const hasSituationConfig = SITUATION_TYPES.includes(checklistType)

  const { config, saveConfig } = useSituationConfig(checklistType)

  const sections = useMemo(
    () => (hasSituationConfig && config ? applyConditions(allSections, config) : allSections),
    [allSections, config, hasSituationConfig]
  )

  const { completedIds, toggle, reset, save, hasUnsavedChanges, isLoading } = useChecklist(checklistType)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [subChecks, setSubChecks] = useState<Record<string, Set<number>>>({})

  const toggleSubCheck = (itemId: string, index: number) => {
    setSubChecks(prev => {
      const current = new Set(prev[itemId] ?? [])
      current.has(index) ? current.delete(index) : current.add(index)
      return { ...prev, [itemId]: current }
    })
  }

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

  const handleSave = async () => {
    if (!user || !hasUnsavedChanges) return
    
    try {
      await save()
    } catch (error) {
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    }
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

        {/* Loading state */}
        {user && isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-tertiary">체크리스트를 불러오는 중...</p>
          </div>
        )}

        {/* Sections */}
        <div className="pt-3 pb-20">
          {(!hasSituationConfig || config) && !isLoading && sections.map(section => (
            <ChecklistSectionComp
              key={section.id}
              section={section}
              completedIds={completedIds}
              onToggle={toggle}
              onDetail={setSelectedItemId}
            />
          ))}
        </div>

        {/* Save button at bottom */}
        {user && (
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[640px] bg-white border-t border-border px-4 py-3">
            <button 
              onClick={handleSave}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium text-base"
            >
              저장
            </button>
          </div>
        )}

        {/* Item detail bottom sheet */}
        <ChecklistItemDetail
          item={selectedItem}
          checkedIndexes={selectedItem ? (subChecks[selectedItem.id] ?? new Set()) : new Set()}
          onToggleCheck={(index) => selectedItem && toggleSubCheck(selectedItem.id, index)}
          onClose={() => setSelectedItemId(null)}
        />
      </div>
    </div>
  )
}
