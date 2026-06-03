import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendeeSelectPage } from "./AttendeeSelectPage";
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
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

beforeEach(() => {
  vi.clearAllMocks();
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
});

describe("AttendeeSelectPage", () => {
  it("renders the title and subtitle", () => {
    vi.mocked(useMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    } as any);

    render(<AttendeeSelectPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Misc. Movie Monday")).toBeInTheDocument();
    expect(
      screen.getByText("Select who's attending tonight"),
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.mocked(useMembers).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<AttendeeSelectPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Loading members...")).toBeInTheDocument();
  });

  it("renders SearchableMultiSelect with member names", () => {
    vi.mocked(useMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    } as any);

    render(<AttendeeSelectPage />, { wrapper: createWrapper() });
    expect(
      screen.getByPlaceholderText("Search for a name..."),
    ).toBeInTheDocument();
  });

  it("navigates to rolling-pool when Roll is clicked with attendees", async () => {
    vi.mocked(useMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    } as any);

    useStore
      .getState()
      .setAttendees([{ name: "Alice", id: 1 }]);
    render(<AttendeeSelectPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("Roll →"));
    expect(mockNavigate).toHaveBeenCalledWith("/rolling-pool");
  });

  it("disables Roll button when no attendees selected", () => {
    vi.mocked(useMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    } as any);

    render(<AttendeeSelectPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Roll →")).toBeDisabled();
  });

  it("calls reset when Reset button is clicked", async () => {
    vi.mocked(useMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    } as any);

    useStore
      .getState()
      .setAttendees([{ name: "Alice", id: 1 }]);
    render(<AttendeeSelectPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("Reset"));
    expect(useStore.getState().selectedAttendees).toEqual([]);
  });

  it("navigates to rankings when View Rankings is clicked", async () => {
    vi.mocked(useMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    } as any);

    render(<AttendeeSelectPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("View Rankings"));
    expect(mockNavigate).toHaveBeenCalledWith("/rankings");
  });
});
