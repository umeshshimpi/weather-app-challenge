import { Test } from "@nestjs/testing";
import { NotFoundException, BadGatewayException } from "@nestjs/common";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WeatherService } from "./weather.service";

const mockGeoResponse = {
  results: [
    {
      id: 1,
      name: "London",
      latitude: 51.5085,
      longitude: -0.1257,
      country: "United Kingdom",
      country_code: "GB",
      admin1: "England",
    },
  ],
};

const mockWeatherResponse = {
  current: {
    temperature_2m: 18,
    apparent_temperature: 17,
    relative_humidity_2m: 70,
    pressure_msl: 1013,
    wind_speed_10m: 15,
    wind_direction_10m: 250,
    wind_gusts_10m: 22,
    cloud_cover: 40,
    precipitation: 0,
    weather_code: 2,
    is_day: 1,
  },
  daily: {
    time: ["2026-07-31"],
    weather_code: [2],
    temperature_2m_max: [22],
    temperature_2m_min: [14],
    precipitation_sum: [0],
    precipitation_probability_max: [10],
    wind_speed_10m_max: [20],
    uv_index_max: [5],
    sunrise: ["2026-07-31T05:12"],
    sunset: ["2026-07-31T21:08"],
  },
};

describe("WeatherService", () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WeatherService],
    }).compile();

    service = module.get(WeatherService);
  });

  it("returns normalized weather data for a valid city", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse })
    );

    const result = await service.getWeatherForCity("London", "metric");

    expect(result.location.name).toBe("London");
    expect(result.location.country).toBe("United Kingdom");
    expect(result.current.temperature).toBe(18);
    expect(result.current.description).toBe("Partly Cloudy");
    expect(result.current.windDirectionLabel).toBe("W");
    expect(result.daily).toHaveLength(1);
    expect(result.unit).toBe("metric");
  });

  it("throws NotFoundException when the city is not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      })
    );

    await expect(service.getWeatherForCity("Atlantis", "metric")).rejects.toThrow(
      NotFoundException
    );
  });

  it("throws BadGatewayException when geocoding request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: false, status: 500 })
    );

    await expect(service.getWeatherForCity("London", "metric")).rejects.toThrow(
      BadGatewayException
    );
  });

  it("throws BadGatewayException when weather request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse })
        .mockResolvedValueOnce({ ok: false, status: 503 })
    );

    await expect(service.getWeatherForCity("London", "metric")).rejects.toThrow(
      BadGatewayException
    );
  });
});
