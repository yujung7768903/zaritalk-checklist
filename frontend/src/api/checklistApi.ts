import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

function headers(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function getProgress(type: string, token: string): Promise<string[]> {
  const res = await axios.get(`${BASE_URL}checklists/${type}/progress`, { headers: headers(token) })
  return res.data.completedItemIds
}

export async function toggleItem(type: string, itemId: string, token: string): Promise<string[]> {
  const res = await axios.put(`${BASE_URL}checklists/${type}/items/${itemId}`, null, { headers: headers(token) })
  return res.data.completedItemIds
}

export async function resetProgress(type: string, token: string): Promise<void> {
  await axios.delete(`${BASE_URL}checklists/${type}/progress`, { headers: headers(token) })
}
