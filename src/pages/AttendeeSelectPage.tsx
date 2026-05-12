import { useNavigate } from 'react-router-dom'
import { members } from '../config/members'
import { useStore } from '../store'
import { SearchableMultiSelect } from '../components/SearchableMultiSelect'
import { Button } from '@/components/ui/button'

export function AttendeeSelectPage() {
  const navigate = useNavigate()
  const selectedAttendees = useStore((s) => s.selectedAttendees)
  const setAttendees = useStore((s) => s.setAttendees)
  const reset = useStore((s) => s.reset)

  const memberNames = members.map((m) => m.name)

  const handleNext = () => {
    if (selectedAttendees.length > 0) {
      navigate('/rolling-pool')
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-4">
      <h1 className="mb-2 text-center text-4xl font-light tracking-tight text-foreground">
        Misc. Movie Monday
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        Select who's attending tonight
      </p>

      <SearchableMultiSelect
        options={memberNames}
        selected={selectedAttendees}
        onChange={setAttendees}
        placeholder="Search for a name..."
      />

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
        <Button variant="outline" onClick={() => navigate('/rankings')}>
          View Rankings
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedAttendees.length === 0}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  )
}
