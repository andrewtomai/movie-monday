import { useNavigate } from 'react-router-dom'
import { watchedMovies } from '../config/history'
import { members } from '../config/members'

const movieToMembers = new Map<string, string[]>()
for (const member of members) {
  for (const title of member.movies) {
    const list = movieToMembers.get(title)
    if (list) list.push(member.name)
    else movieToMembers.set(title, [member.name])
  }
}

export function RankingsPage() {
  const navigate = useNavigate()

  const sorted = [...watchedMovies].sort((a, b) => b.rating - a.rating)

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h1 className="mb-2 text-center text-4xl font-light tracking-tight text-gray-900">
        Movie Rankings
      </h1>
      <p className="mb-8 text-center text-gray-500">
        All watched movies, ranked
      </p>

      <div className="space-y-3">
        {sorted.map((movie, idx) => (
          <div
            key={movie.title}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <span className="w-8 text-center text-lg font-semibold text-gray-400">
              {idx + 1}
            </span>
            <span className="flex-1 text-gray-900">
              {movie.title}
              <span className="ml-1 text-sm italic text-gray-400">
                — {movieToMembers.get(movie.title)?.join(', ')}
              </span>
            </span>
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              {movie.rating.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}
