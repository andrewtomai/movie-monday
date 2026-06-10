import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMovie, useSubmitRating } from "../api/movies";
import { useMembers } from "../hooks/useMembers";
import { PageLayout } from "../components/PageLayout";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RatingSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const { data: movie, isLoading: movieLoading, isError: movieError } = useMovie(movieId);
  const { data: members } = useMembers();
  const submitRating = useSubmitRating();

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submittedRatings, setSubmittedRatings] = useState<Record<number, number>>({});

  const memberNames = members?.map((m) => m.name) ?? [];
  const selectedName = members?.find((m) => m.id === selectedMemberId)?.name ?? null;

  const handleNameChange = (name: string | null) => {
    const member = members?.find((m) => m.name === name) ?? null;
    setSelectedMemberId(member?.id ?? null);
    if (member && submittedRatings[member.id] !== undefined) {
      setSelectedRating(submittedRatings[member.id]);
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
      <PageLayout narrow>
        <p className="text-center text-muted-foreground">Loading...</p>
      </PageLayout>
    );
  }

  if (movieError || !movie) {
    return (
      <PageLayout narrow>
        <p className="text-center text-muted-foreground">Movie not found</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout narrow>
      <h1 className="mb-8 text-center text-4xl font-light tracking-tight text-foreground">
        {movie.title}
      </h1>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Who are you?
          </label>
          <Combobox
            items={memberNames}
            value={selectedName}
            onValueChange={handleNameChange}
          >
            <ComboboxInput placeholder="Select your name" aria-label="Member" />
            <ComboboxContent>
              <ComboboxEmpty>No matches found.</ComboboxEmpty>
              <ComboboxList>
                {(name) => (
                  <ComboboxItem key={name} value={name}>
                    {name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Rating
          </label>
          <Select
            value={selectedRating?.toString() ?? ""}
            onValueChange={(v) => setSelectedRating(Number(v))}
          >
            <SelectTrigger className="w-full" aria-label="Rating">
              <SelectValue placeholder="Select a rating" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
                <SelectItem key={r} value={r.toString()}>
                  {r.toString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
    </PageLayout>
  );
}
