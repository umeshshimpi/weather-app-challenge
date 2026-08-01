import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CurrentWeather } from "../CurrentWeather";
import { mockWeather } from "./mock-weather";

afterEach(cleanup);

describe("CurrentWeather", () => {
  it("renders the city, country, and temperature", () => {
    render(<CurrentWeather data={mockWeather} />);

    expect(screen.getByText(/London/)).toBeTruthy();
    expect(screen.getByText("United Kingdom")).toBeTruthy();
    expect(screen.getByText("68°F")).toBeTruthy();
    expect(screen.getByText("Partly Cloudy")).toBeTruthy();
  });

  it("shows UV index and a recommendation", () => {
    render(<CurrentWeather data={mockWeather} />);

    expect(screen.getByText("UV Index")).toBeTruthy();
    expect(document.querySelector(".weather-advice")?.textContent).toBeTruthy();
  });
});
