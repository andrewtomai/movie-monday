import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface MovieCardProps {
  title: string
  subtitle?: string
  rank?: number
  assignedNumber?: number
  checked?: boolean
  onToggle?: () => void
  showCheckbox?: boolean
  votes?: number
  onVote?: (delta: 1 | -1) => void
  rightContent?: React.ReactNode
}

export function MovieCard({
  title,
  subtitle,
  rank,
  assignedNumber,
  checked,
  onToggle,
  showCheckbox,
  votes,
  onVote,
  rightContent,
}: MovieCardProps) {
  return (
    <div
      onClick={onToggle && showCheckbox ? onToggle : undefined}
      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
        checked
          ? 'border-primary bg-accent ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-ring/50 hover:shadow-sm'
      }`}
    >
      {rank != null && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
          {rank}
        </span>
      )}
      {showCheckbox && assignedNumber != null && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
          {assignedNumber}
        </span>
      )}
      <div className="flex-1">
        <span className="text-lg font-medium text-foreground">{title}</span>
        {subtitle && (
          <span className="ml-2 text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>
      {showCheckbox && onToggle && (
        <Checkbox checked={checked ?? false} onCheckedChange={onToggle} />
      )}
      {onVote && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onMouseDown={(e) => { e.preventDefault(); onVote(-1) }}
          >
            −
          </Button>
          <span className="min-w-[1.5ch] text-center text-lg font-semibold text-foreground">
            {votes ?? 0}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onMouseDown={(e) => { e.preventDefault(); onVote(1) }}
          >
            +
          </Button>
        </div>
      )}
      {rightContent}
    </div>
  )
}
