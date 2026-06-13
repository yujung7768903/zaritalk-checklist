import { useState, useEffect } from 'react'
import type { ChecklistType, SituationConfig } from '../types/checklist'
import { useAuth } from '../context/AuthContext'
import * as checklistApi from '../api/checklistApi'

function storageKey(type: ChecklistType) {
  return `checklist-${type}`
}

function memoStorageKey(type: ChecklistType) {
  return `checklist-${type}-memos`
}

export function useChecklist(type: ChecklistType) {
  const { user } = useAuth()

  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(storageKey(type))
    return stored ? new Set(JSON.parse(stored)) : new Set()
  })

  const [itemMemos, setItemMemos] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem(memoStorageKey(type))
    return stored ? JSON.parse(stored) : {}
  })

  const [serverSituationConfig, setServerSituationConfig] = useState<SituationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    setIsLoading(true)
    checklistApi.getProgress(type, user.token)
      .then(response => {
        setCompletedIds(new Set(response.completedItemIds))
        setItemMemos(response.itemMemos)
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

  useEffect(() => {
    if (user) return
    localStorage.setItem(memoStorageKey(type), JSON.stringify(itemMemos))
  }, [type, itemMemos, user])

  const toggle = (itemId: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  const setMemo = (itemId: string, memo: string) => {
    setItemMemos(prev => {
      const next = { ...prev }
      if (memo.trim()) {
        next[itemId] = memo
      } else {
        delete next[itemId]
      }
      return next
    })
  }

  const save = async (situationConfig?: SituationConfig | null) => {
    if (!user) return

    try {
      // Use provided config or server config
      const configToSave = situationConfig !== undefined ? situationConfig : serverSituationConfig
      const response = await checklistApi.saveProgress(type, [...completedIds], itemMemos, configToSave, user.token)
      setCompletedIds(new Set(response.completedItemIds))
      setItemMemos(response.itemMemos)
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
        setItemMemos({})
      })
    } else {
      setCompletedIds(new Set())
      setItemMemos({})
    }
  }

  return { completedIds, itemMemos, toggle, setMemo, reset, save, isLoading, serverSituationConfig }
}
