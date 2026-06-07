import type {
  JeonseInput, JeonseResult,
  MaemaeInput, MaemaeResult,
  MonthlyInput, MonthlyResult,
  RiskLevel, CheckItem, AcquisitionCost, HugCondition,
} from '../types/diagnosis'

// ── 공통 ──────────────────────────────────────────────────────────────────

function riskFromRatio(ratio: number): RiskLevel {
  if (ratio < 70) return { grade: 'safe',    label: '안전', color: 'var(--color-success)', bg: 'var(--color-success-bg)' }
  if (ratio < 80) return { grade: 'caution', label: '주의', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' }
  return               { grade: 'danger',  label: '위험', color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)' }
}

// ── 전세 ──────────────────────────────────────────────────────────────────

function isMetropolitan(sigunguCode?: string): boolean {
  if (!sigunguCode) return false
  return sigunguCode.startsWith('11') || sigunguCode.startsWith('28') || sigunguCode.startsWith('41')
}

function buildHugConditions(input: JeonseInput, debtRatio: number): HugCondition[] {
  const { deposit, mortgage, marketPrice, housingType, address } = input
  const metro = isMetropolitan(address?.sigunguCode)
  const depositLimit = metro ? 700_000_000 : 500_000_000
  const depositLimitLabel = metro ? '수도권 7억원' : '지방 5억원'
  const seniorLimit = marketPrice * 0.9 * 0.6

  return [
    {
      label: `보증금 한도 (${depositLimitLabel} 이하)`,
      status: deposit <= depositLimit ? 'ok' : 'fail',
      desc: deposit <= depositLimit
        ? `${depositLimitLabel} 이하 조건 충족`
        : `${depositLimitLabel} 초과로 가입 불가`,
    },
    {
      label: '담보인정비율 90% 이내',
      status: debtRatio <= 90 ? 'ok' : 'fail',
      desc: debtRatio <= 90
        ? `(전세금 + 선순위채권) / 시세 = ${debtRatio}%`
        : `(전세금 + 선순위채권) / 시세 = ${debtRatio}% — 90% 초과로 가입 불가`,
    },
    {
      label: '선순위채권 주택가액의 60% 이내',
      status: mortgage <= seniorLimit ? 'ok' : 'fail',
      desc: mortgage <= seniorLimit
        ? '선순위채권이 주택가액(시세×90%)의 60% 이내'
        : '선순위채권이 주택가액(시세×90%)의 60% 초과로 가입 불가',
    },
    {
      label: '전입신고 및 확정일자',
      status: 'check',
      desc: '신청 주택에 거주하며 전입신고를 하고 확정일자를 받아야 합니다.',
      link: { label: '정부24', url: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000016', menu: '민원서비스 > 민원 찾기 > 검색' },
    },
    {
      label: '등기부등본 권리침해사항 없음',
      status: 'check',
      desc: '경매신청·압류·가압류·가처분·가등기 등이 없는지 확인하세요. (등기부등본 갑구)',
      link: { label: '인터넷등기소', url: 'https://www.iros.go.kr', menu: '메인 > 부동산 열람·발급' },
    },
    {
      label: '건물·토지 임대인 소유',
      status: 'check',
      desc: '건물과 토지(대지권) 모두 임대인 소유인지 확인하세요. (등기부등본 표제부)',
      link: { label: '인터넷등기소', url: 'https://www.iros.go.kr', menu: '메인 > 부동산 열람·발급' },
    },
    {
      label: '전세계약기간 1년 이상',
      status: 'check',
      desc: '전세계약서상 계약기간이 1년 이상인지 확인하세요.',
    },
    ...(housingType !== 'apt' ? [{
      label: '위반건축물 아닐 것',
      status: 'check' as const,
      desc: '건축물대장상 위반건축물로 기재되지 않았는지 확인하세요.',
      link: { label: '정부24', url: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=15000000098&HighCtgCD=A02004002&tp_seq=01&Mcode=10205', menu: '서비스 > 건축물대장 등·초본 발급' },
    }] : []),
    {
      label: '임대인 보증금지대상자 아닐 것',
      status: 'check',
      desc: '임대인이 HUG 보증금지대상자이면 가입이 불가합니다.',
      link: { label: '안심전세앱', url: 'https://www.khug.or.kr/jeonse/web/s01/s010102.jsp', menu: '안심조회 > 안심임대인 조회' },
    },
  ]
}

export function calcJeonse(input: JeonseInput): JeonseResult {
  const { deposit, mortgage, marketPrice, marketPriceSource } = input
  const jeonsaeRatio = marketPrice > 0 ? Math.round((deposit / marketPrice) * 1000) / 10 : 0
  const debtRatio    = marketPrice > 0 ? Math.round(((mortgage + deposit) / marketPrice) * 1000) / 10 : 0
  const risk         = riskFromRatio(jeonsaeRatio)
  const hugConditions = buildHugConditions(input, debtRatio)

  const checklist: CheckItem[] = [
    {
      status: 'warn',
      title: '등기부등본 근저당 재확인 필요',
      desc: '입력한 근저당 금액이 실제 등기부등본과 일치하는지 확인하세요. 추가 근저당이 있으면 담보인정비율이 달라질 수 있어요.',
      link: { label: '인터넷등기소', url: 'https://www.iros.go.kr' },
    },
    {
      status: 'warn',
      title: '임대인 체납세금 확인',
      desc: '계약 전 임대인에게 세금 납부 확인서를 요청하거나, 계약서에 특약으로 명시하세요.',
    }
  ]

  return { jeonsaeRatio, debtRatio, risk, hugConditions, marketPrice, marketPriceSource, checklist }
}

// ── 매매 ──────────────────────────────────────────────────────────────────

interface LtvRule { region: string; ltv: number; tooltip: string }

function getLtvRule(sigunguCode: string | undefined, ownedHomes: number): LtvRule {
  // 2025년 기준 간략화 — 정확한 값은 금융기관 확인 필요
  const speculative = ['11650', '11680', '11470', '11590', '11710'] // 강남·서초·송파·용산 등
  const adjustment  = ['41135', '41115', '41117', '11140', '11170'] // 수원 등 일부
  const code        = sigunguCode ?? ''

  if (speculative.includes(code)) {
    if (ownedHomes === 0) return { region: '투기과열지구', ltv: 40, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
    if (ownedHomes === 1) return { region: '투기과열지구', ltv: 20, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
    return { region: '투기과열지구', ltv: 0, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
  }
  if (adjustment.includes(code)) {
    if (ownedHomes === 0) return { region: '조정대상지역', ltv: 60, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
    if (ownedHomes === 1) return { region: '조정대상지역', ltv: 40, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
    return { region: '조정대상지역', ltv: 0, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
  }
  if (ownedHomes === 0) return { region: '일반지역', ltv: 70, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
  if (ownedHomes === 1) return { region: '일반지역', ltv: 60, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
  return { region: '일반지역', ltv: 50, tooltip: 'LTV·규제 기준은 정부 정책에 따라 자주 바뀝니다. 정확한 한도는 금융기관에 직접 확인하세요.' }
}

function acquisitionTax(price: number, ownedHomes: number): number {
  if (ownedHomes >= 2) return Math.round(price * 0.12)
  if (ownedHomes === 1) return Math.round(price * 0.08)
  // 무주택 1주택 취득세
  if (price <= 600_000_000) return Math.round(price * 0.01)
  if (price <= 900_000_000) return Math.round(price * 0.02)
  return Math.round(price * 0.03)
}

function brokerageFee(price: number): number {
  if (price <= 500_000_000) return Math.round(price * 0.004)
  if (price <= 900_000_000) return Math.round(price * 0.005)
  return Math.round(price * 0.009)
}

function monthlyRepayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0
  const r = annualRate / 12
  const n = years * 12
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1))
}

export function calcMaemae(input: MaemaeInput, recentTradePrice: number | null = null): MaemaeResult {
  const { purchasePrice, ownedHomes, annualIncome, address } = input
  const ltvRule  = getLtvRule(address?.sigunguCode, ownedHomes)
  const maxLoan  = Math.round(purchasePrice * ltvRule.ltv / 100)
  const monthly  = monthlyRepayment(maxLoan, 0.04, 30)
  const annualRepayment = monthly * 12
  const dsr      = annualIncome > 0 ? Math.round((annualRepayment / annualIncome) * 1000) / 10 : 0

  const acqTax   = acquisitionTax(purchasePrice, ownedHomes)
  const broker   = brokerageFee(purchasePrice)
  const legal    = 800_000
  const moving   = 1_500_000

  const acquisitionCosts: AcquisitionCost[] = [
    { label: '매매가', amount: purchasePrice },
    { label: `취득세 (${ownedHomes >= 2 ? '12%' : ownedHomes === 1 ? '8%' : purchasePrice > 900_000_000 ? '3%' : purchasePrice > 600_000_000 ? '2%' : '1%'})`, amount: acqTax, badge: ownedHomes >= 2 ? '중과' : undefined, badgeType: ownedHomes >= 2 ? 'danger' : 'info' },
    { label: '중개보수', amount: broker },
    { label: '법무사 비용 (등기)', amount: legal },
    { label: '이사비 (예상)', amount: moving },
  ]
  const totalCost = purchasePrice + acqTax + broker + legal + moving

  const requiredCapital = totalCost - maxLoan

  const isSpeculative = ltvRule.region === '투기과열지구'
  const checklist: CheckItem[] = [
    {
      status: isSpeculative ? 'danger' : 'info',
      title: `${ltvRule.region}`,
      desc: isSpeculative
        ? `LTV ${ltvRule.ltv}% 적용. 일반지역 대비 대출 한도가 낮아요.`
        : `LTV ${ltvRule.ltv}% 적용.`,
      tooltip: ltvRule.tooltip,
    },
    ...(isSpeculative ? [{
      status: 'warn' as const,
      title: '실거주 의무 확인 필요',
      desc: '투기과열지구 내 주택 구입 시 실거주 의무가 부과될 수 있어요. 전세 임대 계획이 있다면 사전에 확인하세요.',
    }] : []),
    {
      status: dsr <= 40 ? 'ok' : 'danger',
      title: `DSR ${dsr}% — ${dsr <= 40 ? '기준 충족' : '기준(40%) 초과'}`,
      desc: dsr <= 40
        ? `연소득 대비 원리금 상환 비율이 기준 이내예요.`
        : `DSR이 40%를 초과해 대출 승인이 어려울 수 있어요. 대출 금액 조정을 검토하세요.`,
      tooltip: 'DSR 기준도 정부 정책에 따라 변경될 수 있어요.',
    },
    {
      status: 'info',
      title: '재개발·재건축 여부 확인',
      desc: '토지이용계획 열람에서 정비구역 지정 여부를 확인하세요.',
      link: { label: '토지이용계획 열람', url: 'https://www.eum.go.kr' },
    },
    ...(recentTradePrice ? [{
      status: purchasePrice > recentTradePrice * 1.05 ? 'warn' as const : 'ok' as const,
      title: `최근 실거래가 대비 ${purchasePrice > recentTradePrice ? '+' : ''}${Math.round((purchasePrice - recentTradePrice) / 10000).toLocaleString()}만원`,
      desc: `최근 3개월 실거래 평균: ${Math.round(recentTradePrice / 10000).toLocaleString()}만원`,
    }] : []),
  ]

  return {
    ltvLimit: ltvRule.ltv,
    maxLoan,
    requiredCapital,
    monthlyRepayment: monthly,
    dsr,
    regionLabel: ltvRule.region,
    recentTradePrice,
    acquisitionCosts,
    totalCost,
    checklist,
  }
}

// ── 월세 ──────────────────────────────────────────────────────────────────

const PRIORITY_PROTECTION: Record<string, { limit: number; label: string }> = {
  seoul:    { limit: 55_000_000, label: '서울' },
  gyeonggi: { limit: 48_000_000, label: '수도권(서울 제외)' },
  metro:    { limit: 28_000_000, label: '광역시' },
  other:    { limit: 24_000_000, label: '기타 지역' },
}

export function calcMonthly(input: MonthlyInput): MonthlyResult {
  const { deposit, region } = input
  const rule = PRIORITY_PROTECTION[region]
  const priorityProtection = deposit <= rule.limit

  const checklist: CheckItem[] = [
    {
      status: priorityProtection ? 'ok' : 'warn',
      title: priorityProtection
        ? `소액보증금 최우선변제 대상 (${rule.label} 기준: ${(rule.limit / 10000).toLocaleString()}만원 이하)`
        : `소액보증금 최우선변제 한도 초과`,
      desc: priorityProtection
        ? '경매 낙찰 시 다른 채권보다 우선하여 보증금 일부를 돌려받을 수 있어요.'
        : `${rule.label} 기준 최우선변제 한도(${(rule.limit / 10000).toLocaleString()}만원)를 초과해 우선변제 혜택이 없어요. 전입신고와 확정일자를 반드시 받으세요.`,
    },
    {
      status: 'warn',
      title: '전입신고 + 확정일자',
      desc: '입주 당일 주민센터 또는 인터넷등기소에서 전입신고와 확정일자를 받으면 대항력이 생겨요.',
      link: { label: '인터넷등기소', url: 'https://www.iros.go.kr' },
    },
    {
      status: 'info',
      title: '등기부등본 근저당 확인',
      desc: '계약 전 근저당이 없는지 반드시 확인하세요. 근저당이 있으면 경매 시 보증금 회수가 어려울 수 있어요.',
      link: { label: '인터넷등기소', url: 'https://www.iros.go.kr' },
    },
    {
      status: 'warn',
      title: '임대인 체납세금 확인',
      desc: '국세 완납 증명서를 임대인에게 요청하거나 계약서에 특약으로 체납 없음을 명시하세요.',
    },
  ]

  return { deposit, priorityProtection, protectionLimit: rule.limit, regionLabel: rule.label, checklist }
}

// ── 포맷 유틸 ─────────────────────────────────────────────────────────────

export function formatWon(n: number): string {
  if (n >= 100_000_000) {
    const eok  = Math.floor(n / 100_000_000)
    const man  = Math.round((n % 100_000_000) / 10_000)
    return man > 0 ? `${eok.toLocaleString()}억 ${man.toLocaleString()}만` : `${eok.toLocaleString()}억`
  }
  return `${Math.round(n / 10_000).toLocaleString()}만`
}

export function parseNumeric(val: string): number {
  return Number(val.replace(/[^0-9]/g, '')) || 0
}

export function parseManwon(val: string): number {
  return parseNumeric(val) * 10_000
}

export function formatNumericInput(val: string): string {
  const num = val.replace(/[^0-9]/g, '')
  return num ? Number(num).toLocaleString('ko-KR') : ''
}
