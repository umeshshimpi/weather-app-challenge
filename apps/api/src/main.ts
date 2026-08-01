import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("WeatherNow");

  app.enableCors({ origin: ["http://localhost:5173"] });

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("WeatherNow API")
    .setDescription(
      "Real-time weather conditions and 7-day forecasts for any city."
    )
    .setVersion("1.0")
    .addTag("weather")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(3000);
  logger.log("API running  → http://localhost:3000");
  logger.log("Swagger docs → http://localhost:3000/docs");
}

bootstrap();
