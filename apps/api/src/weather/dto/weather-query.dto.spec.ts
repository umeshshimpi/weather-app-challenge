import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { WeatherQueryDto } from "./weather-query.dto";

describe("WeatherQueryDto", () => {
  it("passes validation with a valid city and no units", async () => {
    const dto = plainToInstance(WeatherQueryDto, { city: "London" });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("passes validation with a valid city and explicit units", async () => {
    const dto = plainToInstance(WeatherQueryDto, { city: "Tokyo", units: "imperial" });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("fails validation when city is missing", async () => {
    const dto = plainToInstance(WeatherQueryDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "city")).toBe(true);
  });

  it("fails validation when units is not metric or imperial", async () => {
    const dto = plainToInstance(WeatherQueryDto, { city: "London", units: "kelvin" });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "units")).toBe(true);
  });

  it("trims surrounding whitespace from the city name", () => {
    const dto = plainToInstance(WeatherQueryDto, { city: "  Paris  " });
    expect(dto.city).toBe("Paris");
  });
});
