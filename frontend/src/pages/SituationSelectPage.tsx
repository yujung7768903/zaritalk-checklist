import { useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { kakaoLogin } from '../api/authApi'

const situations = [
  {
    type: 'new-home',
    icon: '🏠',
    title: '첫 집 구하기',
    description: '처음으로 집을 구하는 경우',
    color: '#2C7FFF',
    bg: '#EBF2FF',
  },
  {
    type: 'move',
    icon: '📦',
    title: '이사하기',
    // subtitle: '',
    description: '기존 계약 종료 후 다른 집으로 이사하는 경우',
    color: '#34C759',
    bg: '#E8F8ED',
  },
]

const tools = [
  { icon: '📊', label: '전세가율 계산기', path: '/calculator', desc: '안전한 전세인지 확인' },
  { icon: '📖', label: '용어사전', path: '/glossary', desc: '부동산 용어 한눈에' },
]

export default function SituationSelectPage() {
  const navigate = useNavigate()
  const { user, login, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return
    setSearchParams({})
    kakaoLogin(code)
      .then(result => login(result))
      .catch(() => alert('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'))
  }, [])

  const handleKakaoLogin = async () => {
    const { data } = await axios.get('http://localhost:8080/api/v1/auth/kakao/url')
    window.location.href = data.authUrl
  }

  return (
    <div className="w-full min-h-screen bg-[#F1F3F6]">
      <div className="w-full max-w-[500px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white px-5 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#2C7FFF]">둥지트기 도우미</p>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#555]">{user.nickname}님</span>
                <button
                  onClick={logout}
                  className="text-xs text-[#999] border border-[#E5E8EB] rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#999] transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={handleKakaoLogin}
                className="flex items-center gap-1.5 bg-[#FEE500] text-[#191919] text-xs font-semibold rounded-lg px-3 py-1.5 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.58 1 1 3.91 1 7.5c0 2.28 1.44 4.28 3.63 5.44l-.93 3.42a.25.25 0 0 0 .37.28L8.1 14.1c.29.03.59.04.9.04 4.42 0 8-2.91 8-6.5S13.42 1 9 1z" fill="#191919"/>
                </svg>
                카카오 로그인
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#222] leading-snug">
            어떤 상황인가요?
          </h1>
          <p className="mt-2 text-sm text-[#999]">
            상황을 선택하면 맞춤 체크리스트를 보여드릴게요
          </p>
        </div>

        {/* Situation cards */}
        <div className="px-4 pt-4 space-y-3">
          {situations.map(s => (
            <button
              key={s.type}
              onClick={() => navigate(`/checklist/${s.type}`)}
              className="w-full bg-white rounded-lg flex items-center justify-between gap-2 cursor-pointer border border-[#E5E8EB] hover:border-[#2C7FFF] transition-colors"
              style={{ padding: '16px 16px 16px 20px' }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: s.bg }}
                >
                  {s.icon}
                </div>
                <div className="text-left min-w-0">
                  <span className="text-sm font-bold text-[#333]">{s.title}</span>
                  <p className="mt-0.5 text-xs text-[#999]">{s.description}</p>
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#CDD1D5] shrink-0">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Tools section */}
        <div className="px-4 pt-6 pb-8">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3 px-1">유용한 도구</p>
          <div className="grid grid-cols-2 gap-3">
            {tools.map(t => (
              <button
                key={t.path}
                onClick={() => navigate(t.path)}
                className="bg-white rounded-lg text-left cursor-pointer border border-[#E5E8EB] hover:border-[#2C7FFF] transition-colors"
                style={{ padding: '16px 16px 16px 20px' }}
              >
                <span className="text-2xl">{t.icon}</span>
                <p className="mt-2 text-sm font-bold text-[#333]">{t.label}</p>
                <p className="mt-0.5 text-xs text-[#999]">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
