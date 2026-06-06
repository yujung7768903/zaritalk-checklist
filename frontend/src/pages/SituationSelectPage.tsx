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
    desc: '처음 독립하거나 새로 집을 구하는 경우',
    color: '#2C7FFF',
    bg: '#EBF2FF',
  },
  {
    type: 'move',
    icon: '📦',
    title: '이사하기',
    desc: '기존 계약 종료 후 다른 집으로 이사하는 경우',
    color: '#34C759',
    bg: '#E8F8ED',
  },
]

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-[#C5C8CE]">
    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

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
      <div className="w-full max-w-[640px] mx-auto min-h-screen">

        {/* 헤더 */}
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#2C7FFF] tracking-tight">둥지트기 도우미</span>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#555]">{user.nickname}님</span>
                <button
                  onClick={logout}
                  className="text-[12px] text-[#999] border border-[#E5E8EB] rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#999] transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={handleKakaoLogin}
                className="flex items-center gap-1.5 bg-[#FEE500] text-[#191919] text-[12px] font-bold rounded-lg px-3 py-1.5 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.58 1 1 3.91 1 7.5c0 2.28 1.44 4.28 3.63 5.44l-.93 3.42a.25.25 0 0 0 .37.28L8.1 14.1c.29.03.59.04.9.04 4.42 0 8-2.91 8-6.5S13.42 1 9 1z" fill="#191919"/>
                </svg>
                카카오 로그인
              </button>
            )}
          </div>
        </div>

        <div className="px-5 pt-4 pb-10 space-y-5">

          {/* 안전진단 배너 */}
          <div className="bg-white rounded-2xl px-6 pt-6 pb-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <p className="text-[17px] font-bold text-[#111] leading-[135%] mb-4">
              안전하게 집을 구할 수 있도록<br />도와드릴게요
            </p>
            <button
              onClick={() => navigate('/diagnosis')}
              className="w-full h-12 bg-[#2C7FFF] text-white text-[14px] font-bold rounded-lg cursor-pointer hover:bg-[#1a6fe8] transition-colors"
            >
              안전 진단 바로가기
            </button>
          </div>

          {/* 체크리스트 */}
          <div>
            <p className="text-[13px] font-semibold text-[#888] mb-2.5 px-0.5">체크리스트</p>
            <div className="flex flex-col gap-2.5">
              {situations.map(s => (
                <button
                  key={s.type}
                  onClick={() => navigate(`/checklist/${s.type}`)}
                  className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer text-left shadow-[0_1px_6px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-shadow"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0"
                    style={{ background: s.bg }}
                  >
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[#111] leading-tight">{s.title}</p>
                    <p className="text-[13px] text-[#888] mt-0.5 leading-snug">{s.desc}</p>
                  </div>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </div>

          {/* 용어사전 */}
          <div>
            <p className="text-[13px] font-semibold text-[#888] mb-2.5 px-0.5">도구</p>
            <button
              onClick={() => navigate('/glossary')}
              className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer text-left shadow-[0_1px_6px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0 bg-[#FFF4E5]">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#111] leading-tight">용어사전</p>
                <p className="text-[13px] text-[#888] mt-0.5">부동산 계약 용어를 쉽게 확인해요</p>
              </div>
              <ChevronRight />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
