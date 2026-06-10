import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VotingPoolPage } from "./VotingPoolPage";
import { useStore } from "../store";
import { createWrapper } from "../test/test-utils";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  vi.clearAllMocks();
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
});

describe("VotingPoolPage", () => {
  it("redirects to home when no movies are checked", () => {
    render(<VotingPoolPage />, { wrapper: createWrapper() });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("renders checked movies for voting", () => {
    useStore.setState({
      rollingPool: [
        { title: "Tenet", isChecked: true },
        { title: "Dunkirk", isChecked: true },
      ],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Voting Pool")).toBeInTheDocument();
    expect(screen.getByText("Tenet")).toBeInTheDocument();
    expect(screen.getByText("Dunkirk")).toBeInTheDocument();
  });

  it("starts each movie at 0 votes", () => {
    useStore.setState({
      rollingPool: [{ title: "Tenet", isChecked: true }],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });
    const zeroes = screen.getAllByText("0");
    expect(zeroes.length).toBeGreaterThanOrEqual(1);
  });

  it("increments vote when + is clicked", async () => {
    useStore.setState({
      rollingPool: [{ title: "Tenet", isChecked: true }],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("+"));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("decrements vote when − is clicked", async () => {
    useStore.setState({
      rollingPool: [{ title: "Tenet", isChecked: true }],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });

    const plus = screen.getByText("+");
    await userEvent.click(plus);
    expect(screen.getByText("1")).toBeInTheDocument();

    await userEvent.click(screen.getByText("−"));
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("removes vote entry when it drops to 0 or below", async () => {
    useStore.setState({
      rollingPool: [{ title: "Tenet", isChecked: true }],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText("−"));
    expect(screen.getByText("0")).toBeInTheDocument();
    await userEvent.click(screen.getByText("−"));
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("does not show unchecked movies", () => {
    useStore.setState({
      rollingPool: [
        { title: "Tenet", isChecked: true },
        { title: "Dunkirk", isChecked: false },
      ],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Tenet")).toBeInTheDocument();
    expect(screen.queryByText("Dunkirk")).toBeNull();
  });

  it("navigates back to rolling-pool on ← Back", async () => {
    useStore.setState({
      rollingPool: [{ title: "Tenet", isChecked: true }],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("← Back"));
    expect(mockNavigate).toHaveBeenCalledWith("/rolling-pool");
  });

  it("navigates home on 'Home'", async () => {
    useStore.setState({
      rollingPool: [{ title: "Tenet", isChecked: true }],
    });

    render(<VotingPoolPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("Home"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
