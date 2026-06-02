import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCard } from "./MovieCard";

describe("MovieCard", () => {
  it("renders title", () => {
    render(<MovieCard title="Inception" />);
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<MovieCard title="Inception" subtitle="— Nolan" />);
    expect(screen.getByText("— Nolan")).toBeInTheDocument();
  });

  it("does not render subtitle when omitted", () => {
    const { container } = render(<MovieCard title="Inception" />);
    expect(container.querySelector(".ml-2")).toBeNull();
  });

  it("renders rank when provided", () => {
    render(<MovieCard title="Inception" rank={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does not render rank when omitted", () => {
    render(<MovieCard title="Inception" />);
    expect(screen.queryByText("1")).toBeNull();
  });

  it("renders assigned number when showCheckbox is true", () => {
    render(<MovieCard title="Inception" showCheckbox assignedNumber={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders checkbox when showCheckbox is true", () => {
    render(<MovieCard title="Inception" showCheckbox onToggle={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("does not render checkbox when showCheckbox is false", () => {
    render(<MovieCard title="Inception" onToggle={() => {}} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("calls onToggle when checkbox is clicked", async () => {
    const onToggle = vi.fn();
    render(<MovieCard title="Inception" showCheckbox onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("calls onToggle when card is clicked with showCheckbox", async () => {
    const onToggle = vi.fn();
    render(<MovieCard title="Inception" showCheckbox onToggle={onToggle} />);
    await userEvent.click(screen.getByText("Inception"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not call onToggle when card is clicked without showCheckbox", async () => {
    const onToggle = vi.fn();
    render(<MovieCard title="Inception" onToggle={onToggle} />);
    await userEvent.click(screen.getByText("Inception"));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("does not call onToggle when card is clicked without onToggle", async () => {
    render(<MovieCard title="Inception" showCheckbox />);
    await userEvent.click(screen.getByText("Inception"));
  });

  it("applies checked styling when checked is true", () => {
    const { container } = render(
      <MovieCard title="Inception" showCheckbox checked onToggle={() => {}} />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-primary");
  });

  it("applies unchecked styling when checked is false", () => {
    const { container } = render(
      <MovieCard title="Inception" showCheckbox checked={false} onToggle={() => {}} />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-border");
  });

  it("renders votes and vote buttons when onVote is provided", () => {
    render(<MovieCard title="Inception" votes={5} onVote={() => {}} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("−")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("does not render votes when onVote is omitted", () => {
    render(<MovieCard title="Inception" />);
    expect(screen.queryByText("+")).toBeNull();
    expect(screen.queryByText("−")).toBeNull();
  });

  it("displays 0 when votes is undefined", () => {
    render(<MovieCard title="Inception" onVote={() => {}} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("calls onVote with -1 when minus button is clicked", async () => {
    const onVote = vi.fn();
    render(<MovieCard title="Inception" votes={3} onVote={onVote} />);
    await userEvent.click(screen.getByText("−"));
    expect(onVote).toHaveBeenCalledWith(-1);
  });

  it("calls onVote with 1 when plus button is clicked", async () => {
    const onVote = vi.fn();
    render(<MovieCard title="Inception" votes={3} onVote={onVote} />);
    await userEvent.click(screen.getByText("+"));
    expect(onVote).toHaveBeenCalledWith(1);
  });

  it("renders rightContent when provided", () => {
    render(
      <MovieCard title="Inception" rightContent={<span data-testid="right">X</span>} />,
    );
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });
});
