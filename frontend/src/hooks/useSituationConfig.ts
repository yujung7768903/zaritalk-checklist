import { useState } from 'react'
import type { ChecklistType, SituationConfig } from '../types/checklist'

export function useSituationConfig(type: ChecklistType) {
  const key = `situation-config-${type}`

  const [config, setConfig] = useState<SituationConfig | null>(() => {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as SituationConfig) : null
  })

  const saveConfig = (c: SituationConfig) => {
    localStorage.setItem(key, JSON.stringify(c))
    setConfig(c)
  }

  return { config, saveConfig }
}
