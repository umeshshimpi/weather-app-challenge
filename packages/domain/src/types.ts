export type TemperatureUnit = "metric" | "imperial";

export interface GeoLocation {
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  region?: string;
}

export interface CurrentConditions {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windDirectionLabel: string;
  windGusts: number;
  cloudCover: number;
  precipitation: number;
  weatherCode: number;
  description: string;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  description: string;
  precipitationSum: number;
  precipitationProbability: number;
  maxWindSpeed: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherResponse {
  location: GeoLocation;
  current: CurrentConditions;
  daily: DailyForecast[];
  unit: TemperatureUnit;
}

// Raw Open-Meteo shapes — only used inside the API service
export interface OpenMeteoGeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

export interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[];
}

export interface OpenMeteoWeatherResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    cloud_cover: number;
    precipitation: number;
    weather_code: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}
