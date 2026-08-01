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
import type { LocationSuggestion, WeatherResponse } from "@weather/domain";
import { SuggestionsQueryDto } from "./dto/suggestions-query.dto";
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
      "Returns real-time conditions and a 7-day forecast for any city worldwide.",
  })
  @ApiOkResponse({ description: "Weather data retrieved successfully" })
  @ApiNotFoundResponse({ description: "City not found" })
  getWeather(@Query() query: WeatherQueryDto): Promise<WeatherResponse> {
    return this.weatherService.getWeatherForCity(query.city, query.units ?? "metric");
  }

  @Get("suggestions")
  @ApiOperation({
    summary: "Autocomplete city name",
    description: "Returns up to 8 matching locations for a partial city name. Minimum 2 characters.",
  })
  @ApiOkResponse({ description: "List of matching locations" })
  getSuggestions(@Query() query: SuggestionsQueryDto): Promise<LocationSuggestion[]> {
    return this.weatherService.getSuggestions(query.q);
  }
}
