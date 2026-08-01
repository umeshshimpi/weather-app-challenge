import {
  Sun,
  Moon,
  Cloud,
  CloudFog,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudMoon,
  CloudDrizzle,
  CloudLightning,
  type LucideProps,
} from "lucide-react";
import type { WeatherIconId } from "@weather/domain";

const ICON_MAP: Record<WeatherIconId, React.ElementType<LucideProps>> = {
  "clear-day": Sun,
  "clear-night": Moon,
  "partly-cloudy-day": CloudSun,
  "partly-cloudy-night": CloudMoon,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  "snow-showers": CloudSnow,
  thunderstorm: CloudLightning,
};

interface WeatherConditionIconProps {
  id: WeatherIconId;
  size?: number;
  className?: string;
  /** Accessible label — omit only when a visible label already describes the icon. */
  "aria-label"?: string;
}

/**
 * Renders the appropriate SVG icon for a weather condition identifier returned
 * by `getWeatherIconId`. Using a dedicated component keeps the icon rendering
 * logic in one place and avoids raw strings/emojis scattered across the UI.
 */
export function WeatherConditionIcon({
  id,
  size = 24,
  className,
  "aria-label": ariaLabel,
}: WeatherConditionIconProps) {
  const Icon = ICON_MAP[id];
  return (
    <Icon
      size={size}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
}
