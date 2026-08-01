import { useState } from "react";
import { CloudOff, CloudSun, MapPin } from "lucide-react";
import type { TemperatureUnit, WeatherResponse } from "@weather/domain";
import { getConditionClass } from "@weather/domain";
import { apiUrl } from "../lib/api";
import { WeatherSearch } from "./WeatherSearch";
import { CurrentWeather } from "./CurrentWeather";
import { WeatherDetails } from "./WeatherDetails";
import { ForecastStrip } from "./ForecastStrip";

type Status = "idle" | "loading" | "success" | "error";

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = "weather-recent-searches";

function loadRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // localStorage may be unavailable in private browsing or restricted environments
  }
}

export function WeatherDisplay() {
  const [status, setStatus] = useState<Status>("idle");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [unit, setUnit] = useState<TemperatureUnit>("imperial");
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);

  async function fetchWeather(city: string, selectedUnit = unit) {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        apiUrl(`/api/weather?city=${encodeURIComponent(city)}&units=${selectedUnit}`)
      );

      if (!response.ok) {
        const err = (await response.json()) as { message?: string };
        setErrorMessage(err.message ?? "Failed to load weather data.");
        setStatus("error");
        return;
      }

      const data = (await response.json()) as WeatherResponse;
      setWeather(data);
      setStatus("success");
      addRecentSearch(city);
    } catch {
      setErrorMessage("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  function addRecentSearch(city: string) {
    const updated = [city, ...recentSearches.filter((s) => s !== city)].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    setRecentSearches(updated);
    saveRecentSearches(updated);
  }

  function handleUnitToggle() {
    const newUnit: TemperatureUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    if (weather) {
      fetchWeather(weather.location.name, newUnit);
    }
  }

  const conditionClass = weather
    ? getConditionClass(weather.current.weatherCode, weather.current.isDay)
    : "condition-default";

  return (
    <div className={`page-wrapper ${conditionClass}`}>
      <div className="page-overlay">
        <div className="app-container">

          <header className="app-header">
            <h1 className="app-title">
              <CloudSun className="app-title-icon" aria-hidden="true" />
              Weather Forecast
            </h1>
            <p className="app-subtitle">Real-time weather app</p>
          </header>

          <section className="search-form">
            <WeatherSearch
              onSearch={(city) => fetchWeather(city)}
              isLoading={status === "loading"}
              recentSearches={recentSearches}
              onRecentSearch={(city) => fetchWeather(city)}
            />
            {weather && (
              <div className="unit-toggle-wrap">
                <button onClick={handleUnitToggle} className="unit-toggle">
                  Switch to {unit === "metric" ? "°F" : "°C"}
                </button>
              </div>
            )}
          </section>

          {status === "loading" && (
            <div className="glass-card loading-card">
              <div className="skeleton-circle" />
              <div className="skeleton-bar-lg" />
              <div className="skeleton-bar-md" />
              <div className="skeleton-row">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-tile" />
                ))}
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="glass-card error-card">
              <CloudOff size={40} className="error-icon" aria-hidden="true" />
              <p className="error-title">Something went wrong</p>
              <p className="error-message">{errorMessage}</p>
            </div>
          )}

          {status === "success" && weather && (
            <>
              <CurrentWeather data={weather} />
              <WeatherDetails data={weather} />
              <ForecastStrip data={weather} />
            </>
          )}

          {status === "idle" && (
            <div className="glass-card idle-card">
              <MapPin size={56} className="idle-icon" aria-hidden="true" />
              <p className="idle-title">Search for a city to get started</p>
              <p className="idle-hint">Try "London", "Tokyo", or "New York"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
