import { useState } from 'react'
import type { ChecklistType, SituationConfig, HousingType, ExitType } from '../types/checklist'

const HOUSING_OPTIONS: { value: HousingType; label: string }[] = [
  { value: 'monthly', label: '월세' },
  { value: 'jeonse', label: '전세' },
  { value: 'maemae', label: '매매' },
]

const EXIT_OPTIONS: { value: ExitType; label: string; desc: string }[] = [
  { value: 'expired', label: '계약 만료', desc: '계약 기간이 끝나서 나가는 경우' },
  { value: 'early', label: '중도 퇴실', desc: '계약 기간 중 나가는 경우' },
]

const HOUSING_LABEL: Record<HousingType, string> = { monthly: '월세', jeonse: '전세', maemae: '매매' }
const EXIT_LABEL: Record<ExitType, string> = { expired: '계약 만료', early: '중도 퇴실' }

interface DraftConfig {
  currentHousing?: HousingType
  nextHousing?: HousingType
  exitType?: ExitType
}

interface Props {
  checklistType: ChecklistType
  config: SituationConfig | null
  onSave: (config: SituationConfig) => void
}

function HousingToggle({
  value,
  onChange,
}: {
  value: HousingType | undefined
  onChange: (v: HousingType) => void
}) {
  return (
    <div className="flex gap-2">
      {HOUSING_OPTIONS.map(({ value: v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer
            ${value === v
              ? 'bg-primary-light text-primary border-primary'
              : 'bg-white text-sub border-border hover:border-primary'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function configSummary(checklistType: ChecklistType, config: SituationConfig): string {
  if (checklistType === 'new-home') {
    return `${HOUSING_LABEL[config.nextHousing]} 구하기`
  }
  const current = config.currentHousing ? HOUSING_LABEL[config.currentHousing] : ''
  const next = HOUSING_LABEL[config.nextHousing]
  const exit = config.currentHousing !== 'maemae' && config.exitType ? ` · ${EXIT_LABEL[config.exitType]}` : ''
  return `${current} → ${next}${exit}`
}

function isValidConfig(checklistType: ChecklistType, config: SituationConfig): boolean {
  if (checklistType === 'new-home') {
    return !!config.nextHousing
  }
  return !!config.nextHousing && !!config.currentHousing && (config.currentHousing === 'maemae' || !!config.exitType)
}

export default function SituationSetup({ checklistType, config, onSave }: Props) {
  const isNewHome = checklistType === 'new-home'
  const hasValidConfig = config && isValidConfig(checklistType, config)

  const [isEditing, setIsEditing] = useState(!hasValidConfig)
  const [draft, setDraft] = useState<DraftConfig>(config ?? {})

  function isValid(): boolean {
    if (!draft.nextHousing) return false
    if (!isNewHome && !draft.currentHousing) return false
    if (!isNewHome && draft.currentHousing !== 'maemae' && !draft.exitType) return false
    return true
  }

  function handleSave() {
    if (!isValid() || !draft.nextHousing) return
    onSave({
      nextHousing: draft.nextHousing,
      currentHousing: draft.currentHousing,
      exitType: draft.exitType,
    })
    setIsEditing(false)
  }

  if (!isEditing && hasValidConfig) {
    return (
      <div className="mx-4 mt-3 mb-1 border border-border rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-tertiary mb-0.5">현재 상황</p>
          <p className="text-sm font-semibold text-text-dark">
            {configSummary(checklistType, config!)}
          </p>
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

      {!isNewHome && (
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
      )}

      <div className="mb-3">
        <p className="text-xs font-semibold text-sub mb-2">
          {isNewHome ? '구하려는 집 유형' : '이사할 집 유형'}
        </p>
        <HousingToggle
          value={draft.nextHousing}
          onChange={v => setDraft(d => ({ ...d, nextHousing: v }))}
        />
      </div>

      {!isNewHome && draft.currentHousing !== 'maemae' && (
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
        disabled={!isValid()}
        className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors
          ${isValid()
            ? 'bg-primary text-white cursor-pointer'
            : 'bg-border text-tertiary cursor-not-allowed'}`}
      >
        저장
      </button>
    </div>
  )
}
