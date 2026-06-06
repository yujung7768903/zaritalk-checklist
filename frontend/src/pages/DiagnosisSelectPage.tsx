import { useNavigate } from 'react-router-dom'

const TYPES = [
  {
    type: 'jeonse',
    icon: '🔐',
    title: '전세 안전진단',
    desc: '전세가율·보증보험 가입 가능 여부 확인',
    color: '#2C7FFF',
    bg: '#EBF2FF',
  },
  {
    type: 'maemae',
    icon: '🏠',
    title: '매매 안전진단',
    desc: 'LTV·DSR·취득비용 계산',
    color: '#34C759',
    bg: '#E8F8ED',
  },
  {
    type: 'monthly',
    icon: '📋',
    title: '월세 안전진단',
    desc: '소액보증금 최우선변제 및 필수 확인 사항',
    color: '#FF9500',
    bg: '#FFF4E5',
  },
]

export default function DiagnosisSelectPage() {
  const navigate = useNavigate()

  return (
    <div className="w-full min-h-screen bg-[#F1F3F6]">
      <div className="w-full max-w-[500px] mx-auto bg-white min-h-screen">
        <div className="px-5 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-[#666]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base font-bold text-[#222]">안전진단</h1>
          </div>
          <p className="text-sm text-[#999]">진단 유형을 선택해주세요</p>
        </div>

        <div className="px-4 space-y-3 pb-10">
          {TYPES.map(t => (
            <button
              key={t.type}
              onClick={() => navigate(`/diagnosis/${t.type}`)}
              className="w-full bg-white rounded-xl border border-[#E5E8EB] hover:border-[#2C7FFF] transition-colors flex items-center gap-4 cursor-pointer"
              style={{ padding: '16px 16px 16px 20px' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: t.bg }}
              >
                {t.icon}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-[#222]">{t.title}</p>
                <p className="text-xs text-[#999] mt-0.5">{t.desc}</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#CDD1D5] shrink-0">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
