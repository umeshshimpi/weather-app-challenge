import {
  Controller,
  Get,
  Query,
} from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { WeatherResponse } from "@weather/domain";
import { WeatherQueryDto } from "./dto/weather-query.dto";
import { WeatherService } from "./weather.service";

@ApiTags("weather")
@Controller("api/weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({
    summary: "Get current weather and 7-day forecast",
    description:
      "Returns real-time conditions and a 7-day forecast for any city worldwide. Powered by Open-Meteo — no API key required.",
  })
  @ApiOkResponse({ description: "Weather data retrieved successfully" })
  @ApiNotFoundResponse({ description: "City not found" })
  getWeather(@Query() query: WeatherQueryDto): Promise<WeatherResponse> {
    return this.weatherService.getWeatherForCity(query.city, query.units ?? "metric");
  }
}
