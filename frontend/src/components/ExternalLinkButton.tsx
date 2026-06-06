import type { ExternalLink } from '../types/checklist'

interface Props {
  link: ExternalLink
}

export default function ExternalLinkButton({ link }: Props) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-light text-primary text-xs font-medium"
    >
      {link.label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3.5M8.5 1.5V6.5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  )
}
