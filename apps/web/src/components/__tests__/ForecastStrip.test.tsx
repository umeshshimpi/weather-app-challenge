import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ForecastStrip } from "../ForecastStrip";
import { mockWeather } from "./mock-weather";

afterEach(cleanup);

describe("ForecastStrip", () => {
  it("renders the forecast heading and one card per day", () => {
    render(<ForecastStrip data={mockWeather} />);

    expect(screen.getByText("7-Day Forecast")).toBeTruthy();
    expect(screen.getByText("Today")).toBeTruthy();
    expect(document.querySelectorAll(".forecast-day")).toHaveLength(2);
  });

  it("shows rain chance when precipitation probability is above zero", () => {
    render(<ForecastStrip data={mockWeather} />);

    expect(screen.getByText("10%")).toBeTruthy();
    expect(screen.getByText("60%")).toBeTruthy();
  });
});
