import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { members } from '../config/members'
import { useStore } from '../store'
import { SearchableMultiSelect } from '../components/SearchableMultiSelect'

export function AttendeeSelectPage() {
  const navigate = useNavigate()
  const selectedAttendees = useStore((s) => s.selectedAttendees)
  const setAttendees = useStore((s) => s.setAttendees)
  const reset = useStore((s) => s.reset)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const memberNames = members.map((m) => m.name)

  const handleNext = () => {
    if (selectedAttendees.length > 0) {
      navigate('/rolling-pool')
    }
  }

  const handleReset = () => {
    reset()
    setShowResetConfirm(false)
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-4">
      <h1 className="mb-2 text-center text-4xl font-light tracking-tight text-gray-900">
        Misc. Movie Monday
      </h1>
      <p className="mb-8 text-center text-gray-500">
        Select who's attending tonight
      </p>

      <SearchableMultiSelect
        options={memberNames}
        selected={selectedAttendees}
        onChange={setAttendees}
        placeholder="Search for a name..."
      />

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedAttendees.length === 0}
          className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 text-center font-medium text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
        {showResetConfirm ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-red-600"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
