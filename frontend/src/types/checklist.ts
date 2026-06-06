export type ChecklistType = 'new-home' | 'move'
export type HousingType = 'monthly' | 'jeonse' | 'maemae'
export type ExitType = 'expired' | 'early'

export interface SituationConfig {
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
