export type DiagnosisType = 'jeonse' | 'maemae' | 'monthly'
export type HousingType = 'apt' | 'villa' | 'house' | 'officetel'
export type OwnedHomes = 0 | 1 | 2

export interface AddressInfo {
  roadAddress: string
  jibunAddress: string
  sigunguCode: string
  dongName: string
  zonecode: string
}

export interface JeonseInput {
  address: AddressInfo | null
  deposit: number
  mortgage: number
  housingType: HousingType
  area: number
  marketPrice: number
  marketPriceSource: 'api' | 'manual'
}

export interface MaemaeInput {
  address: AddressInfo | null
  purchasePrice: number
  housingType: HousingType
  ownedHomes: OwnedHomes
  annualIncome: number
  area: number
}

export interface MonthlyInput {
  address: AddressInfo | null
  deposit: number
  housingType: HousingType
  region: 'seoul' | 'gyeonggi' | 'metro' | 'other'
}

export type RiskGrade = 'safe' | 'normal' | 'caution' | 'danger'

export interface RiskLevel {
  grade: RiskGrade
  label: string
  color: string
  bg: string
}

export interface CheckItem {
  status: 'ok' | 'warn' | 'danger' | 'info'
  title: string
  desc: string
  link?: { label: string; url: string }
  tooltip?: string
}

export interface AcquisitionCost {
  label: string
  amount: number
  badge?: string
  badgeType?: 'ok' | 'warn' | 'danger' | 'info'
}

export interface JeonseResult {
  jeonsaeRatio: number
  debtRatio: number
  risk: RiskLevel
  hugPossible: boolean
  hfPossible: boolean
  hugNote: string
  marketPrice: number
  marketPriceSource: 'api' | 'manual'
  checklist: CheckItem[]
}

export interface MaemaeResult {
  ltvLimit: number
  maxLoan: number
  requiredCapital: number
  monthlyRepayment: number
  dsr: number
  regionLabel: string
  recentTradePrice: number | null
  acquisitionCosts: AcquisitionCost[]
  totalCost: number
  checklist: CheckItem[]
}

export interface MonthlyResult {
  deposit: number
  priorityProtection: boolean
  protectionLimit: number
  regionLabel: string
  checklist: CheckItem[]
}
