import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LocationSuggestion, WeatherResponse } from "@weather/domain";
import { WeatherController } from "./weather.controller";
import { WeatherService } from "./weather.service";
import type { WeatherQueryDto } from "./dto/weather-query.dto";
import type { SuggestionsQueryDto } from "./dto/suggestions-query.dto";

describe("WeatherController", () => {
  let controller: WeatherController;
  let service: {
    getWeatherForCity: ReturnType<typeof vi.fn>;
    getSuggestions: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getWeatherForCity: vi.fn(),
      getSuggestions: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: service }],
    }).compile();

    controller = module.get(WeatherController);
  });

  it("delegates GET /api/weather to WeatherService.getWeatherForCity", async () => {
    const mockResponse = { location: { name: "London" } } as unknown as WeatherResponse;
    service.getWeatherForCity.mockResolvedValue(mockResponse);

    const result = await controller.getWeather({
      city: "London",
      units: "metric",
    } as WeatherQueryDto);

    expect(service.getWeatherForCity).toHaveBeenCalledWith("London", "metric");
    expect(result).toBe(mockResponse);
  });

  it("defaults to metric units when the query does not specify one", async () => {
    service.getWeatherForCity.mockResolvedValue({} as WeatherResponse);

    await controller.getWeather({ city: "Tokyo" } as WeatherQueryDto);

    expect(service.getWeatherForCity).toHaveBeenCalledWith("Tokyo", "metric");
  });

  it("delegates GET /api/weather/suggestions to WeatherService.getSuggestions", async () => {
    const mockSuggestions: LocationSuggestion[] = [
      { name: "London", country: "United Kingdom", region: "England" },
    ];
    service.getSuggestions.mockResolvedValue(mockSuggestions);

    const result = await controller.getSuggestions({ q: "Lon" } as SuggestionsQueryDto);

    expect(service.getSuggestions).toHaveBeenCalledWith("Lon");
    expect(result).toBe(mockSuggestions);
  });
});
