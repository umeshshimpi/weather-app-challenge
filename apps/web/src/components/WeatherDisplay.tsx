import { useState } from "react";
import type { TemperatureUnit, WeatherResponse } from "@weather/domain";
import { getConditionClass } from "@weather/domain";
import { WeatherSearch } from "./WeatherSearch";
import { CurrentWeather } from "./CurrentWeather";
import { WeatherDetails } from "./WeatherDetails";
import { ForecastStrip } from "./ForecastStrip";

type Status = "idle" | "loading" | "success" | "error";

export function WeatherDisplay() {
  const [status, setStatus] = useState<Status>("idle");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [unit, setUnit] = useState<TemperatureUnit>("metric");

  async function fetchWeather(city: string, selectedUnit = unit) {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}&units=${selectedUnit}`
      );
      const json = await response.json();

      if (!response.ok) {
        setErrorMessage(json.message ?? "Failed to load weather data.");
        setStatus("error");
        return;
      }

      setWeather(json);
      setStatus("success");
    } catch {
      setErrorMessage("Network error — please check your connection and try again.");
      setStatus("error");
    }
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
            <h1 className="app-title">⛅ WeatherNow</h1>
            <p className="app-subtitle">Real-time weather</p>
          </header>

          <section className="search-form">
            <WeatherSearch
              onSearch={(city) => fetchWeather(city)}
              isLoading={status === "loading"}
            />
            {weather && (
              <div className="unit-toggle-wrap" style={{ marginTop: "0.75rem" }}>
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
              <span className="error-icon">🌧️</span>
              <p className="error-title">Something went wrong</p>
              <p className="error-message">{errorMessage}</p>
            </div>
          )}

          {status === "success" && weather && (
            <>
              <CurrentWeather data={weather} />
              <WeatherDetails data={weather} />
              <ForecastStrip data={weather} />
              {/* <p className="attribution">
                Data by{" "}
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open-Meteo
                </a>
                {" "}· Updated in real-time
              </p> */}
            </>
          )}

          {status === "idle" && (
            <div className="glass-card idle-card">
              <div className="idle-icon">🌍</div>
              <p className="idle-title">Search for a city to get started</p>
              <p className="idle-hint">Try "London", "Tokyo", or "New York"</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
