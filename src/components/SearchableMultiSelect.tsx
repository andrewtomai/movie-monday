import { useState, useRef, useEffect, useCallback } from 'react'

interface SearchableMultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

function highlightMatch(text: string, query: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold underline decoration-emerald-500 decoration-2 underline-offset-2">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Search...',
}: SearchableMultiSelectProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = options.filter(
    (o) =>
      o.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o)
  )

  useEffect(() => {
    setHighlightedIndex(0)
  }, [filtered.length])

  useEffect(() => {
    if (!listRef.current || highlightedIndex < 0) return
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex])

  const handleSelect = useCallback(
    (name: string) => {
      onChange([...selected, name])
      setQuery('')
      inputRef.current?.focus()
    },
    [onChange, selected]
  )

  const handleRemove = useCallback(
    (name: string) => {
      onChange(selected.filter((s) => s !== name))
    },
    [onChange, selected]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focused || filtered.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelect(filtered[highlightedIndex])
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
      {focused && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {filtered.map((name, i) => (
            <li
              key={name}
              onMouseDown={() => handleSelect(name)}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`cursor-pointer px-4 py-2 text-gray-700 transition-colors ${
                i === highlightedIndex
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {highlightMatch(name, query)}
            </li>
          ))}
        </ul>
      )}
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemove(name)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-emerald-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
