import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMovie, useSubmitRating } from "../api/movies";
import { useMembers, useCreateMember } from "../hooks/useMembers";
import { PageLayout } from "../components/PageLayout";
import { SegmentedControl } from "../components/SegmentedControl";
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

type RaterTab = "returning" | "new";

export function RatingSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const { data: movie, isLoading: movieLoading, isError: movieError } = useMovie(movieId);
  const { data: members } = useMembers();
  const submitRating = useSubmitRating();
  const createMember = useCreateMember();

  const [raterTab, setRaterTab] = useState<RaterTab>("returning");
  const [guestName, setGuestName] = useState("");
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

  const handleAddGuest = () => {
    const name = guestName.trim();
    if (!name) return;
    createMember.mutate(
      { name, role: "guest" },
      {
        onSuccess: (data) => {
          setSelectedMemberId(data.id);
          setGuestName("");
          setRaterTab("returning");
        },
      },
    );
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

  const isSubmitting = submitRating.isPending || createMember.isPending;
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

          <SegmentedControl
            className="mb-4"
            options={[
              { value: "returning", label: "Returning" },
              { value: "new", label: "New guest" },
            ]}
            value={raterTab}
            onChange={(v) => setRaterTab(v as RaterTab)}
          />

          {raterTab === "returning" ? (
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
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Guest name"
              />
              <button
                type="button"
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  guestName.trim()
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                disabled={!guestName.trim() || createMember.isPending}
                onClick={handleAddGuest}
              >
                {createMember.isPending ? "Adding..." : "Add me as a guest"}
              </button>
              {createMember.isError && (
                <p className="text-sm text-destructive">
                  {createMember.error?.message ?? "Failed to add guest"}
                </p>
              )}
            </div>
          )}
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
