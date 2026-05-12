interface MovieCardProps {
  title: string
  assignedNumber?: number
  checked?: boolean
  onToggle?: () => void
  showCheckbox?: boolean
  votes?: number
  onVote?: (delta: 1 | -1) => void
}

export function MovieCard({
  title,
  assignedNumber,
  checked,
  onToggle,
  showCheckbox,
  votes,
  onVote,
}: MovieCardProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
        checked
          ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {showCheckbox && assignedNumber != null && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700">
          {assignedNumber}
        </span>
      )}
      <span className="flex-1 text-lg font-medium text-gray-900">{title}</span>
      {showCheckbox && onToggle && (
        <input
          type="checkbox"
          checked={checked ?? false}
          onChange={onToggle}
          className="h-5 w-5 rounded border-gray-300 text-emerald-500 accent-emerald-500"
        />
      )}
      {onVote && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onVote(-1) }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-emerald-400 hover:text-emerald-600"
          >
            −
          </button>
          <span className="min-w-[1.5ch] text-center text-lg font-semibold text-gray-900">
            {votes ?? 0}
          </span>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onVote(1) }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-emerald-400 hover:text-emerald-600"
          >
            +
          </button>
        </div>
      )}
    </label>
  )
}
