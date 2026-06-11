import type { ChecklistType, SituationConfig, NewHomeSituationConfig, MoveSituationConfig } from '../types/checklist'
import NewHomeSituationSetup from './situation/NewHomeSituationSetup'
import MoveSituationSetup from './situation/MoveSituationSetup'

interface Props {
  checklistType: ChecklistType
  config: SituationConfig | null
  onSave: (config: SituationConfig) => void
}

export default function SituationSetup({ checklistType, config, onSave }: Props) {
  if (checklistType === 'new-home') {
    return <NewHomeSituationSetup config={config as NewHomeSituationConfig | null} onSave={onSave} />
  }
  return <MoveSituationSetup config={config as MoveSituationConfig | null} onSave={onSave} />
}
