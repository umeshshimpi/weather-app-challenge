import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeatherDisplay } from "../WeatherDisplay";
import { mockWeather } from "./mock-weather";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("WeatherDisplay", () => {
  it("shows the idle prompt before any search", () => {
    render(<WeatherDisplay />);

    expect(screen.getByText(/search for a city/i)).toBeTruthy();
    expect(screen.getByText("Weather Forecast")).toBeTruthy();
  });

  it("loads recent searches from localStorage on mount", () => {
    localStorage.setItem("weather-recent-searches", JSON.stringify(["Tokyo"]));

    render(<WeatherDisplay />);

    expect(screen.getByRole("button", { name: "Tokyo" })).toBeTruthy();
  });

  it("returns an empty recent-search list when localStorage data is invalid", () => {
    localStorage.setItem("weather-recent-searches", "{not-json");

    render(<WeatherDisplay />);

    expect(screen.queryByRole("navigation", { name: /recent searches/i })).toBeNull();
    expect(screen.getByText(/search for a city/i)).toBeTruthy();
  });

  it("shows an error card when the weather request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "City not found" }),
      })
    );
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.type(screen.getByPlaceholderText(/search city/i), "Atlantis");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeTruthy();
      expect(screen.getByText("City not found")).toBeTruthy();
    });
  });

  it("uses a fallback error message when the API response has no message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })
    );
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.type(screen.getByPlaceholderText(/search city/i), "Nowhere");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to load weather data.")).toBeTruthy();
    });
  });

  it("shows a network error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.type(screen.getByPlaceholderText(/search city/i), "London");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/network error — please check your connection/i)
      ).toBeTruthy();
    });
  });

  it("shows weather data when the request succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeather,
      })
    );
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.type(screen.getByPlaceholderText(/search city/i), "London");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/London/)).toBeTruthy();
      expect(screen.getByText("Current Details")).toBeTruthy();
      expect(screen.getByText("7-Day Forecast")).toBeTruthy();
    });

    expect(JSON.parse(localStorage.getItem("weather-recent-searches")!)).toEqual([
      "London",
    ]);
  });

  it("shows a loading skeleton while the request is in flight", async () => {
    let resolveFetch!: (value: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      )
    );
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.type(screen.getByPlaceholderText(/search city/i), "London");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(document.querySelector(".loading-card")).toBeTruthy();

    resolveFetch({ ok: true, json: async () => mockWeather });

    await waitFor(() => {
      expect(screen.getByText("Current Details")).toBeTruthy();
    });
  });

  it("re-fetches weather in the other unit when the unit toggle is clicked", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockWeather,
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.type(screen.getByPlaceholderText(/search city/i), "London");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /switch to °c/i })).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /switch to °c/i }));

    await waitFor(() => {
      const calls = fetchMock.mock.calls;
      const metricUrl = String(calls[calls.length - 1]?.[0] ?? "");
      expect(metricUrl).toContain("units=metric");
      expect(metricUrl).toContain("city=London");
    });

    expect(screen.getByRole("button", { name: /switch to °f/i })).toBeTruthy();

    // Toggle back so both sides of the unit ternary are covered.
    await user.click(screen.getByRole("button", { name: /switch to °f/i }));

    await waitFor(() => {
      const calls = fetchMock.mock.calls;
      const imperialUrl = String(calls[calls.length - 1]?.[0] ?? "");
      expect(imperialUrl).toContain("units=imperial");
      expect(screen.getByRole("button", { name: /switch to °c/i })).toBeTruthy();
    });
  });

  it("re-fetches weather when a recent search chip is clicked", async () => {
    localStorage.setItem("weather-recent-searches", JSON.stringify(["Paris"]));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockWeather,
        location: { ...mockWeather.location, name: "Paris" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.click(screen.getByRole("button", { name: "Paris" }));

    await waitFor(() => {
      expect(String(fetchMock.mock.calls[0]?.[0] ?? "")).toContain("city=Paris");
      expect(screen.getByText(/Paris/)).toBeTruthy();
    });
  });

  it("swallows localStorage write failures when saving recent searches", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeather,
      })
    );
    const user = userEvent.setup();

    render(<WeatherDisplay />);

    await user.type(screen.getByPlaceholderText(/search city/i), "London");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText("Current Details")).toBeTruthy();
    });
  });
});
