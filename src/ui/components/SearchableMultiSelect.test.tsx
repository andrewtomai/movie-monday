import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchableMultiSelect } from "./SearchableMultiSelect";

const options = ["Alice", "Bob", "Charlie", "David"];

function getDropdownItems() {
  const list = screen.getByRole("list");
  return within(list).getAllByRole("listitem");
}

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
    const items = getDropdownItems();
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
    const items = getDropdownItems();
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
    const items = getDropdownItems();
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Charlie");
  });

  it("excludes already selected options from dropdown", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={["Alice"]}
        onChange={() => {}}
      />,
    );
    await userEvent.click(screen.getByPlaceholderText("Search..."));
    const items = getDropdownItems();
    const aliceItem = items.find(
      (item) => item.textContent === "Alice",
    );
    expect(aliceItem).toBeUndefined();
    expect(items[0]).toHaveTextContent("Bob");
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
    await userEvent.click(screen.getByText("Bob"));
    expect(onChange).toHaveBeenCalledWith(["Bob"]);
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

  it("calls onChange with updated list when removing a chip", async () => {
    const onChange = vi.fn();
    render(
      <SearchableMultiSelect
        options={options}
        selected={["Alice", "Charlie"]}
        onChange={onChange}
      />,
    );

    const chips = screen.getAllByRole("button");
    const aliceRemove = chips.find(
      (btn) => btn.closest("span")?.textContent === "Alice",
    );
    expect(aliceRemove).toBeTruthy();
    if (aliceRemove) {
      await userEvent.click(aliceRemove);
      expect(onChange).toHaveBeenCalledWith(["Charlie"]);
    }
  });

  it("hides dropdown when no matching options", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "zzzzz");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("supports keyboard navigation with arrow keys", async () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    const input = screen.getByPlaceholderText("Search...");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    const items = getDropdownItems();
    expect(items[1].className).toContain("bg-accent");
  });

  it("selects highlighted option on Enter", async () => {
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
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(["Bob"]);
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
    await userEvent.click(screen.getByText("Bob"));
    expect(input).toHaveValue("");
  });

  it("does not show dropdown when not focused", () => {
    render(
      <SearchableMultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.queryByRole("list")).toBeNull();
  });
});
