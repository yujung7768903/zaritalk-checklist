import type { HousingType, ExitType } from '../../types/checklist'

export const HOUSING_OPTIONS: { value: HousingType; label: string }[] = [
  { value: 'monthly', label: '월세' },
  { value: 'jeonse', label: '전세' },
  { value: 'maemae', label: '매매' },
]

export const EXIT_OPTIONS: { value: ExitType; label: string; desc: string }[] = [
  { value: 'expired', label: '계약 만료', desc: '계약 기간이 끝나서 나가는 경우' },
  { value: 'early', label: '중도 퇴실', desc: '계약 기간 중 나가는 경우' },
]

export const HOUSING_LABEL: Record<HousingType, string> = { monthly: '월세', jeonse: '전세', maemae: '매매' }
export const EXIT_LABEL: Record<ExitType, string> = { expired: '계약 만료', early: '중도 퇴실' }

export function HousingToggle({
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
