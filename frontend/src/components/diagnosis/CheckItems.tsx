import type { CheckItem } from '../../types/diagnosis'
import InfoTooltip from './InfoTooltip'

const STATUS_STYLE = {
  ok:     { bg: 'var(--color-success-bg)', color: 'var(--color-success-text)', icon: '✓' },
  warn:   { bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', icon: '!' },
  danger: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', icon: '✕' },
  info:   { bg: 'var(--color-info-bg)', color: 'var(--color-info-text)', icon: 'i' },
}

const BADGE_STYLE = {
  ok:     { bg: 'var(--color-success-bg)', color: 'var(--color-success-text-dark)' },
  warn:   { bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text-dark)' },
  danger: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' },
  info:   { bg: 'var(--color-info-bg)', color: 'var(--color-info-text-dark)' },
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
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-bg">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold"
              style={{ background: style.bg, color: style.color }}
            >
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium text-text">{item.title}</span>
                {item.tooltip && <InfoTooltip text={item.tooltip} />}
              </div>
              <p className="text-xs text-sub leading-relaxed mt-0.5">{item.desc}</p>
              {item.link && (
                <a
                  href={item.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border border-border text-text-muted hover:border-primary hover:text-primary transition-colors"
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
