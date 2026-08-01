import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WeatherDetails } from "../WeatherDetails";
import { mockWeather } from "./mock-weather";

afterEach(cleanup);

describe("WeatherDetails", () => {
  it("renders the core detail tiles", () => {
    render(<WeatherDetails data={mockWeather} />);

    expect(screen.getByText("Current Details")).toBeTruthy();
    expect(screen.getByText("Humidity")).toBeTruthy();
    expect(screen.getByText("55%")).toBeTruthy();
    expect(screen.getByText("Wind")).toBeTruthy();
    expect(screen.getByText("Comfort")).toBeTruthy();
  });
});
