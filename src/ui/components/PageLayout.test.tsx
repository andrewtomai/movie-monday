import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageLayout } from "./PageLayout";

beforeEach(() => {
  localStorage.clear();
});

describe("PageLayout", () => {
  it("renders its children", () => {
    render(
      <PageLayout>
        <p>Page content</p>
      </PageLayout>,
    );

    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("exposes the theme control on every page", () => {
    render(
      <PageLayout>
        <p>Page content</p>
      </PageLayout>,
    );

    expect(
      screen.getByRole("button", { name: /Color theme:/ }),
    ).toBeInTheDocument();
  });
});
