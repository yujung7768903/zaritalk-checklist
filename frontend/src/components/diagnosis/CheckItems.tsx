import type { CheckItem } from '../../types/diagnosis'
import InfoTooltip from './InfoTooltip'

const STATUS_STYLE = {
  ok:     { bg: '#EAF3DE', color: '#3B6D11', icon: '✓' },
  warn:   { bg: '#FAEEDA', color: '#854F0B', icon: '!' },
  danger: { bg: '#FCEBEB', color: '#A32D2D', icon: '✕' },
  info:   { bg: '#E6F1FB', color: '#185FA5', icon: 'i' },
}

const BADGE_STYLE = {
  ok:     { bg: '#EAF3DE', color: '#27500A' },
  warn:   { bg: '#FAEEDA', color: '#633806' },
  danger: { bg: '#FCEBEB', color: '#A32D2D' },
  info:   { bg: '#E6F1FB', color: '#0C447C' },
}

interface Props {
  items: CheckItem[]
}

export default function CheckItems({ items }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => {
        const style = STATUS_STYLE[item.status]
        return (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-[#F1F3F6]">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold"
              style={{ background: style.bg, color: style.color }}
            >
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium text-[#222]">{item.title}</span>
                {item.tooltip && <InfoTooltip text={item.tooltip} />}
              </div>
              <p className="text-xs text-[#666] leading-relaxed mt-0.5">{item.desc}</p>
              {item.link && (
                <a
                  href={item.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border border-[#E5E8EB] text-[#555] hover:border-[#2C7FFF] hover:text-[#2C7FFF] transition-colors"
                >
                  {item.link.label} ↗
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { BADGE_STYLE }
