import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMovie, useSubmitRating } from "../api/movies";
import { useMembers } from "../hooks/useMembers";

export function RatingSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const { data: movie, isLoading: movieLoading, isError: movieError } = useMovie(movieId);
  const { data: members } = useMembers();
  const submitRating = useSubmitRating();

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submittedRatings, setSubmittedRatings] = useState<Record<number, number>>({});

  const handleMemberChange = (memberId: number) => {
    setSelectedMemberId(memberId);
    if (submittedRatings[memberId] !== undefined) {
      setSelectedRating(submittedRatings[memberId]);
    } else {
      setSelectedRating(null);
    }
  };

  const handleSubmit = async () => {
    if (selectedMemberId == null || selectedRating == null) return;
    submitRating.mutate(
      { movieId, memberId: selectedMemberId, rating: selectedRating },
      {
        onSuccess: () => {
          setSubmittedRatings((prev) => ({ ...prev, [selectedMemberId]: selectedRating }));
        },
      },
    );
  };

  const isSubmitting = submitRating.isPending;
  const isSuccess = submitRating.isSuccess;
  const isReVote = selectedMemberId != null && submittedRatings[selectedMemberId] !== undefined;

  if (movieLoading) {
    return (
      <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
        <p className="text-center text-muted-foreground">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-light tracking-tight text-foreground">
        {movie.title}
      </h1>

      <div className="space-y-6">
        <div>
          <label htmlFor="member" className="mb-2 block text-sm font-medium text-foreground">
            Who are you?
          </label>
          <select
            id="member"
            className="w-full rounded-lg border bg-background px-3 py-2 text-foreground"
            value={selectedMemberId ?? ""}
            onChange={(e) => handleMemberChange(Number(e.target.value))}
          >
            <option value="" disabled>
              Select your name
            </option>
            {members?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rating" className="mb-2 block text-sm font-medium text-foreground">
            Rating
          </label>
          <select
            id="rating"
            className="w-full rounded-lg border bg-background px-3 py-2 text-foreground"
            value={selectedRating ?? ""}
            onChange={(e) => setSelectedRating(Number(e.target.value))}
          >
            <option value="" disabled>
              Select a rating
            </option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="w-full rounded-lg bg-foreground px-4 py-2 font-medium text-background disabled:opacity-50"
          disabled={selectedMemberId == null || selectedRating == null || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : isReVote ? "Update rating" : "Submit rating"}
        </button>

        {submitRating.isError && (
          <p className="text-center text-sm text-destructive">
            {submitRating.error?.message ?? "Failed to submit rating"}
          </p>
        )}

        {isSuccess && !isReVote && (
          <p className="text-center text-sm text-green-600">Rating submitted!</p>
        )}

        {isReVote && isSuccess && (
          <p className="text-center text-sm text-green-600">Rating updated!</p>
        )}

        {isReVote && !isSuccess && (
          <p className="text-center text-sm text-muted-foreground">
            You've already rated this movie. Submit again to update your rating.
          </p>
        )}
      </div>
    </div>
  );
}
