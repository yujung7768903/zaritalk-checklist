import BottomSheet from './BottomSheet'
import ExternalLinkButton from './ExternalLinkButton'
import type { ChecklistItem } from '../types/checklist'

interface Props {
  item: ChecklistItem | null
  checkedIndexes: Set<number>
  onToggleCheck: (index: number) => void
  onClose: () => void
}

export default function ChecklistItemDetail({ item, checkedIndexes, onToggleCheck, onClose }: Props) {
  if (!item) return null

  const title = (
    <span>
      {item.important && <span className="text-danger mr-1">⭐</span>}
      {item.title}
    </span>
  )

  return (
    <BottomSheet open={!!item} onClose={onClose} title={title}>
      <div className="px-[22px] pt-5 pb-10">

        <div className="space-y-4">
          <section>
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-1.5">필요한 이유</p>
            <p className="text-sm text-text-medium leading-relaxed">{item.why}</p>
          </section>

          <section>
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-1.5">확인방법</p>
            <ul className="space-y-1">
              {item.how.map((h, i) => (
                <li key={i} className="text-sm text-text-medium flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-1.5">비용</p>
            <p className="text-sm text-text-medium">{item.cost}</p>
          </section>

          <section>
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-2">확인할 것</p>
            <ul className="space-y-2">
              {item.checks.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={() => onToggleCheck(i)}
                >
                  <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    checkedIndexes.has(i)
                      ? 'bg-primary border-primary'
                      : 'bg-white border-border-strong'
                  }`}>
                    {checkedIndexes.has(i) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className={checkedIndexes.has(i) ? 'text-tertiary line-through' : 'text-text-dark'}>
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {item.note && (
            <section className="bg-note-bg rounded-xl p-3">
              <p className="text-xs font-semibold text-warning mb-1">참고</p>
              <p className="text-xs text-note-text leading-relaxed">{item.note}</p>
            </section>
          )}

          {item.links.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-2">바로가기</p>
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
