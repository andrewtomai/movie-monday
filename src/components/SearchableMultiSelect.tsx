import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { XIcon } from 'lucide-react'

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
      <span className="font-semibold underline decoration-primary decoration-2 underline-offset-2">
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

  if (highlightedIndex >= filtered.length && filtered.length > 0) {
    setHighlightedIndex(0)
  }

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
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
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
              className={`cursor-pointer px-4 py-2 text-foreground transition-colors ${
                i === highlightedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
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
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemove(name)}
                className="inline-flex items-center justify-center rounded-full p-0.5 transition-colors hover:bg-secondary-foreground/10"
              >
                <XIcon className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
