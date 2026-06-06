import { useEffect } from 'react'
import type { AddressInfo } from '../../types/diagnosis'

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          roadAddress: string
          jibunAddress: string
          sigunguCode: string
          bname: string
          zonecode: string
        }) => void
      }) => { open: () => void }
    }
  }
}

interface Props {
  value: AddressInfo | null
  onChange: (addr: AddressInfo) => void
}

export default function AddressSearch({ value, onChange }: Props) {
  useEffect(() => {
    if (document.getElementById('daum-postcode-script')) return
    const script = document.createElement('script')
    script.id = 'daum-postcode-script'
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    document.head.appendChild(script)
  }, [])

  const openSearch = () => {
    new window.daum.Postcode({
      oncomplete(data) {
        onChange({
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          sigunguCode: data.sigunguCode,
          bname: data.bname,
          zonecode: data.zonecode,
        })
      },
    }).open()
  }

  return (
    <div>
      <button
        type="button"
        onClick={openSearch}
        className="w-full h-9 border border-border rounded-lg px-3 text-left text-sm focus:border-primary transition-colors bg-white"
      >
        {value ? (
          <span className="text-text">{value.roadAddress}</span>
        ) : (
          <span className="text-placeholder">주소 검색</span>
        )}
      </button>
    </div>
  )
}
