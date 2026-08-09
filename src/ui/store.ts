import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedAttendee {
  name: string;
  id: number;
}

interface RollingMovie {
  title: string;
  isChecked: boolean;
}

interface AppState {
  selectedAttendees: SelectedAttendee[];
  rollingPool: RollingMovie[];

  setAttendees: (attendees: SelectedAttendee[]) => void;
  assignRollingPool: (titles: string[]) => void;
  toggleChecked: (title: string) => void;
  reseed: () => void;
  reset: () => void;
}

const titlesKey = (movies: { title: string }[]) =>
  movies.map((m) => m.title).sort().join("\n");

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

      setAttendees: (attendees) => set({ selectedAttendees: attendees }),

      assignRollingPool: (titles) => {
        if (titles.length === 0) return;
        const { rollingPool } = get();
        if (
          rollingPool.length > 0 &&
          titlesKey(rollingPool) ===
            titlesKey(titles.map((title) => ({ title })))
        )
          return;
        set({
          rollingPool: shuffle(
            titles.map((title) => ({
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
