import { useState, useEffect } from 'react'
import type { ChecklistType, SituationConfig } from '../types/checklist'
import { useAuth } from '../context/AuthContext'
import { useChecklist } from './useChecklist'
import { useSituationConfig } from './useSituationConfig'

/**
 * 통합된 체크리스트 + 현재상황 훅
 * 서버에서 현재상황 데이터가 로딩될 때까지 전체 로딩 상태를 관리
 */
export function useChecklistWithSituation(type: ChecklistType) {
  const { user } = useAuth()
  const { config: localConfig, saveConfig: saveLocalConfig } = useSituationConfig(type)
  const {
    completedIds,
    itemMemos,
    toggle,
    setMemo,
    reset,
    save: saveChecklist,
    isLoading: checklistLoading,
    serverSituationConfig
  } = useChecklist(type)
  
  const [isInitialized, setIsInitialized] = useState(!user)

  useEffect(() => {
    if (!user) {
      setIsInitialized(true)
      return
    }
    
    // 로그인된 사용자의 경우, 서버에서 데이터를 받아올 때까지 기다림
    if (!checklistLoading) {
      setIsInitialized(true)
      
      // 서버에서 상황 정보를 받아오면 로컬 스토리지도 동기화
      if (serverSituationConfig) {
        saveLocalConfig(serverSituationConfig)
      }
    }
  }, [user, checklistLoading, serverSituationConfig, saveLocalConfig])

  // 통합된 현재상황 config: 로그인 사용자는 서버가 source of truth, 비로그인 사용자는 로컬 사용
  const currentConfig = user ? serverSituationConfig : localConfig

  // 현재상황 저장 함수
  const saveSituationConfig = async (config: SituationConfig) => {
    saveLocalConfig(config)
    
    if (user) {
      // 서버에 저장 (체크리스트 상태와 함께)
      try {
        await saveChecklist(config)
      } catch (error) {
        console.error('Failed to save situation config to server:', error)
        throw error
      }
    }
  }

  // 체크리스트 저장 (현재 상황과 함께)
  const save = async () => {
    if (!user) return

    try {
      await saveChecklist(currentConfig)
    } catch (error) {
      console.error('Failed to save checklist:', error)
      throw error
    }
  }

  // 전체 로딩 상태: 체크리스트 로딩 중이거나 초기화되지 않은 상태
  const isLoading = checklistLoading || !isInitialized

  return {
    // 체크리스트 관련
    completedIds,
    itemMemos,
    toggle,
    setMemo,
    reset,
    save,

    // 현재상황 관련
    config: currentConfig,
    saveConfig: saveSituationConfig,
    
    // 상태
    isLoading,
    isInitialized
  }
}