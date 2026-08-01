import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeatherDisplay } from "../WeatherDisplay";
import { mockWeather } from "./mock-weather";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("WeatherDisplay", () => {
  it("shows the idle prompt before any search", () => {
    render(<WeatherDisplay />);

    expect(screen.getByText(/search for a city/i)).toBeTruthy();
    expect(screen.getByText("Weather Forecast")).toBeTruthy();
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
  });
});
