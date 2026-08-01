import { describe, it, expect } from "vitest";
import {
  getWeatherDescription,
  getWeatherIconId,
  getWindDirectionLabel,
  getUvIndexLevel,
  getTemperatureCategory,
  getWeatherRecommendation,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  getComfortIndex,
  formatTemperature,
  formatTime,
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

describe("getWeatherIconId", () => {
  it("returns 'clear-day' for clear sky during the day", () => {
    expect(getWeatherIconId(0, true)).toBe("clear-day");
  });

  it("returns 'clear-night' for clear sky at night", () => {
    expect(getWeatherIconId(0, false)).toBe("clear-night");
  });

  it("returns 'thunderstorm' for code 95+", () => {
    expect(getWeatherIconId(95, true)).toBe("thunderstorm");
    expect(getWeatherIconId(99, true)).toBe("thunderstorm");
  });

  it("returns 'snow' for snow codes 71–77", () => {
    expect(getWeatherIconId(71, true)).toBe("snow");
    expect(getWeatherIconId(75, true)).toBe("snow");
  });

  it("returns 'rain' for rain codes 61–67", () => {
    expect(getWeatherIconId(63, true)).toBe("rain");
  });

  it("returns 'fog' for fog codes up to 48", () => {
    expect(getWeatherIconId(45, true)).toBe("fog");
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

  it("recommends sunscreen for moderate UV on a mild day", () => {
    const rec = getWeatherRecommendation(0, 22, 7);
    expect(rec.toLowerCase()).toContain("sunscreen");
  });

  it("recommends staying hydrated on a hot, low-UV day", () => {
    const rec = getWeatherRecommendation(0, 32, 2);
    expect(rec.toLowerCase()).toContain("hydrated");
  });

  it("returns a pleasant message for mild, calm conditions", () => {
    const rec = getWeatherRecommendation(0, 20, 2);
    expect(rec.toLowerCase()).toContain("pleasant");
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

describe("fahrenheitToCelsius", () => {
  it("converts 32°F to 0°C", () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
  });

  it("converts 212°F to 100°C", () => {
    expect(fahrenheitToCelsius(212)).toBe(100);
  });

  it("is the inverse of celsiusToFahrenheit at the crossover point", () => {
    expect(fahrenheitToCelsius(-40)).toBe(-40);
  });
});

describe("getComfortIndex", () => {
  it("returns 'Humid' for hot and humid conditions", () => {
    expect(getComfortIndex(28, 75).label).toBe("Humid");
  });

  it("returns 'Damp' for cold and humid conditions", () => {
    expect(getComfortIndex(5, 80).label).toBe("Damp");
  });

  it("returns 'Dry Heat' for hot conditions with low humidity", () => {
    expect(getComfortIndex(30, 20).label).toBe("Dry Heat");
  });

  it("returns 'Comfortable' for mild temperature and moderate humidity", () => {
    expect(getComfortIndex(20, 45).label).toBe("Comfortable");
  });

  it("includes a description for every label", () => {
    expect(getComfortIndex(28, 75).description).toBeTruthy();
    expect(getComfortIndex(20, 45).description).toBeTruthy();
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

describe("formatTime", () => {
  it("formats an ISO datetime as a 12-hour clock time", () => {
    const result = formatTime("2026-01-05T14:30:00");
    expect(result).toBe("2:30 PM");
  });

  it("pads single-digit minutes", () => {
    const result = formatTime("2026-01-05T09:05:00");
    expect(result).toBe("9:05 AM");
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
