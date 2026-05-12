import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { members } from '../config/members'
import { watchedMovies } from '../config/history'
import { useStore } from '../store'
import { MovieCard } from '../components/MovieCard'

export function RollingPoolPage() {
  const navigate = useNavigate()
  const selectedAttendees = useStore((s) => s.selectedAttendees)
  const assignedNumbers = useStore((s) => s.assignedNumbers)
  const rolledNumbers = useStore((s) => s.rolledNumbers)
  const assignRollingNumbers = useStore((s) => s.assignRollingNumbers)
  const toggleRolledNumber = useStore((s) => s.toggleRolledNumber)
  const reseedUnchecked = useStore((s) => s.reseedUnchecked)

  const eligibleMovies = useMemo(() => {
    const memberMovies = members
      .filter((m) => selectedAttendees.includes(m.name))
      .flatMap((m) => m.movies)
    return [...new Set(memberMovies)].filter(
      (m) => !watchedMovies.includes(m)
    )
  }, [selectedAttendees])

  useEffect(() => {
    if (selectedAttendees.length === 0) {
      navigate('/', { replace: true })
      return
    }
    if (Object.keys(assignedNumbers).length === 0) {
      assignRollingNumbers(eligibleMovies)
    }
  }, [selectedAttendees, assignedNumbers, eligibleMovies, assignRollingNumbers, navigate])

  const hasVotable = rolledNumbers.length > 0

  const movieEntries = useMemo(
    () =>
      eligibleMovies
        .map((title) => ({
          title,
          number: assignedNumbers[title],
          checked: rolledNumbers.includes(assignedNumbers[title]),
        }))
        .sort((a, b) => a.number - b.number),
    [eligibleMovies, assignedNumbers, rolledNumbers]
  )

  const handleNext = () => {
    if (hasVotable) {
      navigate('/voting-pool')
    }
  }

  if (eligibleMovies.length === 0) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="mb-2 text-lg text-gray-900">No eligible movies</p>
        <p className="mb-6 text-gray-500">
          All movies from selected attendees have been watched.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h2 className="mb-1 text-2xl font-light tracking-tight text-gray-900">
        Rolling Pool
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Check the numbers that were rolled
      </p>

      <div className="space-y-3">
        {movieEntries.map(({ title, number, checked }) =>
          number != null ? (
            <MovieCard
              key={title}
              title={title}
              assignedNumber={number}
              checked={checked}
              onToggle={() => toggleRolledNumber(number)}
              showCheckbox
            />
          ) : null
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => reseedUnchecked(eligibleMovies)}
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
        >
          Re-roll
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!hasVotable}
          className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 text-center font-medium text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next → Vote
        </button>
      </div>
    </div>
  )
}
