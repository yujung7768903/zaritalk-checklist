import { useState, useEffect } from 'react'
import type { ChecklistType, SituationConfig } from '../types/checklist'
import { useAuth } from '../context/AuthContext'
import * as checklistApi from '../api/checklistApi'

function storageKey(type: ChecklistType) {
  return `checklist-${type}`
}

export function useChecklist(type: ChecklistType) {
  const { user } = useAuth()

  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(storageKey(type))
    return stored ? new Set(JSON.parse(stored)) : new Set()
  })

  const [serverSituationConfig, setServerSituationConfig] = useState<SituationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    setIsLoading(true)
    checklistApi.getProgress(type, user.token)
      .then(response => {
        setCompletedIds(new Set(response.completedItemIds))
        setServerSituationConfig(response.situationConfig)
      })
      .catch(error => {
        console.error('Failed to load progress:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [type, user])

  useEffect(() => {
    if (user) return
    localStorage.setItem(storageKey(type), JSON.stringify([...completedIds]))
  }, [type, completedIds, user])

  const toggle = (itemId: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  const save = async (situationConfig?: SituationConfig | null) => {
    if (!user) return

    try {
      // Use provided config or server config
      const configToSave = situationConfig !== undefined ? situationConfig : serverSituationConfig
      const response = await checklistApi.saveProgress(type, [...completedIds], configToSave, user.token)
      setCompletedIds(new Set(response.completedItemIds))
      setServerSituationConfig(response.situationConfig)
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    }
  }

  const reset = () => {
    if (user) {
      checklistApi.resetProgress(type, user.token).then(() => {
        setCompletedIds(new Set())
      })
    } else {
      setCompletedIds(new Set())
    }
  }

  return { completedIds, toggle, reset, save, isLoading, serverSituationConfig }
}
