import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { members } from '../config/members'
import { watchedMovies } from '../config/history'
import { useStore } from '../store'
import { MovieCard } from '../components/MovieCard'

export function VotingPoolPage() {
  const navigate = useNavigate()
  const selectedAttendees = useStore((s) => s.selectedAttendees)
  const assignedNumbers = useStore((s) => s.assignedNumbers)
  const rolledNumbers = useStore((s) => s.rolledNumbers)

  const eligibleMovies = useMemo(() => {
    const memberMovies = members
      .filter((m) => selectedAttendees.includes(m.name))
      .flatMap((m) => m.movies)
    return [...new Set(memberMovies)].filter(
      (m) => !watchedMovies.includes(m)
    )
  }, [selectedAttendees])

  const votingMovies = useMemo(
    () =>
      eligibleMovies.filter((m) => rolledNumbers.includes(assignedNumbers[m])),
    [eligibleMovies, assignedNumbers, rolledNumbers]
  )

  if (selectedAttendees.length === 0 || votingMovies.length === 0) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h2 className="mb-1 text-2xl font-light tracking-tight text-gray-900">
        Voting Pool
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Time to vote on the final selection
      </p>

      <div className="space-y-3">
        {votingMovies.map((title) => (
          <MovieCard key={title} title={title} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-600 transition-all hover:bg-gray-50"
      >
        Start over
      </button>
    </div>
  )
}
