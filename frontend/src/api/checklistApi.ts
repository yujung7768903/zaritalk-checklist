import axios from 'axios'
import type { ChecklistType, SituationConfig } from '../types/checklist'
import { parseSituationConfig } from '../types/checklist'

const BASE_URL = import.meta.env.VITE_API_URL

function headers(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export interface ChecklistProgressResponse {
  completedItemIds: string[]
  situationConfig: SituationConfig | null
}

export async function getProgress(type: ChecklistType, token: string): Promise<ChecklistProgressResponse> {
  const res = await axios.get(`${BASE_URL}/checklists/${type}/progress`, { headers: headers(token) })
  return {
    completedItemIds: res.data.completedItemIds,
    situationConfig: parseSituationConfig(type, res.data.situationConfig)
  }
}

export async function toggleItem(type: ChecklistType, itemId: string, token: string): Promise<ChecklistProgressResponse> {
  const res = await axios.put(`${BASE_URL}/checklists/${type}/items/${itemId}`, null, { headers: headers(token) })
  return {
    completedItemIds: res.data.completedItemIds,
    situationConfig: parseSituationConfig(type, res.data.situationConfig)
  }
}

export async function saveProgress(type: ChecklistType, itemIds: string[], situationConfig: SituationConfig | null, token: string): Promise<ChecklistProgressResponse> {
  const res = await axios.post(`${BASE_URL}/checklists/${type}/progress`, {
    completedItemIds: itemIds,
    situationConfig: situationConfig
  }, { headers: headers(token) })
  return {
    completedItemIds: res.data.completedItemIds,
    situationConfig: parseSituationConfig(type, res.data.situationConfig)
  }
}

export async function resetProgress(type: ChecklistType, token: string): Promise<void> {
  await axios.delete(`${BASE_URL}/checklists/${type}/progress`, { headers: headers(token) })
}
