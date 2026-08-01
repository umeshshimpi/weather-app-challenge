import { describe, it, expect } from "vitest";
import {
  getWeatherDescription,
  getWeatherEmoji,
  getWindDirectionLabel,
  getUvIndexLevel,
  getTemperatureCategory,
  getWeatherRecommendation,
  celsiusToFahrenheit,
  formatTemperature,
  formatWeekday,
  getConditionClass,
} from "../weather-utils";

describe("getWeatherDescription", () => {
  it("returns the description for a known WMO code", () => {
    expect(getWeatherDescription(0)).toBe("Clear Sky");
    expect(getWeatherDescription(63)).toBe("Moderate Rain");
    expect(getWeatherDescription(95)).toBe("Thunderstorm");
  });

  it("returns 'Unknown' for an unrecognized code", () => {
    expect(getWeatherDescription(999)).toBe("Unknown");
  });
});

describe("getWeatherEmoji", () => {
  it("shows sun for clear sky during the day", () => {
    expect(getWeatherEmoji(0, true)).toBe("☀️");
  });

  it("shows moon for clear sky at night", () => {
    expect(getWeatherEmoji(0, false)).toBe("🌙");
  });

  it("shows thunderstorm emoji for code 95+", () => {
    expect(getWeatherEmoji(95, true)).toBe("⛈️");
    expect(getWeatherEmoji(99, true)).toBe("⛈️");
  });

  it("shows snow emoji for codes 71–77", () => {
    expect(getWeatherEmoji(71, true)).toBe("❄️");
    expect(getWeatherEmoji(75, true)).toBe("❄️");
  });
});

describe("getWindDirectionLabel", () => {
  it("converts cardinal degrees correctly", () => {
    expect(getWindDirectionLabel(0)).toBe("N");
    expect(getWindDirectionLabel(90)).toBe("E");
    expect(getWindDirectionLabel(180)).toBe("S");
    expect(getWindDirectionLabel(270)).toBe("W");
  });

  it("handles intercardinal directions", () => {
    expect(getWindDirectionLabel(45)).toBe("NE");
    expect(getWindDirectionLabel(135)).toBe("SE");
    expect(getWindDirectionLabel(225)).toBe("SW");
    expect(getWindDirectionLabel(315)).toBe("NW");
  });

  it("handles degrees above 360 (wraps around)", () => {
    expect(getWindDirectionLabel(360)).toBe("N");
    expect(getWindDirectionLabel(450)).toBe("E");
  });

  it("handles negative degrees by normalising", () => {
    expect(getWindDirectionLabel(-90)).toBe("W");
  });
});

describe("getUvIndexLevel", () => {
  it("classifies UV index correctly", () => {
    expect(getUvIndexLevel(1).level).toBe("Low");
    expect(getUvIndexLevel(4).level).toBe("Moderate");
    expect(getUvIndexLevel(7).level).toBe("High");
    expect(getUvIndexLevel(9).level).toBe("Very High");
    expect(getUvIndexLevel(12).level).toBe("Extreme");
  });

  it("includes an advice string for each level", () => {
    expect(getUvIndexLevel(1).advice).toBeTruthy();
    expect(getUvIndexLevel(12).advice).toBeTruthy();
  });
});

describe("getTemperatureCategory", () => {
  it("labels freezing temperatures correctly", () => {
    expect(getTemperatureCategory(-5).label).toBe("Freezing");
    expect(getTemperatureCategory(0).label).toBe("Freezing");
  });

  it("labels hot temperatures correctly", () => {
    expect(getTemperatureCategory(35).label).toBe("Hot");
  });

  it("labels comfortable temperatures correctly", () => {
    expect(getTemperatureCategory(22).label).toBe("Comfortable");
  });
});

describe("getWeatherRecommendation", () => {
  it("recommends staying indoors during a thunderstorm", () => {
    const rec = getWeatherRecommendation(95, 20, 2);
    expect(rec.toLowerCase()).toContain("thunderstorm");
  });

  it("recommends an umbrella when it is raining", () => {
    const rec = getWeatherRecommendation(63, 15, 2);
    expect(rec.toLowerCase()).toContain("umbrella");
  });

  it("recommends warm layers for freezing temperatures", () => {
    const rec = getWeatherRecommendation(0, -5, 0);
    expect(rec.toLowerCase()).toContain("heavy layers");
  });

  it("recommends sunscreen for high UV on a clear day", () => {
    const rec = getWeatherRecommendation(0, 22, 9);
    expect(rec.toLowerCase()).toContain("sun");
  });
});

describe("celsiusToFahrenheit", () => {
  it("converts 0°C to 32°F", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it("converts 100°C to 212°F", () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it("converts -40°C to -40°F (the crossover point)", () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });
});

describe("formatTemperature", () => {
  it("appends °C for metric units", () => {
    expect(formatTemperature(22, "metric")).toBe("22°C");
  });

  it("appends °F for imperial units", () => {
    expect(formatTemperature(72, "imperial")).toBe("72°F");
  });

  it("rounds the value", () => {
    expect(formatTemperature(22.7, "metric")).toBe("23°C");
  });
});

describe("formatWeekday", () => {
  it("returns a 3-letter weekday abbreviation", () => {
    const result = formatWeekday("2026-01-05");
    expect(result).toBe("Mon");
  });
});

describe("getConditionClass", () => {
  it("returns 'condition-night' when isDay is false", () => {
    expect(getConditionClass(0, false)).toBe("condition-night");
    expect(getConditionClass(95, false)).toBe("condition-night");
  });

  it("returns 'condition-clear' for clear daytime weather", () => {
    expect(getConditionClass(0, true)).toBe("condition-clear");
    expect(getConditionClass(1, true)).toBe("condition-clear");
  });

  it("returns 'condition-storm' for thunderstorm codes", () => {
    expect(getConditionClass(95, true)).toBe("condition-storm");
    expect(getConditionClass(99, true)).toBe("condition-storm");
  });

  it("returns 'condition-snow' for snow codes", () => {
    expect(getConditionClass(71, true)).toBe("condition-snow");
    expect(getConditionClass(86, true)).toBe("condition-snow");
  });

  it("returns 'condition-rain' for rain codes", () => {
    expect(getConditionClass(63, true)).toBe("condition-rain");
  });
});
