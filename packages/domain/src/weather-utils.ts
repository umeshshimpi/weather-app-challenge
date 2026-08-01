import type { TemperatureUnit, WeatherIconId } from "./types";

/**
 * Maps WMO Weather Interpretation Codes to human-readable descriptions.
 * https://open-meteo.com/en/docs#weathervariables
 */
const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Icy Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  71: "Slight Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Slight Showers",
  81: "Moderate Showers",
  82: "Violent Showers",
  85: "Slight Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Hail",
  99: "Thunderstorm with Heavy Hail",
};

export function getWeatherDescription(weatherCode: number): string {
  return WMO_DESCRIPTIONS[weatherCode] ?? "Unknown";
}

/**
 * Maps a WMO weather code to a semantic icon identifier.
 * The frontend maps these IDs to SVG components, keeping the domain free of
 * any UI-framework dependencies.
 */
export function getWeatherIconId(weatherCode: number, isDay: boolean): WeatherIconId {
  if (weatherCode === 0) return isDay ? "clear-day" : "clear-night";
  if (weatherCode <= 2) return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
  if (weatherCode === 3) return "overcast";
  if (weatherCode <= 48) return "fog";
  if (weatherCode <= 55) return "drizzle";
  if (weatherCode <= 67) return "rain";
  if (weatherCode <= 77) return "snow";
  if (weatherCode <= 82) return "rain";
  if (weatherCode <= 86) return "snow-showers";
  return "thunderstorm";
}

/**
 * Converts compass degrees to an 8-point cardinal direction label.
 */
export function getWindDirectionLabel(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((degrees % 360) + 360) % 360 / 45) % 8;
  return directions[index];
}

/**
 * Returns a UV index safety level and protective advice.
 */
export function getUvIndexLevel(uvIndex: number): { level: string; advice: string } {
  if (uvIndex < 3) return { level: "Low",       advice: "No protection needed" };
  if (uvIndex < 6) return { level: "Moderate",  advice: "Wear sunscreen SPF 30+" };
  if (uvIndex < 8) return { level: "High",      advice: "SPF 50+, seek shade midday" };
  if (uvIndex < 11) return { level: "Very High", advice: "Avoid the sun 10am–4pm" };
  return              { level: "Extreme",   advice: "Stay indoors if possible" };
}

/**
 * Determines the temperature comfort category.
 */
export function getTemperatureCategory(celsius: number): { label: string } {
  if (celsius <= 0)  return { label: "Freezing" };
  if (celsius <= 10) return { label: "Cold" };
  if (celsius <= 18) return { label: "Cool" };
  if (celsius <= 24) return { label: "Comfortable" };
  if (celsius <= 30) return { label: "Warm" };
  return               { label: "Hot" };
}

/**
 * Returns a practical clothing or activity recommendation based on the weather.
 */
export function getWeatherRecommendation(
  weatherCode: number,
  tempCelsius: number,
  uvIndex: number,
): string {
  const isRaining = weatherCode >= 51 && weatherCode <= 82;
  const isSnowing = weatherCode >= 71 && weatherCode <= 86;
  const isThunderstorm = weatherCode >= 95;

  if (isThunderstorm) return "Thunderstorm warning — stay indoors and away from windows.";
  if (isSnowing) return "Snow expected — wear warm layers and allow extra travel time.";
  if (isRaining) return "Rain in the forecast — bring an umbrella.";
  if (tempCelsius <= 0) return "Freezing temperatures — wear heavy layers and watch for ice.";
  if (tempCelsius <= 10) return "Cold day — a coat and gloves are recommended.";
  if (tempCelsius <= 18) return "Cool weather — a light jacket is a good idea.";
  if (uvIndex >= 8) return "Very strong UV today — sunscreen and a hat are essential.";
  if (uvIndex >= 6) return "Moderate UV — apply sunscreen before heading out.";
  if (tempCelsius >= 30) return "Hot day — stay hydrated and take breaks in the shade.";
  return "Pleasant conditions — great day to be outside!";
}

export function celsiusToFahrenheit(celsius: number): number {
  return Math.round(celsius * 9 / 5 + 32);
}

export function formatTemperature(value: number, unit: TemperatureUnit): string {
  const symbol = unit === "imperial" ? "°F" : "°C";
  return `${Math.round(value)}${symbol}`;
}

export function formatTime(isoDatetime: string): string {
  const date = new Date(isoDatetime);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatWeekday(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Returns a semantic CSS condition class name for the current weather.
 * The visual gradient is defined in the CSS layer — not here.
 * This keeps presentation details out of the domain.
 *
 * WMO code ranges (simplified):
 *   0–1   clear  |  2–3   cloudy  |  45–48  fog
 *   51–67  rain   |  71–77  snow   |  80–82  rain showers
 *   85–86  snow showers            |  95+    storm
 */
export function getConditionClass(weatherCode: number, isDay: boolean): string {
  if (!isDay) return "condition-night";
  if (weatherCode <= 1) return "condition-clear";
  if (weatherCode <= 3) return "condition-cloudy";
  if (weatherCode <= 48) return "condition-fog";
  if (weatherCode <= 67) return "condition-rain";    // drizzle + rain
  if (weatherCode <= 77) return "condition-snow";    // snow fall
  if (weatherCode <= 82) return "condition-rain";    // rain showers
  if (weatherCode <= 86) return "condition-snow";    // snow showers
  return "condition-storm";
}
