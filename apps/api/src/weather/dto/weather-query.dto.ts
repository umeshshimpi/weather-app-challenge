import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import type { TemperatureUnit } from "@weather/domain";

export class WeatherQueryDto {
  @ApiProperty({
    description: "City name to look up",
    example: "London",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "A city name is required" })
  city!: string;

  @ApiProperty({
    description: "Temperature unit",
    enum: ["metric", "imperial"],
    default: "metric",
    required: false,
  })
  @IsOptional()
  @IsEnum(["metric", "imperial"], {
    message: 'units must be either "metric" or "imperial"',
  })
  units?: TemperatureUnit = "metric";
}
