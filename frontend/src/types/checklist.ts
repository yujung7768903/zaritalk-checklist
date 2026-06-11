export type ChecklistType = 'new-home' | 'move'
export type HousingType = 'monthly' | 'jeonse' | 'maemae'
export type ExitType = 'expired' | 'early'

export interface NewHomeSituationConfig {
  nextHousing: HousingType
}

export interface MoveSituationConfig {
  currentHousing: HousingType
  nextHousing: HousingType
  exitType?: ExitType
}

export type SituationConfig = NewHomeSituationConfig | MoveSituationConfig

/** 서버 응답의 situationConfig 원본 형태. 미설정 시 모든 필드가 null로 내려온다. */
export interface SituationConfigDto {
  currentHousing: HousingType | null
  nextHousing: HousingType | null
  exitType: ExitType | null
}

/**
 * 서버 응답을 체크리스트 타입별 필수 항목이 모두 채워진 경우에만 SituationConfig로 변환한다.
 * 필수 항목이 비어 있으면 "현재 상황 미설정" 상태로 보고 null을 반환한다.
 */
export function parseSituationConfig(checklistType: ChecklistType, dto: SituationConfigDto | null): SituationConfig | null {
  if (!dto || !dto.nextHousing) return null

  if (checklistType === 'new-home') {
    return { nextHousing: dto.nextHousing }
  }

  if (!dto.currentHousing) return null
  if (dto.currentHousing !== 'maemae' && !dto.exitType) return null

  return {
    currentHousing: dto.currentHousing,
    nextHousing: dto.nextHousing,
    exitType: dto.exitType ?? undefined,
  }
}

/** showWhen 조건 매칭에 사용하는 공통 형태. NewHome/MoveSituationConfig 모두 구조적으로 호환된다. */
export interface SituationValues {
  currentHousing?: HousingType
  nextHousing: HousingType
  exitType?: ExitType
}

export interface SituationCondition {
  currentHousing?: HousingType[]
  nextHousing?: HousingType[]
  exitType?: ExitType[]
}

export interface ExternalLink {
  label: string
  url: string
}

export interface ChecklistItem {
  id: string
  title: string
  why: string
  how: string[]
  cost: string
  checks: string[]
  links: ExternalLink[]
  note?: string
  important?: boolean
  showWhen?: SituationCondition
}

export interface ChecklistSection {
  id: string
  title: string
  items: ChecklistItem[]
  showWhen?: SituationCondition
}

export interface GlossaryTerm {
  id: string
  term: string
  category: string
  meaning: string
  detail?: string
}
