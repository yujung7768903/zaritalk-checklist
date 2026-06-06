export type ChecklistType = 'new-home' | 'jeonse-move' | 'monthly-move'

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
}

export interface ChecklistSection {
  id: string
  title: string
  items: ChecklistItem[]
}

export interface GlossaryTerm {
  id: string
  term: string
  category: string
  meaning: string
  detail?: string
}
