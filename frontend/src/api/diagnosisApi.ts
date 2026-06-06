import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

export interface TransactionResult {
  avgPrice: number
  count: number
  source: 'api'
}

export async function fetchMarketPrice(
  sigunguCode: string,
  bname: string,
  housingType: string,
  area: number,
): Promise<TransactionResult | null> {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/molit/transactions`, {
      params: { sigunguCode, bname, housingType, area },
    })
    return res.data
  } catch {
    return null
  }
}

export async function fetchAvailableAreas(
  sigunguCode: string,
  bname: string,
  housingType: string,
): Promise<number[]> {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/molit/areas`, {
      params: { sigunguCode, bname, housingType },
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
