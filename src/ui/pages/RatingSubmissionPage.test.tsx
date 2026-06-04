import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingSubmissionPage } from "./RatingSubmissionPage";
import { createWrapper } from "../test/test-utils";

const mockMutate = vi.fn();
const mockUseMovie = vi.fn();
const mockUseMembers = vi.fn();
const mockUseSubmitRating = vi.fn();
const mockUseParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useParams: () => mockUseParams() };
});

vi.mock("../api/movies", () => ({
  useMovie: (...args: unknown[]) => mockUseMovie(...args),
  useSubmitRating: (...args: unknown[]) => mockUseSubmitRating(...args),
}));

vi.mock("../hooks/useMembers", () => ({
  useMembers: (...args: unknown[]) => mockUseMembers(...args),
}));

const mockMovie = {
  id: 1,
  title: "10 Things I Hate About You",
  nominatedBy: "Alex B",
  watchedAt: null,
  createdAt: "2026-01-01",
  rating: { avg: null, count: 0 },
};

const mockMembers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

beforeEach(() => {
  vi.clearAllMocks();

  mockUseMovie.mockReturnValue({
    data: mockMovie,
    isLoading: false,
    isError: false,
  });

  mockUseMembers.mockReturnValue({
    data: mockMembers,
    isLoading: false,
  });

  mockUseSubmitRating.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  mockUseParams.mockReturnValue({ id: "1" });
});

describe("RatingSubmissionPage", () => {
  it("shows loading state", () => {
    mockUseMovie.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows movie not found", () => {
    mockUseMovie.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });
    expect(screen.getByText("Movie not found")).toBeInTheDocument();
  });

  it("renders movie title and form", () => {
    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });
    expect(screen.getByText("10 Things I Hate About You")).toBeInTheDocument();
    expect(screen.getByText("Who are you?")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("Submit rating")).toBeInTheDocument();
  });

  it("renders member names in dropdown when opened", async () => {
    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });
    const input = screen.getByPlaceholderText("Select your name");
    await userEvent.click(input);
    expect(screen.getByRole("option", { name: "Alice" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bob" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Charlie" })).toBeInTheDocument();
  });

  it("submit button is disabled until member and rating selected", () => {
    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });
    expect(screen.getByText("Submit rating")).toBeDisabled();
  });

  it("submit button is enabled when member and rating are selected", async () => {
    const user = userEvent.setup();
    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });

    await user.click(screen.getByPlaceholderText("Select your name"));
    await user.click(screen.getByRole("option", { name: "Alice" }));

    await user.click(screen.getByRole("combobox", { name: "Rating" }));
    await user.click(screen.getByRole("option", { name: "8" }));

    expect(screen.getByText("Submit rating")).toBeEnabled();
  });

  it("calls submitRating with correct values on submit", async () => {
    const user = userEvent.setup();
    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });

    await user.click(screen.getByPlaceholderText("Select your name"));
    await user.click(screen.getByRole("option", { name: "Alice" }));

    await user.click(screen.getByRole("combobox", { name: "Rating" }));
    await user.click(screen.getByRole("option", { name: "8" }));

    await user.click(screen.getByText("Submit rating"));

    expect(mockMutate).toHaveBeenCalledWith(
      { movieId: 1, memberId: 1, rating: 8 },
      expect.any(Object),
    );
  });

  it("shows updating message on re-vote", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });

    await user.click(screen.getByPlaceholderText("Select your name"));
    await user.click(screen.getByRole("option", { name: "Alice" }));

    await user.click(screen.getByRole("combobox", { name: "Rating" }));
    await user.click(screen.getByRole("option", { name: "8" }));

    await user.click(screen.getByText("Submit rating"));

    mockMutate.mock.calls[0][1].onSuccess();

    mockUseSubmitRating.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
    });

    rerender(<RatingSubmissionPage />);

    await user.click(screen.getByPlaceholderText("Select your name"));
    await user.click(screen.getByRole("option", { name: "Bob" }));

    await user.click(screen.getByPlaceholderText("Select your name"));
    await user.click(screen.getByRole("option", { name: "Alice" }));

    expect(screen.getByText("Update rating")).toBeInTheDocument();
  });

  it("shows error message on failed submission", () => {
    mockUseSubmitRating.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: true,
      error: { message: "Something went wrong" },
    });

    render(<RatingSubmissionPage />, { wrapper: createWrapper("/movie/1/rate") });
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
