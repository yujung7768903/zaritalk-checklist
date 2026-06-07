import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

interface LoginResponse {
  userPk: number
  nickname: string
  token: string
}

export async function kakaoLogin(code: string): Promise<LoginResponse> {
  const res = await axios.post(`${BASE_URL}/auth/kakao`, { code })
  return res.data
}
