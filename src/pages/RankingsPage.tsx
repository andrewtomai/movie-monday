import { useNavigate } from 'react-router-dom'
import { watchedMovies } from '../config/history'
import { Button } from '@/components/ui/button'
import { MovieCard } from '../components/MovieCard'

export function RankingsPage() {
  const navigate = useNavigate()

  const sorted = [...watchedMovies].sort((a, b) => b.rating - a.rating)

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h1 className="mb-2 text-center text-4xl font-light tracking-tight text-foreground">
        Movie Rankings
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        All watched movies, ranked
      </p>

      <div className="space-y-3">
        {sorted.map((movie, idx) => (
          <MovieCard
            key={movie.title}
            title={movie.title}
            subtitle={`— ${movie.nominee}  ·  ${movie.watchedDate} · ${movie.attendees} attended`}
            rank={idx + 1}
            rightContent={
              <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                {movie.rating.toFixed(1)}
              </span>
            }
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => navigate('/')}>
          ← Back to Home
        </Button>
      </div>
    </div>
  )
}
