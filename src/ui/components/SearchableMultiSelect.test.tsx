import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchableMultiSelect } from "./SearchableMultiSelect";

const options = ["Alice", "Bob", "Charlie", "David"];

describe("SearchableMultiSelect", () => {
  it("renders input with placeholder", () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows dropdown with options when input is focused", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    await userEvent.click(screen.getByPlaceholderText("Search..."));
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(4);
  });

  it("filters options based on query", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText("Search..."), "li");
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Alice");
    expect(items[1]).toHaveTextContent("Charlie");
  });

  it("filters case-insensitively", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText("Search..."), "CHAR");
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Charlie");
  });

  it("does not exclude already selected options from dropdown", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={["Alice"]}
        onChange={() => {}}
      />,
    );
    await userEvent.click(screen.getByPlaceholderText("Search..."));
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(4);
  });

  it("calls onChange with selected item when clicking an option", async () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByPlaceholderText("Search..."));
    await userEvent.click(screen.getByRole("option", { name: "Bob" }));
    expect(onChange.mock.calls[0][0]).toEqual(["Bob"]);
  });

  it("calls onChange with deselected item when clicking a selected option", async () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={options}
        selected={["Alice", "Charlie"]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByPlaceholderText("Search..."));
    await userEvent.click(screen.getByRole("option", { name: "Alice" }));
    expect(onChange.mock.calls[0][0]).toEqual(["Charlie"]);
  });

  it("displays selected items as chips", () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={["Alice", "Charlie"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("removes chip when clicking remove button", async () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={options}
        selected={["Alice", "Charlie"]}
        onChange={onChange}
      />,
    );

    const removeButtons = screen.getAllByRole("button");
    const aliceRemove = removeButtons.find(
      (btn) => btn.closest("[data-slot=combobox-chip]")?.textContent === "Alice",
    );
    expect(aliceRemove).toBeTruthy();
    if (aliceRemove) {
      await userEvent.click(aliceRemove);
      expect(onChange.mock.calls[0][0]).toEqual(["Charlie"]);
    }
  });

  it("shows no items message when no matching options", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "zzzzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No matches found.")).toBeInTheDocument();
  });

  it("clears query after selection", async () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={onChange}
      />,
    );
    const input = screen.getByPlaceholderText("Search...");
    await userEvent.click(input);
    await userEvent.type(input, "Bob");
    await userEvent.click(screen.getByRole("option", { name: "Bob" }));
    expect(input).toHaveValue("");
  });
});
