import { BadGatewayException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  GeoLocation,
  OpenMeteoGeoResponse,
  OpenMeteoWeatherResponse,
  TemperatureUnit,
  WeatherResponse,
} from "@weather/domain";
import { getWeatherDescription, getWindDirectionLabel } from "@weather/domain";

const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

@Injectable()
export class WeatherService {
  async getWeatherForCity(
    city: string,
    unit: TemperatureUnit
  ): Promise<WeatherResponse> {
    const location = await this.geocodeCity(city);
    const raw = await this.fetchOpenMeteoWeather(
      location.latitude,
      location.longitude,
      unit
    );
    return this.normalizeWeatherResponse(raw, location, unit);
  }

  /**
   * Resolves a city name to geographic coordinates via the Open-Meteo
   * geocoding API. Direct REST call — no third-party wrapper.
   */
  private async geocodeCity(city: string): Promise<GeoLocation> {
    const url = `${GEO_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadGatewayException(
        `Geocoding request failed with status ${response.status}`
      );
    }

    const data = (await response.json()) as OpenMeteoGeoResponse;

    if (!data.results?.length) {
      throw new NotFoundException(
        `City "${city}" not found. Please check the spelling and try again.`
      );
    }

    const result = data.results[0];
    return {
      name: result.name,
      country: result.country,
      countryCode: result.country_code,
      latitude: result.latitude,
      longitude: result.longitude,
      region: result.admin1,
    };
  }

  /**
   * Fetches current weather and a 7-day forecast from Open-Meteo.
   * Direct REST call — no third-party wrapper.
   */
  private async fetchOpenMeteoWeather(
    latitude: number,
    longitude: number,
    unit: TemperatureUnit
  ): Promise<OpenMeteoWeatherResponse> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "pressure_msl",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "cloud_cover",
        "precipitation",
        "weather_code",
        "is_day",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "uv_index_max",
        "sunrise",
        "sunset",
      ].join(","),
      timezone: "auto",
      forecast_days: "7",
      temperature_unit: unit === "imperial" ? "fahrenheit" : "celsius",
      wind_speed_unit: unit === "imperial" ? "mph" : "kmh",
    });

    const response = await fetch(`${WEATHER_API_URL}?${params}`);
    if (!response.ok) {
      throw new BadGatewayException(
        `Weather request failed with status ${response.status}`
      );
    }

    return response.json() as Promise<OpenMeteoWeatherResponse>;
  }

  /**
   * Transforms the raw Open-Meteo response into the application's WeatherResponse
   * contract. Nothing outside this service knows the upstream API's shape.
   */
  private normalizeWeatherResponse(
    raw: OpenMeteoWeatherResponse,
    location: GeoLocation,
    unit: TemperatureUnit
  ): WeatherResponse {
    const c = raw.current;
    const d = raw.daily;

    return {
      location,
      unit,
      current: {
        temperature: c.temperature_2m,
        feelsLike: c.apparent_temperature,
        humidity: c.relative_humidity_2m,
        pressure: c.pressure_msl,
        windSpeed: c.wind_speed_10m,
        windDirection: c.wind_direction_10m,
        windDirectionLabel: getWindDirectionLabel(c.wind_direction_10m),
        windGusts: c.wind_gusts_10m,
        cloudCover: c.cloud_cover,
        precipitation: c.precipitation,
        weatherCode: c.weather_code,
        description: getWeatherDescription(c.weather_code),
        isDay: c.is_day === 1,
      },
      daily: d.time.map((date, i) => ({
        date,
        maxTemp: d.temperature_2m_max[i],
        minTemp: d.temperature_2m_min[i],
        weatherCode: d.weather_code[i],
        description: getWeatherDescription(d.weather_code[i]),
        precipitationSum: d.precipitation_sum[i],
        precipitationProbability: d.precipitation_probability_max[i],
        maxWindSpeed: d.wind_speed_10m_max[i],
        uvIndexMax: d.uv_index_max[i],
        sunrise: d.sunrise[i],
        sunset: d.sunset[i],
      })),
    };
  }
}
