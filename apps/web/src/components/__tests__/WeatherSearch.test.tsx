import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeatherSearch } from "../WeatherSearch";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
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

  describe("autocomplete suggestions", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    it("fetches and shows suggestions after the debounce delay", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [
            { name: "London", country: "United Kingdom", region: "England" },
            { name: "Londonderry", country: "United Kingdom" },
          ],
        })
      );
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<WeatherSearch onSearch={vi.fn()} isLoading={false} />);

      await user.type(screen.getByPlaceholderText(/search city/i), "Lon");
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeTruthy();
        expect(screen.getByText("London, England")).toBeTruthy();
        expect(screen.getByText("Londonderry")).toBeTruthy();
      });
    });

    it("searches with the suggestion name when a dropdown item is clicked", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [
            { name: "London", country: "United Kingdom", region: "England" },
          ],
        })
      );
      const onSearch = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<WeatherSearch onSearch={onSearch} isLoading={false} />);

      await user.type(screen.getByPlaceholderText(/search city/i), "Lon");
      await vi.advanceTimersByTimeAsync(300);

      const option = await screen.findByRole("button", { name: /London, England/i });
      await user.click(option);

      expect(onSearch).toHaveBeenCalledWith("London");
      expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("formats a suggestion without a region as name + country", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [{ name: "Paris", country: "France" }],
        })
      );
      const onSearch = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<WeatherSearch onSearch={onSearch} isLoading={false} />);

      await user.type(screen.getByPlaceholderText(/search city/i), "Par");
      await vi.advanceTimersByTimeAsync(300);

      const option = await screen.findByRole("button", { name: /Paris/i });
      await user.click(option);

      expect(onSearch).toHaveBeenCalledWith("Paris");
      expect(screen.getByPlaceholderText(/search city/i)).toHaveProperty(
        "value",
        "Paris, France"
      );
    });

    it("closes the suggestions dropdown when clicking outside", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [
            { name: "London", country: "United Kingdom", region: "England" },
          ],
        })
      );
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <div>
          <WeatherSearch onSearch={vi.fn()} isLoading={false} />
          <button type="button">Outside</button>
        </div>
      );

      await user.type(screen.getByPlaceholderText(/search city/i), "Lon");
      await vi.advanceTimersByTimeAsync(300);
      await screen.findByRole("listbox");

      await user.click(screen.getByRole("button", { name: "Outside" }));

      expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("reopens the dropdown on focus when suggestions are already loaded", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [
            { name: "London", country: "United Kingdom", region: "England" },
          ],
        })
      );
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <div>
          <WeatherSearch onSearch={vi.fn()} isLoading={false} />
          <button type="button">Outside</button>
        </div>
      );

      const input = screen.getByPlaceholderText(/search city/i);
      await user.type(input, "Lon");
      await vi.advanceTimersByTimeAsync(300);
      await screen.findByRole("listbox");

      await user.click(screen.getByRole("button", { name: "Outside" }));
      expect(screen.queryByRole("listbox")).toBeNull();

      await user.click(input);
      expect(screen.getByRole("listbox")).toBeTruthy();
    });

    it("swallows suggestion fetch failures so the user can still submit", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
      const onSearch = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<WeatherSearch onSearch={onSearch} isLoading={false} />);

      await user.type(screen.getByPlaceholderText(/search city/i), "Tokyo");
      await vi.advanceTimersByTimeAsync(300);

      // No dropdown appears, but manual submit still works.
      expect(screen.queryByRole("listbox")).toBeNull();
      await user.click(screen.getByRole("button", { name: /search/i }));
      expect(onSearch).toHaveBeenCalledWith("Tokyo");
    });

    it("does not show a dropdown when the suggestions response is empty", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [],
        })
      );
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<WeatherSearch onSearch={vi.fn()} isLoading={false} />);

      await user.type(screen.getByPlaceholderText(/search city/i), "Xyz");
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).toBeNull();
      });
    });
  });
});
