import { useState, useRef } from 'react'

interface SearchableMultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Search...',
}: SearchableMultiSelectProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = options.filter(
    (o) =>
      o.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o)
  )

  const handleSelect = (name: string) => {
    onChange([...selected, name])
    setQuery('')
    inputRef.current?.focus()
  }

  const handleRemove = (name: string) => {
    onChange(selected.filter((s) => s !== name))
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
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
      {focused && query && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((name) => (
            <li
              key={name}
              onMouseDown={() => handleSelect(name)}
              className="cursor-pointer px-4 py-2 text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              {name}
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
