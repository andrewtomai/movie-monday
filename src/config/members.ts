export interface Member {
  name: string
  movies: [string, string]
}

export const members: Member[] = [
  { name: "Alice", movies: ["Parasite", "The Grand Budapest Hotel"] },
  { name: "Bob", movies: ["Mad Max: Fury Road", "Spirited Away"] },
  { name: "Carol", movies: ["Get Out", "Everything Everywhere All at Once"] },
  { name: "Dave", movies: ["The Social Network", "Heat"] },
  { name: "Eve", movies: ["Pulp Fiction", "Oldboy"] },
  { name: "Frank", movies: ["The Shining", "Akira"] },
  { name: "Grace", movies: ["Amélie", "Pan's Labyrinth"] },
  { name: "Hank", movies: ["No Country for Old Men", "Children of Men"] },
  { name: "Ivy", movies: ["Her", "Ex Machina"] },
  { name: "Jack", movies: ["The Thing", "Sicario"] },
  { name: "Kate", movies: ["Arrival", "Blade Runner 2049"] },
  { name: "Leo", movies: ["Whiplash", "La La Land"] },
]
