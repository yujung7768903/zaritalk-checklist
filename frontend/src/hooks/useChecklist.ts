import { useState, useEffect, useRef } from 'react'
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const serverStateRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    
    setIsLoading(true)
    checklistApi.getProgress(type, user.token)
      .then(response => {
        const idsSet = new Set(response.completedItemIds)
        setCompletedIds(idsSet)
        setServerSituationConfig(response.situationConfig)
        serverStateRef.current = idsSet
        setHasUnsavedChanges(false)
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
      
      if (user) {
        // 서버 상태와 비교하여 변경사항 확인
        const hasChanges = !areSetsEqual(next, serverStateRef.current)
        setHasUnsavedChanges(hasChanges)
      }
      
      return next
    })
  }

  const save = async (situationConfig?: SituationConfig | null) => {
    if (!user || !hasUnsavedChanges) return
    
    try {
      // Use provided config or server config
      const configToSave = situationConfig !== undefined ? situationConfig : serverSituationConfig
      const response = await checklistApi.saveProgress(type, [...completedIds], configToSave, user.token)
      const idsSet = new Set(response.completedItemIds)
      setCompletedIds(idsSet)
      setServerSituationConfig(response.situationConfig)
      serverStateRef.current = idsSet
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    }
  }

  const reset = () => {
    if (user) {
      checklistApi.resetProgress(type, user.token).then(() => {
        setCompletedIds(new Set())
        serverStateRef.current = new Set()
        setHasUnsavedChanges(false)
      })
    } else {
      setCompletedIds(new Set())
    }
  }

  return { completedIds, toggle, reset, save, hasUnsavedChanges, isLoading, serverSituationConfig }
}

function areSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false
  for (const item of a) {
    if (!b.has(item)) return false
  }
  return true
}
