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

  // 로그인 상태이면 서버에서 진행 상태를 불러온다
  useEffect(() => {
    if (!user) return
    checklistApi.getProgress(type, user.userPk).then(ids => {
      setCompletedIds(new Set(ids))
    })
  }, [type, user])

  // 비로그인 상태이면 localStorage에 동기화한다
  useEffect(() => {
    if (user) return
    localStorage.setItem(storageKey(type), JSON.stringify([...completedIds]))
  }, [type, completedIds, user])

  const toggle = (itemId: string) => {
    if (user) {
      checklistApi.toggleItem(type, itemId, user.userPk).then(ids => {
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
      checklistApi.resetProgress(type, user.userPk).then(() => {
        setCompletedIds(new Set())
      })
    } else {
      setCompletedIds(new Set())
    }
  }

  return { completedIds, toggle, reset }
}
