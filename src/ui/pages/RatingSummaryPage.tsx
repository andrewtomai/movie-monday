import { useParams } from "react-router-dom";

export function RatingSummaryPage() {
  const { id } = useParams();

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h1 className="mb-2 text-center text-4xl font-light tracking-tight text-foreground">
        Movie {id}
      </h1>
      <p className="text-center text-muted-foreground">
        Rating summary coming soon
      </p>
    </div>
  );
}
