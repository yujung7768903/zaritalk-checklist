import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { glossaryTerms, glossaryCategories } from '../constants/glossary'
import type { GlossaryTerm } from '../types/checklist'
import GlossaryTermSheet from '../components/GlossaryTermSheet'

export default function GlossaryPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null)

  const filtered = useMemo(() => {
    return glossaryTerms.filter(t => {
      const matchesCategory = !activeCategory || t.category === activeCategory
      const matchesQuery = !query || t.term.includes(query) || t.meaning.includes(query)
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory])

  const grouped = useMemo(() => {
    const map: Record<string, GlossaryTerm[]> = {}
    filtered.forEach(t => {
      if (!map[t.category]) map[t.category] = []
      map[t.category].push(t)
    })
    return map
  }, [filtered])

  return (
    <div className="w-full min-h-screen bg-[#F1F3F6]">
      <div className="w-full max-w-[640px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex items-center gap-3 px-4 pt-12 pb-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-[#666]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base font-bold text-[#222] flex-1">부동산 용어사전</h1>
            <span className="text-xs text-[#999]">{glossaryTerms.length}개</span>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-[#F1F3F6] rounded-xl px-3 py-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#999] shrink-0">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="용어 검색"
                className="flex-1 bg-transparent text-sm text-[#222] outline-none placeholder:text-[#CCC]"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[#CCC]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !activeCategory ? 'bg-[#2C7FFF] text-white' : 'bg-[#F1F3F6] text-[#666]'
              }`}
            >
              전체
            </button>
            {glossaryCategories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(prev => prev === c ? null : c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === c ? 'bg-[#2C7FFF] text-white' : 'bg-[#F1F3F6] text-[#666]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="pb-8">
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm text-[#999]">"{query}"에 해당하는 용어가 없습니다</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, terms]) => (
              <div key={category} className="mb-2">
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold text-[#999] uppercase tracking-wide">{category}</span>
                </div>
                <div className="bg-white">
                  {terms.map((term, i) => (
                    <button
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left ${
                        i < terms.length - 1 ? 'border-b border-[#F1F3F6]' : ''
                      }`}
                    >
                      <div>
                        <span className="text-sm font-semibold text-[#222]">{term.term}</span>
                        <span className="text-xs text-[#999] ml-2">{term.meaning}</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#CDD1D5] shrink-0">
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <GlossaryTermSheet term={selectedTerm} onClose={() => setSelectedTerm(null)} />
      </div>
    </div>
  )
}
