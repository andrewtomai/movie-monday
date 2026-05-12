interface MovieCardProps {
  title: string
  assignedNumber?: number
  checked?: boolean
  onToggle?: () => void
  showCheckbox?: boolean
}

export function MovieCard({
  title,
  assignedNumber,
  checked,
  onToggle,
  showCheckbox,
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
    </label>
  )
}
