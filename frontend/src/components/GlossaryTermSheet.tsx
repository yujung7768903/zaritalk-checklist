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
          <span className="text-xs font-semibold text-[#2C7FFF] bg-[#EBF2FF] px-2 py-1 rounded-lg">
            {term.category}
          </span>
        </div>
        <p className="text-sm text-[#444] leading-relaxed mb-4">{term.meaning}</p>
        {term.detail && (
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#999] mb-2">더 알아보기</p>
            <p className="text-sm text-[#555] leading-relaxed">{term.detail}</p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
