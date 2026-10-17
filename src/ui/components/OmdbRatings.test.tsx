import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OmdbRatings } from "./OmdbRatings";

describe("OmdbRatings", () => {
  it("renders both IMDb and RT scores", () => {
    render(<OmdbRatings omdb={{ imdb: 7.5, rt: 92, year: "2017" }} />);
    expect(screen.getByText("IMDb 7.5")).toBeInTheDocument();
    expect(screen.getByText("RT 92%")).toBeInTheDocument();
  });

  it("renders nothing when omdb is null", () => {
    const { container } = render(<OmdbRatings omdb={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when omdb is undefined", () => {
    const { container } = render(<OmdbRatings />);
    expect(container).toBeEmptyDOMElement();
  });

  it("omits RT when rt is null", () => {
    render(<OmdbRatings omdb={{ imdb: 8.1, rt: null, year: "2019" }} />);
    expect(screen.getByText("IMDb 8.1")).toBeInTheDocument();
    expect(screen.queryByText(/RT/)).not.toBeInTheDocument();
  });

  it("omits IMDb when imdb is null", () => {
    render(<OmdbRatings omdb={{ imdb: null, rt: 96, year: "2020" }} />);
    expect(screen.getByText("RT 96%")).toBeInTheDocument();
    expect(screen.queryByText(/IMDb/)).not.toBeInTheDocument();
  });

  it("renders nothing when both scores are null", () => {
    const { container } = render(
      <OmdbRatings omdb={{ imdb: null, rt: null, year: "2021" }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
