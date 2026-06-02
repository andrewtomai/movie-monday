export interface WatchedMovie {
  title: string
  rating: number
  nominee: string
  attendees: number
  watchedDate: string
}

export const watchedMovies: WatchedMovie[] = [
  { title: "Baby Driver", rating: 7.92, nominee: "Devin", attendees: 12, watchedDate: "2/9/2026" },
  { title: "The Man From U.N.C.L.E.", rating: 7.91, nominee: "Alex", attendees: 11, watchedDate: "3/2/26" },
  { title: "The Witch", rating: 7.142857143, nominee: "Scott", attendees: 14, watchedDate: "4/6/26" },
  { title: "Altered States", rating: 6.75, nominee: "Ciela", attendees: 8, watchedDate: "5/11/26" },
];
