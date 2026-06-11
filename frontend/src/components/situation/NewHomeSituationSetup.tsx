import { useState } from 'react'
import type { NewHomeSituationConfig, HousingType } from '../../types/checklist'
import { HOUSING_LABEL, HousingToggle } from './HousingToggle'

interface Props {
  config: NewHomeSituationConfig | null
  onSave: (config: NewHomeSituationConfig) => void
}

export default function NewHomeSituationSetup({ config, onSave }: Props) {
  const hasValidConfig = !!config?.nextHousing
  const [isEditing, setIsEditing] = useState(!hasValidConfig)
  const [nextHousing, setNextHousing] = useState<HousingType | undefined>(config?.nextHousing)

  // 서버에서 현재 상황을 비동기로 받아온 뒤 config가 갱신되면 화면 상태를 동기화한다
  const [prevConfig, setPrevConfig] = useState(config)
  if (config !== prevConfig) {
    setPrevConfig(config)
    setIsEditing(!config?.nextHousing)
    setNextHousing(config?.nextHousing)
  }

  function handleSave() {
    if (!nextHousing) return
    onSave({ nextHousing })
    setIsEditing(false)
  }

  if (!isEditing && hasValidConfig && config) {
    return (
      <div className="mx-4 mt-3 mb-1 border border-border rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-tertiary mb-0.5">현재 상황</p>
          <p className="text-sm font-semibold text-text-dark">{HOUSING_LABEL[config.nextHousing]} 구하기</p>
        </div>
        <button
          onClick={() => { setNextHousing(config.nextHousing); setIsEditing(true) }}
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
        <p className="text-xs font-semibold text-sub mb-2">구하려는 집 유형</p>
        <HousingToggle value={nextHousing} onChange={setNextHousing} />
      </div>

      <button
        onClick={handleSave}
        disabled={!nextHousing}
        className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors
          ${nextHousing
            ? 'bg-primary text-white cursor-pointer'
            : 'bg-border text-tertiary cursor-not-allowed'}`}
      >
        저장
      </button>
    </div>
  )
}
