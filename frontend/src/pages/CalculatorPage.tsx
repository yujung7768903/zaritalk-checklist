import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface RiskLevel {
  label: string
  color: string
  bg: string
  barColor: string
  desc: string
}

function getRisk(ratio: number): RiskLevel {
  if (ratio < 60) return { label: '안전', color: 'var(--color-success)', bg: 'var(--color-success-bg-light)', barColor: 'var(--color-success)', desc: '전세가율이 낮아 보증금 위험이 적습니다.' }
  if (ratio < 70) return { label: '보통', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', barColor: 'var(--color-primary)', desc: '일반적인 수준이지만 보증보험 가입을 권장합니다.' }
  if (ratio < 80) return { label: '주의', color: 'var(--color-warning)', bg: 'var(--color-warning-bg-light)', barColor: 'var(--color-warning)', desc: '전세가율이 높아 반드시 보증보험에 가입하세요.' }
  return { label: '위험', color: 'var(--color-danger)', bg: 'var(--color-danger-bg-light)', barColor: 'var(--color-danger)', desc: '경매 시 보증금 전액 회수가 어려울 수 있습니다.' }
}

function parseNumber(val: string): number {
  return Number(val.replace(/,/g, '')) || 0
}

function formatNumber(val: string): string {
  const num = val.replace(/[^0-9]/g, '')
  if (!num) return ''
  return Number(num).toLocaleString('ko-KR')
}

export default function CalculatorPage() {
  const navigate = useNavigate()
  const [salePrice, setSalePrice] = useState('')
  const [jeonsaPrice, setJeonsaPrice] = useState('')

  const salePriceNum = parseNumber(salePrice)
  const jeonsaPriceNum = parseNumber(jeonsaPrice)
  const ratio = salePriceNum > 0 && jeonsaPriceNum > 0
    ? Math.round((jeonsaPriceNum / salePriceNum) * 100)
    : null

  const risk = ratio !== null ? getRisk(ratio) : null

  return (
    <div className="w-full min-h-screen bg-bg">
      <div className="w-full max-w-[640px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white px-4 pt-12 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-sub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base font-bold text-text">전세가율 계산기</h1>
          </div>
          <p className="text-sm text-tertiary">
            매매가와 전세보증금을 입력하면 전세가율을 계산해드립니다
          </p>
        </div>

        <div className="px-4 pt-4 space-y-3">
          {/* Inputs */}
          <div className="bg-white rounded-2xl p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-tertiary uppercase tracking-wide">매매가 (원)</label>
              <div className="mt-1.5 flex items-center border border-border rounded-xl px-3 py-3 focus-within:border-primary transition-colors">
                <input
                  type="text"
                  inputMode="numeric"
                  value={salePrice}
                  onChange={e => setSalePrice(formatNumber(e.target.value))}
                  placeholder="0"
                  className="flex-1 text-base font-semibold text-text outline-none bg-transparent"
                />
                <span className="text-sm text-tertiary ml-1 shrink-0">원</span>
              </div>
              {salePriceNum > 0 && (
                <p className="mt-1 text-xs text-primary px-1">
                  {(salePriceNum / 10000).toLocaleString('ko-KR')}만원
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-tertiary uppercase tracking-wide">전세보증금 (원)</label>
              <div className="mt-1.5 flex items-center border border-border rounded-xl px-3 py-3 focus-within:border-primary transition-colors">
                <input
                  type="text"
                  inputMode="numeric"
                  value={jeonsaPrice}
                  onChange={e => setJeonsaPrice(formatNumber(e.target.value))}
                  placeholder="0"
                  className="flex-1 text-base font-semibold text-text outline-none bg-transparent"
                />
                <span className="text-sm text-tertiary ml-1 shrink-0">원</span>
              </div>
              {jeonsaPriceNum > 0 && (
                <p className="mt-1 text-xs text-primary px-1">
                  {(jeonsaPriceNum / 10000).toLocaleString('ko-KR')}만원
                </p>
              )}
            </div>
          </div>

          {/* Result */}
          {ratio !== null && risk !== null && (
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text">전세가율</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-text">{ratio}%</span>
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-xl"
                    style={{ color: risk.color, background: risk.bg }}
                  >
                    {risk.label}
                  </span>
                </div>
              </div>

              {/* Gauge bar */}
              <div className="w-full h-3 bg-bg rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(ratio, 100)}%`, background: risk.barColor }}
                />
              </div>

              <p className="text-sm text-text-muted" style={{ color: risk.color }}>{risk.desc}</p>

              {/* Threshold guide */}
              <div className="mt-4 space-y-2">
                {[
                  { range: '60% 미만', label: '안전', color: 'var(--color-success)' },
                  { range: '60–70%', label: '보통', color: 'var(--color-primary)' },
                  { range: '70–80%', label: '주의', color: 'var(--color-warning)' },
                  { range: '80% 이상', label: '위험', color: 'var(--color-danger)' },
                ].map(g => (
                  <div key={g.label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
                    <span className="text-xs text-tertiary">{g.range}</span>
                    <span className="text-xs font-semibold ml-auto" style={{ color: g.color }}>{g.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs font-semibold text-tertiary mb-2">전세가율이란?</p>
            <p className="text-sm text-text-muted leading-relaxed">
              매매가 대비 전세보증금의 비율입니다. 비율이 높을수록 경매 시 보증금 전액을 돌려받기 어려울 수 있습니다. 일반적으로 70% 이하를 권장합니다.
            </p>
          </div>
        </div>

        <div className="pb-12" />
      </div>
    </div>
  )
}
