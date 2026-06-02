import { create } from "zustand";
import { persist } from "zustand/middleware";
import { members } from "./config/members";
import { watchedMovies } from "./config/history";

interface RollingMovie {
  title: string;
  isChecked: boolean;
}

interface AppState {
  selectedAttendees: string[];
  rollingPool: RollingMovie[];

  setAttendees: (names: string[]) => void;
  assignRollingPool: () => void;
  toggleChecked: (title: string) => void;
  reseed: () => void;
  reset: () => void;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedAttendees: [],
      rollingPool: [],

      setAttendees: (names) => set({ selectedAttendees: names }),

      assignRollingPool: () => {
        const { selectedAttendees } = get();
        const memberMovies = members
          .filter((m) => selectedAttendees.includes(m.name))
          .flatMap((m) => m.movies);
        const eligibleMovies = [...new Set(memberMovies)].filter(
          (m) => !watchedMovies.map((w) => w.title).includes(m),
        );
        set({
          rollingPool: shuffle(
            eligibleMovies.map((title) => ({
              title,
              isChecked: false,
            })),
          ),
        });
      },

      toggleChecked: (title) => {
        const { rollingPool } = get();
        set({
          rollingPool: rollingPool.map((m) =>
            m.title === title ? { ...m, isChecked: !m.isChecked } : m,
          ),
        });
      },

      reseed: () => {
        const { rollingPool } = get();
        const shuffled = shuffle(rollingPool);
        set({
          rollingPool: shuffled.map(({ title }) => ({
            title,
            isChecked: false,
          })),
        });
      },

      reset: () =>
        set({
          selectedAttendees: [],
          rollingPool: [],
        }),
    }),
    { name: "movie-monday-state" },
  ),
);
