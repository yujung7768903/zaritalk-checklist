import { useState } from 'react'
import type { MoveSituationConfig, HousingType, ExitType } from '../../types/checklist'
import { EXIT_OPTIONS, EXIT_LABEL, HOUSING_LABEL, HousingToggle } from './HousingToggle'

interface DraftConfig {
  currentHousing?: HousingType
  nextHousing?: HousingType
  exitType?: ExitType
}

interface Props {
  config: MoveSituationConfig | null
  onSave: (config: MoveSituationConfig) => void
}

function isValidConfig(config: MoveSituationConfig | null): config is MoveSituationConfig {
  if (!config || !config.nextHousing || !config.currentHousing) return false
  if (config.currentHousing !== 'maemae' && !config.exitType) return false
  return true
}

function configSummary(config: MoveSituationConfig): string {
  const current = HOUSING_LABEL[config.currentHousing]
  const next = HOUSING_LABEL[config.nextHousing]
  const exit = config.currentHousing !== 'maemae' && config.exitType ? ` · ${EXIT_LABEL[config.exitType]}` : ''
  return `${current} → ${next}${exit}`
}

function isValidDraft(draft: DraftConfig): boolean {
  if (!draft.nextHousing || !draft.currentHousing) return false
  if (draft.currentHousing !== 'maemae' && !draft.exitType) return false
  return true
}

export default function MoveSituationSetup({ config, onSave }: Props) {
  const hasValidConfig = isValidConfig(config)
  const [isEditing, setIsEditing] = useState(!hasValidConfig)
  const [draft, setDraft] = useState<DraftConfig>(config ?? {})

  // 서버에서 현재 상황을 비동기로 받아온 뒤 config가 갱신되면 화면 상태를 동기화한다
  const [prevConfig, setPrevConfig] = useState(config)
  if (config !== prevConfig) {
    setPrevConfig(config)
    setIsEditing(!isValidConfig(config))
    setDraft(config ?? {})
  }

  function handleSave() {
    if (!isValidDraft(draft) || !draft.nextHousing || !draft.currentHousing) return
    onSave({
      currentHousing: draft.currentHousing,
      nextHousing: draft.nextHousing,
      exitType: draft.currentHousing === 'maemae' ? undefined : draft.exitType,
    })
    setIsEditing(false)
  }

  if (!isEditing && hasValidConfig && config) {
    return (
      <div className="mx-4 mt-3 mb-1 border border-border rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-tertiary mb-0.5">현재 상황</p>
          <p className="text-sm font-semibold text-text-dark">{configSummary(config)}</p>
        </div>
        <button
          onClick={() => { setDraft(config ?? {}); setIsEditing(true) }}
          className="text-xs text-primary border border-primary px-2.5 py-1 rounded-lg cursor-pointer shrink-0"
        >
          수정
        </button>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-3 mb-1 border border-primary rounded-xl px-4 py-4">
      <p className="text-sm font-bold text-text mb-4">현재 상황을 알려주세요</p>

      <div className="mb-3">
        <p className="text-xs font-semibold text-sub mb-2">현재 거주 유형</p>
        <HousingToggle
          value={draft.currentHousing ?? 'monthly'}
          onChange={v => setDraft(d => ({
            ...d,
            currentHousing: v,
            exitType: v === 'maemae' ? undefined : (d.exitType ?? 'expired'),
          }))}
        />
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold text-sub mb-2">이사할 집 유형</p>
        <HousingToggle
          value={draft.nextHousing}
          onChange={v => setDraft(d => ({ ...d, nextHousing: v }))}
        />
      </div>

      {draft.currentHousing !== 'maemae' && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-sub mb-2">퇴거 방식</p>
          <div className="flex flex-col gap-2">
            {EXIT_OPTIONS.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setDraft(d => ({ ...d, exitType: value }))}
                className={`w-full px-4 py-2.5 rounded-lg text-left border transition-colors cursor-pointer
                  ${draft.exitType === value
                    ? 'bg-primary-light border-primary'
                    : 'bg-white border-border hover:border-primary'}`}
              >
                <span className={`text-sm font-semibold ${draft.exitType === value ? 'text-primary' : 'text-text-dark'}`}>
                  {label}
                </span>
                <span className="text-xs text-tertiary ml-2">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!isValidDraft(draft)}
        className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors
          ${isValidDraft(draft)
            ? 'bg-primary text-white cursor-pointer'
            : 'bg-border text-tertiary cursor-not-allowed'}`}
      >
        저장
      </button>
    </div>
  )
}
