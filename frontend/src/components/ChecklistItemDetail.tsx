import BottomSheet from './BottomSheet'
import ExternalLinkButton from './ExternalLinkButton'
import type { ChecklistItem } from '../types/checklist'

interface Props {
  item: ChecklistItem | null
  completed: boolean
  onClose: () => void
  onToggle: () => void
}

export default function ChecklistItemDetail({ item, completed, onClose, onToggle }: Props) {
  if (!item) return null

  return (
    <BottomSheet open={!!item} onClose={onClose}>
      <div className="px-5 pb-8">
        <div className="flex items-start justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-[#222] leading-snug flex-1">
            {item.important && <span className="text-[#FF3B30] mr-1">⭐</span>}
            {item.title}
          </h2>
          <button
            onClick={() => { onToggle(); onClose() }}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              completed
                ? 'bg-[#F1F3F6] text-[#999]'
                : 'bg-[#2C7FFF] text-white'
            }`}
          >
            {completed ? '완료 취소' : '완료'}
          </button>
        </div>

        <div className="space-y-4">
          <section>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">필요한 이유</p>
            <p className="text-sm text-[#444] leading-relaxed">{item.why}</p>
          </section>

          <section>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">확인방법</p>
            <ul className="space-y-1">
              {item.how.map((h, i) => (
                <li key={i} className="text-sm text-[#444] flex items-start gap-2">
                  <span className="text-[#2C7FFF] mt-0.5 shrink-0">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">비용</p>
            <p className="text-sm text-[#444]">{item.cost}</p>
          </section>

          <section>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-2">확인할 것</p>
            <ul className="space-y-2">
              {item.checks.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#333]">
                  <span className="w-4 h-4 rounded border border-[#CDD1D5] shrink-0 bg-white" />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          {item.note && (
            <section className="bg-[#FFF8E7] rounded-xl p-3">
              <p className="text-xs font-semibold text-[#FF9500] mb-1">참고</p>
              <p className="text-xs text-[#664400] leading-relaxed">{item.note}</p>
            </section>
          )}

          {item.links.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-2">바로가기</p>
              <div className="flex flex-wrap gap-2">
                {item.links.map((link, i) => (
                  <ExternalLinkButton key={i} link={link} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
