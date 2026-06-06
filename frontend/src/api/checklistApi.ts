import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

function headers(userPk: number) {
  return { 'X-User-Pk': String(userPk) }
}

export async function getProgress(type: string, userPk: number): Promise<string[]> {
  const res = await axios.get(`${BASE_URL}/api/v1/checklists/${type}/progress`, { headers: headers(userPk) })
  return res.data.completedItemIds
}

export async function toggleItem(type: string, itemId: string, userPk: number): Promise<string[]> {
  const res = await axios.put(`${BASE_URL}/api/v1/checklists/${type}/items/${itemId}`, null, { headers: headers(userPk) })
  return res.data.completedItemIds
}

export async function resetProgress(type: string, userPk: number): Promise<void> {
  await axios.delete(`${BASE_URL}/api/v1/checklists/${type}/progress`, { headers: headers(userPk) })
}
