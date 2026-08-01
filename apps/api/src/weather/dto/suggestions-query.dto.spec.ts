import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SuggestionsQueryDto } from "./suggestions-query.dto";

describe("SuggestionsQueryDto", () => {
  it("passes validation with a query of at least 2 characters", async () => {
    const dto = plainToInstance(SuggestionsQueryDto, { q: "Lo" });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("fails validation when the query is shorter than 2 characters", async () => {
    const dto = plainToInstance(SuggestionsQueryDto, { q: "L" });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "q")).toBe(true);
  });

  it("fails validation when the query is missing", async () => {
    const dto = plainToInstance(SuggestionsQueryDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "q")).toBe(true);
  });

  it("trims surrounding whitespace from the query", () => {
    const dto = plainToInstance(SuggestionsQueryDto, { q: "  Lon  " });
    expect(dto.q).toBe("Lon");
  });
});
