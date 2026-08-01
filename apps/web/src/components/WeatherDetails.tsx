import {
  Cloud,
  CloudRain,
  Droplets,
  Gauge,
  Thermometer,
  Wind,
} from "lucide-react";
import type { WeatherResponse } from "@weather/domain";

interface WeatherDetailsProps {
  data: WeatherResponse;
}

interface DetailTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

function DetailTile({ icon, label, value, sub }: DetailTileProps) {
  return (
    <div className="glass-tile detail-tile">
      <span className="detail-label">
        <span className="detail-icon" aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span className="detail-value">{value}</span>
      {sub && <span className="detail-sub">{sub}</span>}
    </div>
  );
}

export function WeatherDetails({ data }: WeatherDetailsProps) {
  const { current, unit } = data;
  const windUnit = unit === "imperial" ? "mph" : "km/h";
  const pressureHpa = Math.round(current.pressure);

  return (
    <div className="glass-card details-card">
      <h2 className="section-heading">Current Details</h2>
      <div className="details-grid">
        <DetailTile
          icon={<Droplets size={14} />}
          label="Humidity"
          value={`${current.humidity}%`}
          sub={
            current.humidity > 70 ? "High — feels sticky"
            : current.humidity < 30 ? "Low — dry air"
            : "Comfortable"
          }
        />
        <DetailTile
          icon={<Wind size={14} />}
          label="Wind"
          value={`${Math.round(current.windSpeed)} ${windUnit}`}
          sub={`${current.windDirectionLabel} · Gusts ${Math.round(current.windGusts)} ${windUnit}`}
        />
        <DetailTile
          icon={<Gauge size={14} />}
          label="Pressure"
          value={`${pressureHpa} hPa`}
          sub={
            pressureHpa > 1020 ? "High pressure"
            : pressureHpa < 1000 ? "Low pressure"
            : "Normal"
          }
        />
        <DetailTile
          icon={<Cloud size={14} />}
          label="Cloud Cover"
          value={`${current.cloudCover}%`}
          sub={
            current.cloudCover < 25 ? "Mostly clear"
            : current.cloudCover < 75 ? "Partly cloudy"
            : "Overcast"
          }
        />
        <DetailTile
          icon={<CloudRain size={14} />}
          label="Precipitation"
          value={`${current.precipitation} mm`}
          sub="Last hour"
        />
        <DetailTile
          icon={<Thermometer size={14} />}
          label="Dew Point"
          value={`${computeDewPoint(current.temperature, current.humidity, unit)}°`}
          sub="Moisture level"
        />
      </div>
    </div>
  );
}

/**
 * Approximates dew point using the Magnus formula.
 */
function computeDewPoint(
  temp: number,
  humidity: number,
  unit: "metric" | "imperial"
): number {
  const tempC = unit === "imperial" ? ((temp - 32) * 5) / 9 : temp;
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  const dewC = (b * alpha) / (a - alpha);
  const result = unit === "imperial" ? (dewC * 9) / 5 + 32 : dewC;
  return Math.round(result);
}
