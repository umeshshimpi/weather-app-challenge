import type { WeatherResponse } from "@weather/domain";
import { formatTemperature, formatWeekday, getWeatherEmoji } from "@weather/domain";

interface ForecastStripProps {
  data: WeatherResponse;
}

export function ForecastStrip({ data }: ForecastStripProps) {
  const { daily, unit } = data;

  return (
    <div className="glass-card forecast-card">
      <h2 className="section-heading">7-Day Forecast</h2>
      <div className="forecast-grid">
        {daily.map((day, index) => (
          <div
            key={day.date}
            className={`glass-tile forecast-day ${index === 0 ? "forecast-day-active" : ""}`}
          >
            <span className="forecast-day-label">
              {index === 0 ? "Today" : formatWeekday(day.date)}
            </span>
            <span className="forecast-day-icon">
              {getWeatherEmoji(day.weatherCode, true)}
            </span>
            {day.precipitationProbability > 0 && (
              <span className="forecast-rain-chance">
                {day.precipitationProbability}%
              </span>
            )}
            <div>
              <div className="forecast-temp-high">
                {formatTemperature(day.maxTemp, unit)}
              </div>
              <div className="forecast-temp-low">
                {formatTemperature(day.minTemp, unit)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
