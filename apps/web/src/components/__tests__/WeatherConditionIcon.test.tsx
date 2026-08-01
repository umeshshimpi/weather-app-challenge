import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WeatherConditionIcon } from "../WeatherConditionIcon";

afterEach(cleanup);

describe("WeatherConditionIcon", () => {
  it("renders an accessible icon for a known condition id", () => {
    render(<WeatherConditionIcon id="clear-day" aria-label="Clear sky" />);

    expect(screen.getByLabelText("Clear sky")).toBeTruthy();
  });

  it("hides the icon from assistive tech when no label is provided", () => {
    const { container } = render(<WeatherConditionIcon id="rain" />);
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
