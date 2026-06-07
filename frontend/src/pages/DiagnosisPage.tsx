import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { DiagnosisType, HousingType, OwnedHomes, JeonseInput, MaemaeInput, MonthlyInput, JeonseResult, MaemaeResult, MonthlyResult } from '../types/diagnosis'
import { calcJeonse, calcMaemae, calcMonthly, formatWon, parseNumeric, parseManwon, formatNumericInput } from '../utils/diagnosisCalc'
import { fetchMarketPrice, fetchAvailableAreas } from '../api/diagnosisApi'
import AddressSearch from '../components/diagnosis/AddressSearch'
import InfoTooltip from '../components/diagnosis/InfoTooltip'
import GaugeBar from '../components/diagnosis/GaugeBar'
import CheckItems from '../components/diagnosis/CheckItems'

const TITLE: Record<DiagnosisType, string> = {
  jeonse:  '전세 안전진단',
  maemae:  '매매 안전진단',
  monthly: '월세 안전진단',
}

const HOUSING_OPTIONS: { value: HousingType; label: string }[] = [
  { value: 'apt',       label: '아파트' },
  { value: 'villa',     label: '빌라·다세대' },
  { value: 'house',     label: '단독주택' },
  { value: 'officetel', label: '오피스텔' },
]

const REGION_OPTIONS = [
  { value: 'seoul',    label: '서울' },
  { value: 'gyeonggi', label: '수도권(서울 제외)' },
  { value: 'metro',    label: '광역시' },
  { value: 'other',    label: '기타 지역' },
]

// ── 주택 유형 토글 ─────────────────────────────────────────────────────────

function HousingTypeToggle({
  value,
  onChange,
}: {
  value: HousingType | null
  onChange: (v: HousingType) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {HOUSING_OPTIONS.map(({ value: v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer
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

// ── 숫자 입력 필드 ─────────────────────────────────────────────────────────

function NumInput({ label, value, onChange, hint }: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  const num = parseNumeric(value)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-sub">{label}</label>
      <div className="flex items-center h-9 border border-border rounded-lg px-3 focus-within:border-primary transition-colors bg-white">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(formatNumericInput(e.target.value))}
          placeholder="0"
          className="flex-1 text-sm text-text outline-none bg-transparent"
        />
        <span className="text-xs text-tertiary ml-1 shrink-0">만원</span>
      </div>
      {num > 0 && <p className="text-xs text-primary px-0.5">{formatWon(num * 10_000)}</p>}
      {hint && <p className="text-xs text-tertiary px-0.5">{hint}</p>}
    </div>
  )
}

function SelectInput({ label, value, options, onChange }: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-sub">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 border border-border rounded-lg px-3 text-sm text-text bg-white focus:border-primary outline-none transition-colors"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// 전용면적 선택
function AreaInput({ value, onChange, options, loading = false }: {
  value: string
  onChange: (v: string) => void
  options: number[]
  loading?: boolean
}) {
  const [isManual, setIsManual] = useState(false)
  const showDropdown = options.length > 0 && !isManual

  const switchToManual = () => { setIsManual(true); onChange('') }
  const switchToList   = () => { setIsManual(false); onChange('') }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-sub">전용 면적</label>
        {!loading && options.length > 0 && (
          <button
            onClick={showDropdown ? switchToManual : switchToList}
            className="text-[11px] text-primary cursor-pointer"
          >
            {showDropdown ? '직접 입력' : '목록에서 선택'}
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex items-center h-9 border border-border rounded-lg px-3 bg-subtle">
          <span className="text-sm text-tertiary">조회 중...</span>
        </div>
      ) : showDropdown ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-9 border border-border rounded-lg px-3 text-sm text-text bg-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="">선택</option>
          {options.map(a => (
            <option key={a} value={String(a)}>{a}㎡</option>
          ))}
        </select>
      ) : (
        <div className="flex items-center h-9 border border-border rounded-lg px-3 focus-within:border-primary transition-colors bg-white">
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            className="flex-1 text-sm text-text outline-none bg-transparent"
          />
          <span className="text-xs text-tertiary ml-1 shrink-0">㎡</span>
        </div>
      )}
    </div>
  )
}

// ── 공통 레이아웃 ──────────────────────────────────────────────────────────

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{children}</p>
}

function STitle({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-semibold text-text mb-3">{children}</p>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-border p-5 ${className}`}>
      {children}
    </div>
  )
}

function DiagnoseButton({ onClick, disabled, children }: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer bg-primary text-white disabled:bg-border disabled:text-tertiary disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

// ── 결과 배너 ──────────────────────────────────────────────────────────────

function ResultBanner({ grade, title, desc }: { grade: string; title: string; desc: string }) {
  const style =
    grade === 'safe'    ? { bg: 'var(--color-success-bg)', border: 'var(--color-success-border)', titleColor: 'var(--color-success-text-dark)', descColor: 'var(--color-success-text)', icon: '✓' } :
    grade === 'caution' ? { bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', titleColor: 'var(--color-warning-text-dark)', descColor: 'var(--color-warning-text)', icon: '!' } :
                          { bg: 'var(--color-danger-bg)', border: 'var(--color-danger-border)', titleColor: 'var(--color-danger-text)', descColor: 'var(--color-danger-text)', icon: '✕' }

  return (
    <div className="rounded-xl p-4 mb-4 border flex items-start gap-3" style={{ background: style.bg, borderColor: style.border }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: style.border, color: style.titleColor }}>
        {style.icon}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: style.titleColor }}>{title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: style.descColor }}>{desc}</p>
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, valueColor, tooltip }: { label: string; value: string; sub?: string; valueColor?: string; tooltip?: string }) {
  return (
    <div className="bg-subtle rounded-xl p-3.5">
      <div className="flex items-center gap-1 mb-1.5">
        <p className="text-xs text-tertiary">{label}</p>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <p className="text-lg font-semibold" style={{ color: valueColor ?? 'var(--color-text)' }}>{value}</p>
      {sub && <p className="text-[11px] text-tertiary mt-1">{sub}</p>}
    </div>
  )
}

// ── 전세 결과 ──────────────────────────────────────────────────────────────

function JeonseResultView({ result }: { result: JeonseResult }) {
  const { jeonsaeRatio, debtRatio, risk, hugConditions, marketPrice, marketPriceSource, checklist } = result
  const bannerTitle = risk.grade === 'safe'    ? '비교적 안전한 전세예요'
                    : risk.grade === 'caution' ? '주의 필요 — 계약 전 추가 확인 권장'
                    :                            '위험 — 계약 전 전문가 상담 권장'
  const bannerDesc  = risk.grade === 'safe'    ? '전세가율이 안전 기준(70%) 이내예요. 보증보험 가입 여부도 꼭 확인하세요.'
                    : risk.grade === 'caution' ? `전세가율 ${jeonsaeRatio}%로 안전 기준(70%)을 초과했어요. 보증보험 가입 가능 여부를 확인하세요.`
                    :                            `전세가율 ${jeonsaeRatio}%로 매우 높아요. 경매 시 보증금 전액 회수가 어려울 수 있어요.`

  return (
    <div className="space-y-4">
      <SLabel>분석 결과</SLabel>
      <ResultBanner grade={risk.grade} title={bannerTitle} desc={bannerDesc} />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="전세가율" value={`${jeonsaeRatio}%`} sub="기준 70% 이하" valueColor={risk.color} tooltip="보증금 ÷ 시세. 70% 이하면 경매 시 보증금 전액 회수 가능성이 높아요." />
        <MetricCard label="부채비율" value={`${debtRatio}%`} sub="HUG 기준 90% 이하" valueColor={debtRatio > 90 ? 'var(--color-danger)' : 'var(--color-text)'} tooltip="(보증금 + 근저당) ÷ 시세. HUG 전세보증보험 가입 기준은 90% 이하예요." />
        <MetricCard
          label="추정 시세"
          value={formatWon(marketPrice)}
          sub={marketPriceSource === 'api' ? '국토부 실거래가' : '직접 입력'}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-tertiary">전세가율 안전 구간</p>
          <p className="text-xs font-semibold" style={{ color: risk.color }}>현재 {jeonsaeRatio}%</p>
        </div>
        <GaugeBar
          value={jeonsaeRatio}
          color={risk.color}
          ticks={[
            { pct: 0,   label: '0%' },
            { pct: 70,  label: '70% 안전', color: 'var(--color-success)' },
            { pct: 80,  label: '80% 주의', color: 'var(--color-warning)' },
            { pct: 100, label: '100%' },
          ]}
        />
      </Card>

      <Card>
        <STitle>HUG 전세보증금반환보증 조건</STitle>
        <div className="space-y-2.5">
          {hugConditions.map(({ label, status, desc, link }) => (
            <div key={label} className="flex items-start justify-between gap-3 pb-2.5 border-b border-bg last:border-b-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-medium">{label}</p>
                <p className="text-xs text-tertiary mt-0.5 leading-relaxed">{desc}</p>
                {link && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary"
                  >
                    <span className="font-medium">{link.label}</span>
                    <span className="text-tertiary">· {link.menu}</span>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="shrink-0">
                      <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3.5M8.5 1.5V6.5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                )}
              </div>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                style={
                  status === 'ok'   ? { background: 'var(--color-success-bg)',  color: 'var(--color-success-text-dark)' } :
                  status === 'fail' ? { background: 'var(--color-danger-bg)',   color: 'var(--color-danger-text)' } :
                                      { background: 'var(--color-warning-bg)',  color: 'var(--color-warning-text-dark)' }
                }
              >
                {status === 'ok' ? '충족' : status === 'fail' ? '불충족' : '확인필요'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <STitle>추가 확인 항목</STitle>
        <CheckItems items={checklist} />
      </div>
    </div>
  )
}

// ── 매매 결과 ──────────────────────────────────────────────────────────────

function MaemaeResultView({ result }: { result: MaemaeResult }) {
  const { ltvLimit, maxLoan, requiredCapital, monthlyRepayment, dsr, regionLabel, recentTradePrice, acquisitionCosts, totalCost, checklist } = result
  const dsrOk = dsr <= 40
  const bannerGrade = !dsrOk ? 'danger' : ltvLimit >= 60 ? 'safe' : 'caution'
  const bannerTitle = bannerGrade === 'safe'    ? '매매 진행 가능 — 대출 조건 충족'
                    : bannerGrade === 'caution' ? '주의 — 규제지역 대출 한도 확인 필요'
                    :                            'DSR 초과 — 대출 승인이 어려울 수 있어요'
  const bannerDesc  = `${regionLabel} 기준 LTV ${ltvLimit}% 적용. 취득 비용 포함 총 필요 자금을 확인하세요.`

  return (
    <div className="space-y-4">
      <SLabel>분석 결과</SLabel>
      <ResultBanner grade={bannerGrade} title={bannerTitle} desc={bannerDesc} />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="최대 대출 한도" value={formatWon(maxLoan)} sub={`LTV ${ltvLimit}% 기준`} />
        <MetricCard label="필요 자기자본"  value={formatWon(requiredCapital)} sub="매매가+취득비용-대출" />
        <MetricCard label="월 예상 상환액" value={`${(monthlyRepayment / 10000).toFixed(0)}만원`} sub="30년 원리금균등, 연 4%" />
        <MetricCard label="DSR" value={`${dsr}%`} sub="기준 40% 이하" valueColor={dsrOk ? 'var(--color-success)' : 'var(--color-danger)'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-tertiary mb-1">LTV 한도 현황 <span className="font-normal">— {regionLabel}</span></p>
          <GaugeBar
            value={ltvLimit}
            color={ltvLimit >= 60 ? 'var(--color-success-bar)' : ltvLimit >= 40 ? 'var(--color-warning-border)' : 'var(--color-danger-bar)'}
            ticks={[
              { pct: 0,       label: '0%' },
              { pct: ltvLimit, label: `${ltvLimit}%`, color: 'var(--color-success-text)' },
              { pct: 80,      label: '80%' },
            ]}
          />
        </Card>
        <Card>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-tertiary">DSR 현황</p>
            <InfoTooltip text="DSR 기준은 정부 정책에 따라 자주 바뀔 수 있어요. 본 수치는 참고용이며 정확한 한도는 금융기관에 확인하세요." />
          </div>
          <GaugeBar
            value={dsr}
            color={dsrOk ? 'var(--color-success-bar)' : 'var(--color-danger-bar)'}
            ticks={[
              { pct: 0,   label: '0%' },
              { pct: 40,  label: '40% 한도', color: 'var(--color-danger-text)' },
              { pct: 100, label: '100%' },
            ]}
          />
        </Card>
      </div>

      <Card>
        <STitle>취득 비용 계산</STitle>
        <table className="w-full text-sm">
          <tbody>
            {acquisitionCosts.map((c, i) => (
              <tr key={i} className="border-b border-bg last:border-b-0">
                <td className="py-2 text-sub">
                  {c.label}
                  {c.badge && (
                    <span className="ml-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }}>{c.badge}</span>
                  )}
                </td>
                <td className="py-2 text-right font-medium text-text">{formatWon(c.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-border-strong">
              <td className="pt-3 font-semibold text-text">총 필요 금액</td>
              <td className="pt-3 text-right font-bold text-text">{formatWon(totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {recentTradePrice && (
        <Card>
          <STitle>가격 적정성</STitle>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-bg">
                <td className="py-2 text-sub">최근 실거래가 (3개월 평균)</td>
                <td className="py-2 text-right font-medium text-text">{formatWon(recentTradePrice)}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      <div>
        <STitle>규제 및 권리 확인</STitle>
        <CheckItems items={checklist} />
      </div>
    </div>
  )
}

// ── 월세 결과 ──────────────────────────────────────────────────────────────

function MonthlyResultView({ result }: { result: MonthlyResult }) {
  const { priorityProtection, protectionLimit, regionLabel, checklist } = result

  return (
    <div className="space-y-4">
      <SLabel>분석 결과</SLabel>
      <ResultBanner
        grade={priorityProtection ? 'safe' : 'caution'}
        title={priorityProtection ? '소액보증금 최우선변제 대상이에요' : '최우선변제 한도 초과 — 추가 확인 필요'}
        desc={`${regionLabel} 기준 최우선변제 한도: ${formatWon(protectionLimit)}`}
      />
      <div>
        <STitle>확인 항목</STitle>
        <CheckItems items={checklist} />
      </div>
    </div>
  )
}

// ── 확인 다이얼로그 ────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <p className="text-sm text-text leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 h-10 rounded-lg text-sm font-semibold bg-bg text-sub cursor-pointer">취소</button>
          <button onClick={onConfirm} className="flex-1 h-10 rounded-lg text-sm font-semibold bg-primary text-white cursor-pointer">계속</button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────

export default function DiagnosisPage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const diagType = (type as DiagnosisType) ?? 'jeonse'
  const resultRef = useRef<HTMLDivElement>(null)

  // 전세 상태
  const [jHousing,      setJHousing]      = useState<HousingType | null>(null)
  const [jAddr,         setJAddr]         = useState<JeonseInput['address']>(null)
  const [jAreaOpts,     setJAreaOpts]     = useState<number[]>([])
  const [jArea,         setJArea]         = useState('')
  const [jAreaFetching, setJAreaFetching] = useState(false)
  const [jDeposit,      setJDeposit]      = useState('')
  const [jMortgage,     setJMortgage]     = useState('')
  const [jMarket,       setJMarket]       = useState('')
  const [jMarketSrc,    setJMarketSrc]    = useState<'api' | 'manual'>('manual')
  const [jFetching,     setJFetching]     = useState(false)
  const [jResult,       setJResult]       = useState<JeonseResult | null>(null)

  // 매매 상태
  const [mHousing,      setMHousing]      = useState<HousingType | null>(null)
  const [mAddr,         setMAddr]         = useState<MaemaeInput['address']>(null)
  const [mAreaOpts,     setMAreaOpts]     = useState<number[]>([])
  const [mArea,         setMArea]         = useState('')
  const [mAreaFetching, setMAreaFetching] = useState(false)
  const [mPrice,        setMPrice]        = useState('')
  const [mOwned,        setMOwned]        = useState<OwnedHomes>(0)
  const [mIncome,       setMIncome]       = useState('')
  const [mResult,       setMResult]       = useState<MaemaeResult | null>(null)

  // 월세 상태
  const [wHousing,  setWHousing]  = useState<HousingType | null>(null)
  const [wAddr,     setWAddr]     = useState<MonthlyInput['address']>(null)
  const [wDeposit,  setWDeposit]  = useState('')
  const [wRegion,   setWRegion]   = useState<MonthlyInput['region']>('seoul')
  const [wResult,   setWResult]   = useState<MonthlyResult | null>(null)

  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const scrollToResult = () => {
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const fetchMarket = async (addr: NonNullable<JeonseInput['address']>, housing: HousingType, area: string) => {
    if (!area || parseFloat(area) <= 0) return
    setJFetching(true)
    const res = await fetchMarketPrice(addr.sigunguCode, addr.dongName, housing, parseFloat(area), addr.buildingName)
    setJFetching(false)
    if (res) {
      setJMarket(Math.round(res.avgPrice / 10_000).toLocaleString('ko-KR'))
      setJMarketSrc('api')
    }
  }

  const handleJAreaChange = (v: string) => {
    setJArea(v)
    if (jAddr && jHousing && parseFloat(v) > 0) {
      fetchMarket(jAddr, jHousing, v)
    }
  }

  // 전세 핸들러 — 주택 유형 or 주소가 변경될 때 상대편이 이미 입력되어 있으면 전용면적 조회
  const handleJHousingChange = (v: HousingType) => {
    const doChange = () => { setJHousing(v); setJAddr(null); setJArea(''); setJAreaOpts([]) }
    if (jAddr !== null && v !== jHousing) {
      setConfirmDialog({ message: '주택 유형을 변경하면 입력한 주소 정보가 초기화됩니다.\n계속하시겠습니까?', onConfirm: () => { doChange(); setConfirmDialog(null) } })
      return
    }
    doChange()
  }

  const handleJAddr = async (a: NonNullable<JeonseInput['address']>) => {
    setJAddr(a)
    setJArea('')
    setJAreaOpts([])
    if (jHousing) {
      setJAreaFetching(true)
      const areas = await fetchAvailableAreas(a.sigunguCode, a.dongName, jHousing, a.buildingName, a.bcode, a.jibunAddress)
      setJAreaFetching(false)
      setJAreaOpts(areas)
      if (areas.length === 1) { setJArea(String(areas[0])); fetchMarket(a, jHousing, String(areas[0])) }
    }
  }

  // 매매 핸들러
  const handleMHousingChange = (v: HousingType) => {
    const doChange = () => { setMHousing(v); setMAddr(null); setMArea(''); setMAreaOpts([]) }
    if (mAddr !== null && v !== mHousing) {
      setConfirmDialog({ message: '주택 유형을 변경하면 입력한 주소 정보가 초기화됩니다.\n계속하시겠습니까?', onConfirm: () => { doChange(); setConfirmDialog(null) } })
      return
    }
    doChange()
  }

  const handleMAddr = async (a: NonNullable<MaemaeInput['address']>) => {
    setMAddr(a)
    setMArea('')
    setMAreaOpts([])
    if (mHousing) {
      setMAreaFetching(true)
      const areas = await fetchAvailableAreas(a.sigunguCode, a.dongName, mHousing, a.buildingName, a.bcode, a.jibunAddress)
      setMAreaFetching(false)
      setMAreaOpts(areas)
      if (areas.length === 1) setMArea(String(areas[0]))
    }
  }

  const diagnoseJeonse = () => {
    if (!jHousing) return
    setJResult(calcJeonse({
      address:           jAddr,
      deposit:           parseManwon(jDeposit),
      mortgage:          parseManwon(jMortgage),
      housingType:       jHousing,
      area:              parseFloat(jArea) || 0,
      marketPrice:       parseManwon(jMarket),
      marketPriceSource: jMarketSrc,
    }))
    scrollToResult()
  }

  const diagnoseMaemae = async () => {
    if (!mHousing) return
    let recentPrice: number | null = null
    if (mAddr && mArea) {
      const res = await fetchMarketPrice(mAddr.sigunguCode, mAddr.dongName, mHousing, parseFloat(mArea), mAddr.buildingName)
      recentPrice = res?.avgPrice ?? null
    }
    setMResult(calcMaemae({
      address:       mAddr,
      purchasePrice: parseManwon(mPrice),
      housingType:   mHousing,
      ownedHomes:    mOwned,
      annualIncome:  parseManwon(mIncome),
      area:          parseFloat(mArea) || 0,
    }, recentPrice))
    scrollToResult()
  }

  const diagnoseMonthly = () => {
    if (!wHousing) return
    setWResult(calcMonthly({
      address:     wAddr,
      deposit:     parseManwon(wDeposit),
      housingType: wHousing,
      region:      wRegion,
    }))
    scrollToResult()
  }

  const jStep1Done = jHousing !== null && jAddr !== null
  const mStep1Done = mHousing !== null && mAddr !== null
  const wStep1Done = wHousing !== null && wAddr !== null

  const canDiagnoseJeonse  = jStep1Done && parseNumeric(jDeposit) > 0 && parseNumeric(jMarket) > 0
  const canDiagnoseMaemae  = mStep1Done && parseNumeric(mPrice) > 0 && parseNumeric(mIncome) > 0
  const canDiagnoseMonthly = wStep1Done && parseNumeric(wDeposit) > 0

  return (
    <>
    <div className="w-full min-h-screen bg-bg">
      <div className="w-full max-w-[640px] mx-auto bg-white min-h-screen">

        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b border-bg">
          <div className="flex items-center gap-3 px-4 pt-12 pb-3">
            <button onClick={() => navigate('/diagnosis')} className="p-2 -ml-2 text-sub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base font-bold text-text">{TITLE[diagType]}</h1>
          </div>
        </div>

        <div className="px-5 pt-5 pb-16 space-y-5">

          {/* ── 전세 ── */}
          {diagType === 'jeonse' && (
            <>
              {/* Step 1: 매물 정보 */}
              <Card>
                <SLabel>매물 정보 입력</SLabel>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-sub mb-1.5 block">주택 유형</label>
                    <HousingTypeToggle value={jHousing} onChange={handleJHousingChange} />
                  </div>
                  <div>
                    <label className="text-xs text-sub mb-1.5 block">주소</label>
                    <AddressSearch value={jAddr} onChange={handleJAddr} />
                  </div>
                </div>
              </Card>

              {/* Step 2: 전용 면적 */}
              {jStep1Done && (
                <Card>
                  <div className="flex items-center gap-1.5 mb-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">전용 면적</p>
                    <InfoTooltip text="주소를 기반으로 건축물대장 정보를 조회합니다. 조회가 어려울 경우 실거래 데이터를 바탕으로 수집합니다." />
                  </div>
                  <AreaInput key={jAreaOpts.join(',')} value={jArea} onChange={handleJAreaChange} options={jAreaOpts} loading={jAreaFetching} />
                </Card>
              )}

              {/* Step 3: 추정 시세 */}
              {jStep1Done && jArea !== '' && (
                <Card>
                  <div className="flex items-center gap-1.5 mb-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">추정 시세</p>
                    <InfoTooltip text="국토교통부 실거래가 기준으로 자동 조회됩니다. 조회가 안되는 경우 직접 입력하세요." />
                    {jMarketSrc === 'api' && !jFetching && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary-light text-primary">
                        국토부 실거래가
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center h-9 border rounded-lg px-3 transition-colors ${jFetching ? 'border-border bg-subtle' : 'border-border bg-white focus-within:border-primary'}`}>
                    {jFetching ? (
                      <span className="flex-1 text-sm text-tertiary">조회 중...</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={jMarket}
                        onChange={e => { setJMarket(formatNumericInput(e.target.value)); setJMarketSrc('manual') }}
                        placeholder="0"
                        className="flex-1 text-sm text-text outline-none bg-transparent"
                      />
                    )}
                    <span className="text-xs text-tertiary ml-1 shrink-0">만원</span>
                  </div>
                  {!jFetching && parseNumeric(jMarket) > 0 && (
                    <p className="text-xs text-primary mt-1 px-0.5">{formatWon(parseNumeric(jMarket) * 10_000)}</p>
                  )}
                </Card>
              )}

              {/* Step 4: 추가 정보 */}
              {jStep1Done && jArea !== '' && (
                <Card>
                  <SLabel>추가 정보 입력</SLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput label="전세 보증금" value={jDeposit} onChange={setJDeposit} />
                      <NumInput label="선순위 근저당" value={jMortgage} onChange={setJMortgage} hint="등기부등본 기준" />
                    </div>
                    <DiagnoseButton onClick={diagnoseJeonse} disabled={!canDiagnoseJeonse}>
                      안전 진단하기
                    </DiagnoseButton>
                  </div>
                </Card>
              )}

              {jResult && <div ref={resultRef}><JeonseResultView result={jResult} /></div>}
            </>
          )}

          {/* ── 매매 ── */}
          {diagType === 'maemae' && (
            <>
              {/* Step 1 */}
              <div>
                <SLabel>매물 정보 입력</SLabel>
                <Card>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-sub mb-1.5 block">주택 유형</label>
                      <HousingTypeToggle value={mHousing} onChange={handleMHousingChange} />
                    </div>
                    <div>
                      <label className="text-xs text-sub mb-1.5 block">주소</label>
                      <AddressSearch value={mAddr} onChange={handleMAddr} />
                    </div>
                  </div>
                </Card>
              </div>

              {mStep1Done && (
                <>
                  {/* Step 2: 전용면적 */}
                  <Card>
                    <div className="flex items-center gap-1.5 mb-3">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">전용면적</p>
                      <InfoTooltip text="주소를 기반으로 건축물대장 정보를 조회합니다. 조회가 어려울 경우 실거래 데이터를 바탕으로 수집합니다." />
                    </div>
                    <AreaInput key={mAreaOpts.join(',')} value={mArea} onChange={setMArea} options={mAreaOpts} loading={mAreaFetching} />
                  </Card>

                  {/* Step 3: 나머지 정보 */}
                  <Card>
                    <SLabel>추가 정보 입력</SLabel>
                    <div className="space-y-3">
                      <NumInput label="매매 희망가" value={mPrice} onChange={setMPrice} />
                      <div className="grid grid-cols-2 gap-3">
                        <SelectInput
                          label="현재 보유 주택 수"
                          value={String(mOwned)}
                          options={[
                            { value: '0', label: '0주택 (무주택)' },
                            { value: '1', label: '1주택' },
                            { value: '2', label: '2주택 이상' },
                          ]}
                          onChange={v => setMOwned(Number(v) as OwnedHomes)}
                        />
                        <NumInput label="연소득" value={mIncome} onChange={setMIncome} />
                      </div>
                      <DiagnoseButton onClick={diagnoseMaemae} disabled={!canDiagnoseMaemae}>
                        안전 진단하기
                      </DiagnoseButton>
                    </div>
                  </Card>
                </>
              )}

              {mResult && <div ref={resultRef}><MaemaeResultView result={mResult} /></div>}
            </>
          )}

          {/* ── 월세 ── */}
          {diagType === 'monthly' && (
            <>
              {/* Step 1 */}
              <div>
                <SLabel>매물 정보 입력</SLabel>
                <Card>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-sub mb-1.5 block">주택 유형</label>
                      <HousingTypeToggle value={wHousing} onChange={v => {
                        const doChange = () => { setWHousing(v); setWAddr(null) }
                        if (wAddr !== null && v !== wHousing) {
                          setConfirmDialog({ message: '주택 유형을 변경하면 입력한 주소 정보가 초기화됩니다.\n계속하시겠습니까?', onConfirm: () => { doChange(); setConfirmDialog(null) } })
                          return
                        }
                        doChange()
                      }} />
                    </div>
                    <div>
                      <label className="text-xs text-sub mb-1.5 block">주소</label>
                      <AddressSearch value={wAddr} onChange={setWAddr} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Step 3: 나머지 정보 (월세는 전용면적 불필요) */}
              {wStep1Done && (
                <Card>
                  <SLabel>추가 정보 입력</SLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput label="보증금" value={wDeposit} onChange={setWDeposit} />
                      <SelectInput
                        label="지역"
                        value={wRegion}
                        options={REGION_OPTIONS}
                        onChange={v => setWRegion(v as MonthlyInput['region'])}
                      />
                    </div>
                    <DiagnoseButton onClick={diagnoseMonthly} disabled={!canDiagnoseMonthly}>
                      안전 진단하기
                    </DiagnoseButton>
                  </div>
                </Card>
              )}

              {wResult && <div ref={resultRef}><MonthlyResultView result={wResult} /></div>}
            </>
          )}

        </div>
      </div>
    </div>

    {confirmDialog && (
      <ConfirmDialog
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
    )}
    </>
  )
}
