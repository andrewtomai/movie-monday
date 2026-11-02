import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RollingPoolPage } from "./RollingPoolPage";
import { useStore } from "../store";
import { useMembersMovies } from "../hooks/useMemberMovies";
import { createWrapper } from "../test/test-utils";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../hooks/useMemberMovies", () => ({
  useMembersMovies: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMembersMovies).mockReturnValue({ titles: [], isLoading: false });
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
});

describe("RollingPoolPage", () => {
  it("redirects to home when no attendees selected", () => {
    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("shows empty state when rollingPool is empty", () => {
    useStore
      .getState()
      .setAttendees([{ name: "Alice", id: 1 }]);

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("No eligible movies")).toBeInTheDocument();
  });

  it("renders rolling pool movies", () => {
    useStore.setState({
      selectedAttendees: [{ name: "Alice", id: 1 }],
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Rolling Pool")).toBeInTheDocument();
    expect(screen.getByText("Tenet")).toBeInTheDocument();
    expect(screen.getByText("Dunkirk")).toBeInTheDocument();
  });

  it("toggles checked state when clicking a movie card", async () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText("Tenet"));

    const movie = useStore.getState().rollingPool.find(
      (m) => m.title === "Tenet",
    );
    expect(movie?.isChecked).toBe(true);
  });

  it("navigates to voting-pool when Vote is clicked with checked items", async () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [
        { title: "Tenet", isChecked: true },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("Vote →"));
    expect(mockNavigate).toHaveBeenCalledWith("/voting-pool");
  });

  it("disables Vote button when no items checked", () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Vote →")).toBeDisabled();
  });

  it("calls reseed when ++random is clicked", async () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    const originalTitles = useStore
      .getState()
      .rollingPool.map((m) => m.title)
      .sort();

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("++random"));

    const newTitles = useStore
      .getState()
      .rollingPool.map((m) => m.title)
      .sort();
    expect(newTitles).toEqual(originalTitles);
  });

  it("disables reseed when an item is checked", () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [
        { title: "Tenet", isChecked: true },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("++random")).toBeDisabled();
  });

  it("navigates back home when ← Back is clicked", async () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("← Back"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("preserves existing pool and checks when returning with same titles", () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [
        { title: "Tenet", isChecked: true },
        { title: "Dunkirk", isChecked: false },
        { title: "Inception", isChecked: false },
      ],
    });
    vi.mocked(useMembersMovies).mockReturnValue({
      titles: ["Inception", "Dunkirk", "Tenet"],
      isLoading: false,
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });

    expect(useStore.getState().rollingPool).toEqual([
      { title: "Tenet", isChecked: true },
      { title: "Dunkirk", isChecked: false },
      { title: "Inception", isChecked: false },
    ]);
  });

  it("does not seed the pool from partial data while loading", () => {
    useStore.setState({
      selectedAttendees: [
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ],
      rollingPool: [],
    });
    vi.mocked(useMembersMovies).mockReturnValue({
      titles: ["Inception", "Tenet"],
      isLoading: true,
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });

    expect(useStore.getState().rollingPool).toEqual([]);
  });
});
