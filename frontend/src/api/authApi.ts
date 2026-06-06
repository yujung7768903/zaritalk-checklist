import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

interface LoginResponse {
  userPk: number
  nickname: string
}

export async function kakaoLogin(accessToken: string): Promise<LoginResponse> {
  const res = await axios.post(`${BASE_URL}/api/v1/auth/kakao`, { accessToken })
  return res.data
}
