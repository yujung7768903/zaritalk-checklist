interface KakaoAuthObj {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  scope: string
}

interface Window {
  Kakao: {
    init: (key: string) => void
    isInitialized: () => boolean
    Auth: {
      login: (settings: {
        success: (authObj: KakaoAuthObj) => void
        fail: (err: unknown) => void
      }) => void
      logout: (callback?: () => void) => void
      getAccessToken: () => string | null
    }
  }
}
