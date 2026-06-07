import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export interface TransactionResult {
  avgPrice: number
  count: number
  source: 'api'
}

export async function fetchMarketPrice(
  sigunguCode: string,
  dongName: string,
  housingType: string,
  area: number,
  buildingName?: string,
): Promise<TransactionResult | null> {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/molit/transactions`, {
      params: { sigunguCode, dongName, housingType, area, aptName: buildingName },
    })
    return res.data
  } catch {
    return null
  }
}

// 전용면적 조회
export async function fetchAvailableAreas(
  sigunguCode: string,
  dongName: string,
  housingType: string,
  buildingName?: string,
  bcode?: string,
  jibunAddress?: string,
): Promise<number[]> {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/molit/areas`, {
      params: { sigunguCode, dongName, housingType, aptName: buildingName, bcode, jibunAddress },
    })
    return res.data.areas ?? []
  } catch {
    return []
  }
}

export async function saveDiagnosis(
  type: string,
  inputJson: string,
  resultJson: string,
  token: string,
): Promise<void> {
  await axios.post(
    `${BASE_URL}/api/v1/diagnosis`,
    { type, inputJson, resultJson },
    { headers: { Authorization: `Bearer ${token}` } },
  )
}

export async function getLatestDiagnosis(type: string, token: string) {
  const res = await axios.get(`${BASE_URL}/api/v1/diagnosis/latest`, {
    params: { type },
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
