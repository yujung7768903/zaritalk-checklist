import { useState, useEffect } from 'react'
import type { ChecklistType } from '../types/checklist'
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

  useEffect(() => {
    if (!user) return
    checklistApi.getProgress(type, user.token).then(ids => {
      setCompletedIds(new Set(ids))
    })
  }, [type, user])

  useEffect(() => {
    if (user) return
    localStorage.setItem(storageKey(type), JSON.stringify([...completedIds]))
  }, [type, completedIds, user])

  const toggle = (itemId: string) => {
    if (user) {
      checklistApi.toggleItem(type, itemId, user.token).then(ids => {
        setCompletedIds(new Set(ids))
      })
    } else {
      setCompletedIds(prev => {
        const next = new Set(prev)
        next.has(itemId) ? next.delete(itemId) : next.add(itemId)
        return next
      })
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

  return { completedIds, toggle, reset }
}
