import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class SuggestionsQueryDto {
  @ApiProperty({
    example: "Lon",
    description: "Partial city name — at least 2 characters",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: "Query must be at least 2 characters" })
  q!: string;
}
