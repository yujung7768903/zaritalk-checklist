import BottomSheet from './BottomSheet'
import type { GlossaryTerm } from '../types/checklist'

interface Props {
  term: GlossaryTerm | null
  onClose: () => void
}

export default function GlossaryTermSheet({ term, onClose }: Props) {
  if (!term) return null

  return (
    <BottomSheet open={!!term} onClose={onClose} title={term.term}>
      <div className="px-5 pb-8 pt-4">
        <div className="mb-5">
          <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-1 rounded-lg">
            {term.category}
          </span>
        </div>
        <p className="text-sm text-text-medium leading-relaxed mb-4">{term.meaning}</p>
        {term.detail && (
          <div className="bg-subtle rounded-xl p-4">
            <p className="text-xs font-semibold text-tertiary mb-2">더 알아보기</p>
            <p className="text-sm text-text-muted leading-relaxed">{term.detail}</p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
