import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeatherSearch } from "../WeatherSearch";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("WeatherSearch", () => {
  it("submits the trimmed city name when the form is submitted", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<WeatherSearch onSearch={onSearch} isLoading={false} />);

    await user.type(screen.getByPlaceholderText(/search city/i), "  Tokyo  ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith("Tokyo");
  });

  it("does not call onSearch when the input is empty", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<WeatherSearch onSearch={onSearch} isLoading={false} />);

    // The submit button is disabled while the input is empty, so this click is a no-op.
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("disables the search button while a search is in progress", () => {
    render(<WeatherSearch onSearch={vi.fn()} isLoading={true} />);

    const button = screen.getByRole("button", { name: /loading/i }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it("shows recent searches and re-runs a search when one is clicked", async () => {
    const onRecentSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <WeatherSearch
        onSearch={vi.fn()}
        isLoading={false}
        recentSearches={["London", "Paris"]}
        onRecentSearch={onRecentSearch}
      />
    );

    await user.click(screen.getByRole("button", { name: "London" }));

    expect(onRecentSearch).toHaveBeenCalledWith("London");
  });

  it("hides recent searches once the user starts typing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const user = userEvent.setup();

    render(
      <WeatherSearch
        onSearch={vi.fn()}
        isLoading={false}
        recentSearches={["London"]}
      />
    );

    expect(screen.getByRole("button", { name: "London" })).toBeTruthy();

    await user.type(screen.getByPlaceholderText(/search city/i), "P");

    expect(screen.queryByRole("button", { name: "London" })).toBeNull();
  });
});
