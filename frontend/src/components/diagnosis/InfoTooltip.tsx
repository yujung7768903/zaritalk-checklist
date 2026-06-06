import { useState } from 'react'

interface Props {
  text: string
}

export default function InfoTooltip({ text }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-4 h-4 rounded-full bg-[#E5E8EB] text-[#999] text-[10px] font-bold flex items-center justify-center cursor-pointer hover:bg-[#CDD1D5] transition-colors shrink-0"
      >
        ?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 bg-[#333] text-white text-xs rounded-xl px-3 py-2.5 leading-relaxed shadow-lg">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#333]" />
          </div>
        </>
      )}
    </span>
  )
}
