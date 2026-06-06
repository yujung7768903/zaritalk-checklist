import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-white rounded-t-[32px] h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className={`relative flex flex-col items-center w-full px-[22px] pt-[32px] pb-[16px] shrink-0 ${title ? 'border-b border-[#F1F3F6]' : ''}`}>
          {title && (
            <span className="text-[18px] font-bold leading-[136%] tracking-[-0.015em] text-[#222] text-center px-8">
              {title}
            </span>
          )}
          <button
            onClick={onClose}
            className="absolute top-[16px] right-[18px] cursor-pointer text-[#222]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.329 6.278c.39-.39 1.023-.39 1.414 0L12 10.535l4.257-4.257c.39-.39 1.024-.39 1.414 0l.05.05c.391.391.391 1.024 0 1.415L13.465 12l4.258 4.257c.36.36.388.928.083 1.32l-.083.094-.05.05c-.391.391-1.024.391-1.415 0L12 13.465l-4.257 4.258c-.39.39-1.024.39-1.414 0l-.05-.05c-.391-.391-.391-1.024 0-1.415L10.535 12 6.278 7.743c-.36-.36-.388-.928-.083-1.32l.083-.094.05-.05z"/>
            </svg>
          </button>
        </div>
        {/* 콘텐츠 */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
