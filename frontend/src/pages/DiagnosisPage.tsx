import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { DiagnosisType, HousingType, OwnedHomes, JeonseInput, MaemaeInput, MonthlyInput, JeonseResult, MaemaeResult, MonthlyResult } from '../types/diagnosis'
import { calcJeonse, calcMaemae, calcMonthly, formatWon, parseNumeric, formatNumericInput } from '../utils/diagnosisCalc'
import { fetchMarketPrice } from '../api/diagnosisApi'
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
  { value: 'gyeonggi',label: '수도권(서울 제외)' },
  { value: 'metro',    label: '광역시' },
  { value: 'other',    label: '기타 지역' },
]

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
      <label className="text-xs text-[#666]">{label}</label>
      <div className="flex items-center h-9 border border-[#E5E8EB] rounded-lg px-3 focus-within:border-[#2C7FFF] transition-colors bg-white">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(formatNumericInput(e.target.value))}
          placeholder="0"
          className="flex-1 text-sm text-[#222] outline-none bg-transparent"
        />
        <span className="text-xs text-[#999] ml-1 shrink-0">원</span>
      </div>
      {num > 0 && <p className="text-xs text-[#2C7FFF] px-0.5">{formatWon(num)}</p>}
      {hint && <p className="text-xs text-[#999] px-0.5">{hint}</p>}
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
      <label className="text-xs text-[#666]">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 border border-[#E5E8EB] rounded-lg px-3 text-sm text-[#222] bg-white focus:border-[#2C7FFF] outline-none transition-colors"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function AreaInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#666]">전용 면적</label>
      <div className="flex items-center h-9 border border-[#E5E8EB] rounded-lg px-3 focus-within:border-[#2C7FFF] transition-colors bg-white">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0"
          className="flex-1 text-sm text-[#222] outline-none bg-transparent"
        />
        <span className="text-xs text-[#999] ml-1 shrink-0">㎡</span>
      </div>
    </div>
  )
}

// ── 섹션 레이블 ────────────────────────────────────────────────────────────

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">{children}</p>
}

function STitle({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-semibold text-[#222] mb-3">{children}</p>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#E5E8EB] p-5 ${className}`}>
      {children}
    </div>
  )
}

// ── 결과 배너 ──────────────────────────────────────────────────────────────

function ResultBanner({ grade, title, desc }: { grade: string; title: string; desc: string }) {
  const style =
    grade === 'safe'    ? { bg: '#EAF3DE', border: '#C0DD97', titleColor: '#27500A', descColor: '#3B6D11', icon: '✓' } :
    grade === 'caution' ? { bg: '#FAEEDA', border: '#FAC775', titleColor: '#633806', descColor: '#854F0B', icon: '!' } :
                          { bg: '#FCEBEB', border: '#F7C1C1', titleColor: '#A32D2D', descColor: '#A32D2D', icon: '✕' }

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

function MetricCard({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div className="bg-[#F7F8FA] rounded-xl p-3.5">
      <p className="text-xs text-[#999] mb-1.5">{label}</p>
      <p className="text-lg font-semibold" style={{ color: valueColor ?? '#222' }}>{value}</p>
      {sub && <p className="text-[11px] text-[#999] mt-1">{sub}</p>}
    </div>
  )
}

// ── 전세 결과 ──────────────────────────────────────────────────────────────

function JeonseResultView({ result }: { result: JeonseResult }) {
  const { jeonsaeRatio, debtRatio, risk, hugPossible, hfPossible, marketPrice, marketPriceSource, checklist } = result
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
        <MetricCard label="전세가율" value={`${jeonsaeRatio}%`} sub={`기준 70% 이하`} valueColor={risk.color} />
        <MetricCard label="부채비율" value={`${debtRatio}%`} sub="HUG 기준 90% 이하" valueColor={debtRatio > 90 ? '#FF3B30' : '#222'} />
        <MetricCard
          label="추정 시세"
          value={formatWon(marketPrice)}
          sub={marketPriceSource === 'api' ? '국토부 실거래가' : '직접 입력'}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-[#999]">전세가율 안전 구간</p>
          <p className="text-xs font-semibold" style={{ color: risk.color }}>현재 {jeonsaeRatio}%</p>
        </div>
        <GaugeBar
          value={jeonsaeRatio}
          color={risk.color}
          ticks={[
            { pct: 0,   label: '0%' },
            { pct: 70,  label: '70% 안전', color: '#34C759' },
            { pct: 80,  label: '80% 주의', color: '#FF9500' },
            { pct: 100, label: '100%' },
          ]}
        />
      </Card>

      <Card>
        <STitle>보증 가입 가능 여부</STitle>
        <div className="space-y-2">
          {[
            { label: 'HUG 전세보증금반환보증', ok: hugPossible },
            { label: 'HF 전세자금보증',        ok: hfPossible },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[#F1F3F6] last:border-b-0">
              <span className="text-sm text-[#444]">{label}</span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={ok
                  ? { background: '#EAF3DE', color: '#27500A' }
                  : { background: '#FCEBEB', color: '#A32D2D' }}
              >
                {ok ? '가입 가능' : '가입 불가'}
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
        <MetricCard label="DSR" value={`${dsr}%`} sub="기준 40% 이하" valueColor={dsrOk ? '#34C759' : '#FF3B30'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-[#999] mb-1">LTV 한도 현황 <span className="font-normal">— {regionLabel}</span></p>
          <GaugeBar
            value={ltvLimit}
            color={ltvLimit >= 60 ? '#97C459' : ltvLimit >= 40 ? '#FAC775' : '#F87171'}
            ticks={[
              { pct: 0,   label: '0%' },
              { pct: ltvLimit, label: `${ltvLimit}%`, color: '#3B6D11' },
              { pct: 80,  label: '80%' },
            ]}
          />
        </Card>
        <Card>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-[#999]">DSR 현황</p>
            <InfoTooltip text="DSR 기준은 정부 정책에 따라 자주 바뀔 수 있어요. 본 수치는 참고용이며 정확한 한도는 금융기관에 확인하세요." />
          </div>
          <GaugeBar
            value={dsr}
            color={dsrOk ? '#97C459' : '#F87171'}
            ticks={[
              { pct: 0,  label: '0%' },
              { pct: 40, label: '40% 한도', color: '#A32D2D' },
              { pct: 100,label: '100%' },
            ]}
          />
        </Card>
      </div>

      <Card>
        <STitle>취득 비용 계산</STitle>
        <table className="w-full text-sm">
          <tbody>
            {acquisitionCosts.map((c, i) => (
              <tr key={i} className="border-b border-[#F1F3F6] last:border-b-0">
                <td className="py-2 text-[#666]">
                  {c.label}
                  {c.badge && (
                    <span className="ml-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: '#FCEBEB', color: '#A32D2D' }}>{c.badge}</span>
                  )}
                </td>
                <td className="py-2 text-right font-medium text-[#222]">{formatWon(c.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-[#CDD1D5]">
              <td className="pt-3 font-semibold text-[#222]">총 필요 금액</td>
              <td className="pt-3 text-right font-bold text-[#222]">{formatWon(totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {recentTradePrice && (
        <Card>
          <STitle>가격 적정성</STitle>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[#F1F3F6]">
                <td className="py-2 text-[#666]">최근 실거래가 (3개월 평균)</td>
                <td className="py-2 text-right font-medium text-[#222]">{formatWon(recentTradePrice)}</td>
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

// ── 메인 페이지 ────────────────────────────────────────────────────────────

export default function DiagnosisPage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const diagType = (type as DiagnosisType) ?? 'jeonse'
  const resultRef = useRef<HTMLDivElement>(null)

  // 전세 상태
  const [jDeposit,  setJDeposit]  = useState('')
  const [jMortgage, setJMortgage] = useState('')
  const [jHousing,  setJHousing]  = useState<HousingType>('apt')
  const [jArea,     setJArea]     = useState('')
  const [jMarket,   setJMarket]   = useState('')
  const [jAddr,     setJAddr]     = useState<JeonseInput['address']>(null)
  const [jMarketSrc, setJMarketSrc] = useState<'api' | 'manual'>('manual')
  const [jFetching, setJFetching] = useState(false)
  const [jResult,   setJResult]   = useState<JeonseResult | null>(null)

  // 매매 상태
  const [mPrice,    setMPrice]    = useState('')
  const [mHousing,  setMHousing]  = useState<HousingType>('apt')
  const [mOwned,    setMOwned]    = useState<OwnedHomes>(0)
  const [mIncome,   setMIncome]   = useState('')
  const [mArea,     setMArea]     = useState('')
  const [mAddr,     setMAddr]     = useState<MaemaeInput['address']>(null)
  const [mResult,   setMResult]   = useState<MaemaeResult | null>(null)

  // 월세 상태
  const [wDeposit,  setWDeposit]  = useState('')
  const [wHousing,  setWHousing]  = useState<HousingType>('apt')
  const [wRegion,   setWRegion]   = useState<MonthlyInput['region']>('seoul')
  const [wAddr,     setWAddr]     = useState<MonthlyInput['address']>(null)
  const [wResult,   setWResult]   = useState<MonthlyResult | null>(null)

  const scrollToResult = () => {
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  // 시세 자동 조회
  const fetchMarket = async (addr: JeonseInput['address'], housing: HousingType, area: string) => {
    if (!addr || !area) return
    setJFetching(true)
    const res = await fetchMarketPrice(addr.sigunguCode, addr.bname, housing, parseFloat(area))
    setJFetching(false)
    if (res) {
      setJMarket(res.avgPrice.toLocaleString('ko-KR'))
      setJMarketSrc('api')
    }
  }

  const handleJAddr = (a: NonNullable<JeonseInput['address']>) => {
    setJAddr(a)
    fetchMarket(a, jHousing, jArea)
  }

  const handleMAddr = async (a: NonNullable<MaemaeInput['address']>) => {
    setMAddr(a)
    // 매매도 실거래가 조회
    const res = await fetchMarketPrice(a.sigunguCode, a.bname, mHousing, parseFloat(mArea))
    if (res) { /* result에 반영 */ }
  }

  const diagnoseJeonse = () => {
    const input: JeonseInput = {
      address: jAddr,
      deposit:     parseNumeric(jDeposit),
      mortgage:    parseNumeric(jMortgage),
      housingType: jHousing,
      area:        parseFloat(jArea) || 0,
      marketPrice: parseNumeric(jMarket),
      marketPriceSource: jMarketSrc,
    }
    setJResult(calcJeonse(input))
    scrollToResult()
  }

  const diagnoseMaemae = async () => {
    const input: MaemaeInput = {
      address:       mAddr,
      purchasePrice: parseNumeric(mPrice),
      housingType:   mHousing,
      ownedHomes:    mOwned,
      annualIncome:  parseNumeric(mIncome),
      area:          parseFloat(mArea) || 0,
    }
    let recentPrice: number | null = null
    if (mAddr && mArea) {
      const res = await fetchMarketPrice(mAddr.sigunguCode, mAddr.bname, mHousing, parseFloat(mArea))
      recentPrice = res?.avgPrice ?? null
    }
    setMResult(calcMaemae(input, recentPrice))
    scrollToResult()
  }

  const diagnoseMonthly = () => {
    const input: MonthlyInput = {
      address:     wAddr,
      deposit:     parseNumeric(wDeposit),
      housingType: wHousing,
      region:      wRegion,
    }
    setWResult(calcMonthly(input))
    scrollToResult()
  }

  const canDiagnoseJeonse  = parseNumeric(jDeposit) > 0 && parseNumeric(jMarket) > 0
  const canDiagnoseMaemae  = parseNumeric(mPrice) > 0 && parseNumeric(mIncome) > 0
  const canDiagnoseMonthly = parseNumeric(wDeposit) > 0

  return (
    <div className="w-full min-h-screen bg-[#F1F3F6]">
      <div className="w-full max-w-[500px] mx-auto bg-white min-h-screen">

        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#F1F3F6]">
          <div className="flex items-center gap-3 px-4 pt-12 pb-3">
            <button onClick={() => navigate('/diagnosis')} className="p-2 -ml-2 text-[#666]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base font-bold text-[#222]">{TITLE[diagType]}</h1>
          </div>
        </div>

        <div className="px-5 pt-5 pb-16 space-y-5">

          {/* 전세 폼 */}
          {diagType === 'jeonse' && (
            <>
              <div>
                <SLabel>매물 정보 입력</SLabel>
                <Card>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#666] mb-1.5 block">주소</label>
                      <AddressSearch value={jAddr} onChange={handleJAddr} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput label="전세 보증금" value={jDeposit} onChange={setJDeposit} />
                      <NumInput
                        label="선순위 근저당"
                        value={jMortgage}
                        onChange={setJMortgage}
                        hint="등기부등본 기준"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectInput label="주택 유형" value={jHousing} options={HOUSING_OPTIONS} onChange={v => setJHousing(v as HousingType)} />
                      <AreaInput value={jArea} onChange={setJArea} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <label className="text-xs text-[#666]">추정 시세</label>
                        {jMarketSrc === 'api' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EBF2FF] text-[#2C7FFF]">
                            국토부 실거래가
                          </span>
                        )}
                        <InfoTooltip text="국토교통부 실거래가 기준으로 자동 조회됩니다. 주소를 먼저 입력해주세요. 조회가 어려운 경우 직접 입력하세요." />
                      </div>
                      <div className="flex items-center h-9 border border-[#E5E8EB] rounded-lg px-3 focus-within:border-[#2C7FFF] transition-colors bg-white">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={jMarket}
                          onChange={e => { setJMarket(formatNumericInput(e.target.value)); setJMarketSrc('manual') }}
                          placeholder={jFetching ? '조회 중...' : '0'}
                          className="flex-1 text-sm text-[#222] outline-none bg-transparent"
                        />
                        <span className="text-xs text-[#999] ml-1 shrink-0">원</span>
                      </div>
                      {parseNumeric(jMarket) > 0 && <p className="text-xs text-[#2C7FFF] mt-1 px-0.5">{formatWon(parseNumeric(jMarket))}</p>}
                    </div>
                    <button
                      onClick={diagnoseJeonse}
                      disabled={!canDiagnoseJeonse}
                      className="w-full h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: canDiagnoseJeonse ? '#2C7FFF' : '#E5E8EB', color: canDiagnoseJeonse ? 'white' : '#999' }}
                    >
                      안전 진단하기
                    </button>
                  </div>
                </Card>
              </div>
              {jResult && (
                <div ref={resultRef}>
                  <JeonseResultView result={jResult} />
                </div>
              )}
            </>
          )}

          {/* 매매 폼 */}
          {diagType === 'maemae' && (
            <>
              <div>
                <SLabel>매물 정보 입력</SLabel>
                <Card>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#666] mb-1.5 block">주소</label>
                      <AddressSearch value={mAddr} onChange={handleMAddr} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput label="매매 희망가" value={mPrice} onChange={setMPrice} />
                      <SelectInput label="주택 유형" value={mHousing} options={HOUSING_OPTIONS} onChange={v => setMHousing(v as HousingType)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectInput
                        label="현재 보유 주택 수"
                        value={String(mOwned)}
                        options={[{ value: '0', label: '0주택 (무주택)' }, { value: '1', label: '1주택' }, { value: '2', label: '2주택 이상' }]}
                        onChange={v => setMOwned(Number(v) as OwnedHomes)}
                      />
                      <NumInput label="연소득" value={mIncome} onChange={setMIncome} />
                    </div>
                    <AreaInput value={mArea} onChange={setMArea} />
                    <button
                      onClick={diagnoseMaemae}
                      disabled={!canDiagnoseMaemae}
                      className="w-full h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: canDiagnoseMaemae ? '#2C7FFF' : '#E5E8EB', color: canDiagnoseMaemae ? 'white' : '#999' }}
                    >
                      안전 진단하기
                    </button>
                  </div>
                </Card>
              </div>
              {mResult && (
                <div ref={resultRef}>
                  <MaemaeResultView result={mResult} />
                </div>
              )}
            </>
          )}

          {/* 월세 폼 */}
          {diagType === 'monthly' && (
            <>
              <div>
                <SLabel>매물 정보 입력</SLabel>
                <Card>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#666] mb-1.5 block">주소</label>
                      <AddressSearch value={wAddr} onChange={setWAddr} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput label="보증금" value={wDeposit} onChange={setWDeposit} />
                      <SelectInput label="주택 유형" value={wHousing} options={HOUSING_OPTIONS} onChange={v => setWHousing(v as HousingType)} />
                    </div>
                    <SelectInput label="지역" value={wRegion} options={REGION_OPTIONS} onChange={v => setWRegion(v as MonthlyInput['region'])} />
                    <button
                      onClick={diagnoseMonthly}
                      disabled={!canDiagnoseMonthly}
                      className="w-full h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: canDiagnoseMonthly ? '#2C7FFF' : '#E5E8EB', color: canDiagnoseMonthly ? 'white' : '#999' }}
                    >
                      안전 진단하기
                    </button>
                  </div>
                </Card>
              </div>
              {wResult && (
                <div ref={resultRef}>
                  <MonthlyResultView result={wResult} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
