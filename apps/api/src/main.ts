import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

function parseCorsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;
  if (!configured) {
    return ["http://localhost:5173"];
  }

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Weather Forecast");
  const port = Number(process.env.PORT) || 3000;

  app.enableCors({ origin: parseCorsOrigins() });

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Weather Forecast API")
    .setDescription(
      "Real-time weather conditions and 7-day forecasts for any city."
    )
    .setVersion("1.0")
    .addTag("weather")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  // Bind to 0.0.0.0 so container platforms (Railway, Render) can reach the process.
  await app.listen(port, "0.0.0.0");
  logger.log(`API running  → http://localhost:${port}`);
  logger.log(`Swagger docs → http://localhost:${port}/docs`);
}

bootstrap();
