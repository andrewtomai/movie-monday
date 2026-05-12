import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  selectedAttendees: string[]
  assignedNumbers: Record<string, number>
  rolledNumbers: number[]

  setAttendees: (names: string[]) => void
  assignRollingNumbers: (eligibleMovies: string[]) => void
  toggleRolledNumber: (n: number) => void
  reseedUnchecked: (eligibleMovies: string[]) => void
  reset: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedAttendees: [],
      assignedNumbers: {},
      rolledNumbers: [],

      setAttendees: (names) => set({ selectedAttendees: names }),

      assignRollingNumbers: (eligibleMovies) => {
        const n = eligibleMovies.length
        const numbers = Array.from({ length: n }, (_, i) => i + 1)
        for (let i = numbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
        }
        const assigned: Record<string, number> = {}
        eligibleMovies.forEach((movie, idx) => {
          assigned[movie] = numbers[idx]
        })
        set({ assignedNumbers: assigned, rolledNumbers: [] })
      },

      toggleRolledNumber: (n) => {
        const { rolledNumbers } = get()
        if (rolledNumbers.includes(n)) {
          set({ rolledNumbers: rolledNumbers.filter((v) => v !== n) })
        } else {
          set({ rolledNumbers: [...rolledNumbers, n] })
        }
      },

      reseedUnchecked: (eligibleMovies) => {
        const { assignedNumbers, rolledNumbers } = get()
        const unchecked = eligibleMovies.filter(
          (m) => !rolledNumbers.includes(assignedNumbers[m])
        )
        const uncheckedNumbers = unchecked.map((m) => assignedNumbers[m])

        const pool = uncheckedNumbers.slice()
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[pool[i], pool[j]] = [pool[j], pool[i]]
        }

        const next: Record<string, number> = { ...assignedNumbers }
        unchecked.forEach((movie, idx) => {
          next[movie] = pool[idx]
        })
        set({ assignedNumbers: next })
      },

      reset: () =>
        set({
          selectedAttendees: [],
          assignedNumbers: {},
          rolledNumbers: [],
        }),
    }),
    { name: 'movie-monday-state' }
  )
)
