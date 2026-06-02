import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RollingPoolPage } from "./RollingPoolPage";
import { useStore } from "../store";
import { createWrapper } from "../test/test-utils";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../hooks/useMembers", () => ({
  useMembers: vi.fn(),
}));

import { useMembers } from "../hooks/useMembers";

const mockMembers = [
  { name: "Alice", movies: ["Inception", "Tenet"] },
  { name: "Bob", movies: ["Inception", "Dunkirk"] },
];

beforeEach(() => {
  vi.clearAllMocks();
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
});

describe("RollingPoolPage", () => {
  it("redirects to home when no attendees selected", () => {
    vi.mocked(useMembers).mockReturnValue({ data: mockMembers } as any);

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("shows empty state when rollingPool is empty", () => {
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice"]);

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("No eligible movies")).toBeInTheDocument();
    expect(
      screen.getByText(
        "All movies from selected attendees have been watched.",
      ),
    ).toBeInTheDocument();
  });

  it("renders rolling pool movies", () => {
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice", "Bob"]);
    useStore.setState({
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Rolling Pool")).toBeInTheDocument();
  });

  it("toggles checked state when clicking a movie card", async () => {
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice", "Bob"]);
    useStore.setState({
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
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice", "Bob"]);
    useStore.setState({
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
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice", "Bob"]);
    useStore.setState({
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Vote →")).toBeDisabled();
  });

  it("calls reseed when ++random is clicked", async () => {
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice", "Bob"]);
    useStore.setState({
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
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice", "Bob"]);
    useStore.setState({
      rollingPool: [
        { title: "Tenet", isChecked: true },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("++random")).toBeDisabled();
  });

  it("navigates back home when ← Back is clicked", async () => {
    vi.mocked(useMembers).mockReturnValue({ data: undefined } as any);
    useStore.getState().setAttendees(["Alice", "Bob"]);
    useStore.setState({
      rollingPool: [
        { title: "Tenet", isChecked: false },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<RollingPoolPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("← Back"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
