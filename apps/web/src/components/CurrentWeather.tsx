import { Sunrise, Sunset } from "lucide-react";
import type { WeatherResponse } from "@weather/domain";
import {
  formatTemperature,
  formatTime,
  getTemperatureCategory,
  getUvIndexLevel,
  getWeatherIconId,
  getWeatherRecommendation,
} from "@weather/domain";
import { WeatherConditionIcon } from "./WeatherConditionIcon";

interface CurrentWeatherProps {
  data: WeatherResponse;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const { location, current, daily, unit } = data;
  const today = daily[0];
  const tempInCelsius =
    unit === "imperial" ? (current.temperature - 32) * (5 / 9) : current.temperature;

  const { label: tempLabel } = getTemperatureCategory(tempInCelsius);
  const uvInfo = getUvIndexLevel(today.uvIndexMax);
  const recommendation = getWeatherRecommendation(
    current.weatherCode,
    tempInCelsius,
    today.uvIndexMax
  );

  return (
    <div className="glass-card weather-card">
      <div>
        <h2 className="weather-city">
          {location.name}
          {location.region ? `, ${location.region}` : ""}
        </h2>
        <p className="weather-country">{location.country}</p>
      </div>

      <div className="weather-main-row">
        <WeatherConditionIcon
          id={getWeatherIconId(current.weatherCode, current.isDay)}
          size={64}
          className="weather-icon"
          aria-label={current.description}
        />
        <div className="weather-temp">
          {formatTemperature(current.temperature, unit)}
        </div>
        <p className="weather-desc">{current.description}</p>
        <p className="weather-feels-like">
          Feels like {formatTemperature(current.feelsLike, unit)} · {tempLabel}
        </p>
      </div>

      <div className="weather-high-low">
        <span>↑ {formatTemperature(today.maxTemp, unit)}</span>
        <span>↓ {formatTemperature(today.minTemp, unit)}</span>
      </div>

      <div className="weather-advice">{recommendation}</div>

      <div className="weather-meta-grid">
        <div className="glass-tile weather-meta-tile">
          <div className="weather-meta-label">UV Index</div>
          <div className="weather-meta-value">
            {Math.round(today.uvIndexMax)} · {uvInfo.level}
          </div>
        </div>
        <div className="glass-tile weather-meta-tile">
          <div className="weather-meta-label">
            <Sunrise size={14} aria-hidden="true" /> Sunrise
          </div>
          <div className="weather-meta-value">{formatTime(today.sunrise)}</div>
        </div>
        <div className="glass-tile weather-meta-tile">
          <div className="weather-meta-label">
            <Sunset size={14} aria-hidden="true" /> Sunset
          </div>
          <div className="weather-meta-value">{formatTime(today.sunset)}</div>
        </div>
      </div>
    </div>
  );
}
