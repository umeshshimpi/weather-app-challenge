# WeatherNow

Search any city in the world and instantly see current conditions, a 7-day forecast, UV safety advice, dew point, and a smart recommendation ("bring an umbrella", "stay hydrated", etc.). The background colour shifts based on whether it's sunny, rainy, snowy, or a thunderstorm.

Built as a **NestJS API + React/Vite frontend** monorepo. No API keys needed.

---

## Running Locally

**Requires Node.js 18+**

```bash
git clone https://github.com/YOUR_USERNAME/weather-app-challenge.git
cd weather-app-challenge
npm install
npm run dev
```

That's it — two commands after cloning.

| Service | Address |
|---------|---------|
| Web app | http://localhost:5173 |
| REST API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/docs |

---

## Why No API Key?

The app uses [Open-Meteo](https://open-meteo.com), an open-source weather service that requires no registration or credit card. It runs the same meteorological models (NOAA GFS, European ICON) used by professional forecasters, and offers 10,000 free calls per day with a 16-day forecast window — more generous than any of the keyed alternatives.

The direct REST calls to Open-Meteo happen inside the NestJS service. No third-party SDK wraps them.

---

## Project Layout

```
apps/
  api/          NestJS backend — Open-Meteo calls, validation, Swagger
  web/          React + Vite frontend — search UI, weather cards
packages/
  domain/       Shared TypeScript types and pure utility functions
```

### apps/api

```
src/
  main.ts                     Bootstrap: CORS, ValidationPipe, Swagger
  app.module.ts               Root NestJS module
  weather/
    weather.module.ts
    weather.controller.ts     GET /api/weather
    weather.service.ts        Geocoding + forecast fetch + normalisation
    dto/
      weather-query.dto.ts    class-validator DTO (city, units)
    weather.service.spec.ts   Unit tests (Vitest + @nestjs/testing)
```

### apps/web

```
src/
  main.tsx
  App.tsx
  components/
    WeatherDisplay.tsx   State management, fetch, layout
    WeatherSearch.tsx    Search input form
    CurrentWeather.tsx   Main temperature card
    WeatherDetails.tsx   Humidity, wind, pressure, dew point
    ForecastStrip.tsx    7-day forecast grid
  styles/index.css        Tailwind + glassmorphism utilities
```

### packages/domain

Shared between both apps. Contains all TypeScript interfaces (`types.ts`) and pure functions (`weather-utils.ts`). No NestJS or React imports — just logic.

---

## Scripts

```bash
npm run dev          # Start both servers (NestJS + Vite) concurrently
npm run build        # Production build across all workspaces
npm test             # Run all Vitest tests
npm run coverage     # Coverage report
npm run typecheck    # TypeScript check across the monorepo
```

---

## REST API

Interactive documentation is at **http://localhost:3000/docs** (Swagger UI).

### GET /api/weather

| Query param | Required | Default | Description |
|-------------|----------|---------|-------------|
| `city` | Yes | — | City name, e.g. `Tokyo` |
| `units` | No | `metric` | `metric` or `imperial` |

**200 OK**

```json
{
  "location": {
    "name": "Tokyo",
    "country": "Japan",
    "countryCode": "JP",
    "latitude": 35.6895,
    "longitude": 139.6917,
    "region": "Tokyo"
  },
  "current": {
    "temperature": 28,
    "feelsLike": 31,
    "humidity": 74,
    "pressure": 1008,
    "windSpeed": 12,
    "windDirectionLabel": "SE",
    "windGusts": 18,
    "cloudCover": 30,
    "precipitation": 0,
    "weatherCode": 1,
    "description": "Mainly Clear",
    "isDay": true
  },
  "daily": [
    {
      "date": "2026-07-31",
      "maxTemp": 31,
      "minTemp": 24,
      "weatherCode": 2,
      "description": "Partly Cloudy",
      "precipitationSum": 0,
      "precipitationProbability": 15,
      "maxWindSpeed": 20,
      "uvIndexMax": 9,
      "sunrise": "2026-07-31T04:47",
      "sunset": "2026-07-31T18:53"
    }
  ],
  "unit": "metric"
}
```

**Error responses** follow NestJS's standard shape (`statusCode`, `message`, `error`):

| Status | Cause |
|--------|-------|
| 400 | `city` is missing or `units` is not `metric`/`imperial` |
| 404 | City name not recognised by geocoding |
| 502 | Upstream Open-Meteo request failed |

---

## Business Logic

Beyond fetching and displaying raw data, the app derives several additional insights. All of these live in `packages/domain/src/weather-utils.ts` as pure, independently-tested functions:

| Function | What it produces |
|----------|-----------------|
| `getWeatherRecommendation()` | One-line action advice based on conditions + UV (e.g. "Rain forecast — bring an umbrella") |
| `getUvIndexLevel()` | WHO safety tier (Low → Extreme) with protective advice |
| `getTemperatureCategory()` | Human comfort label (Freezing → Hot) |
| `getWindDirectionLabel()` | Converts wind degrees to compass rose (N, NE, E…) |
| `getWeatherGradient()` | Picks a Tailwind gradient for the full-page background based on condition and time of day |
| Dew point (Magnus formula) | Computed in `WeatherDetails` from temperature + humidity, not fetched |

---

## Tests

```
npm test

 ✓ packages/domain/src/__tests__/weather-utils.test.ts   (29 tests)
 ✓ apps/api/src/weather/weather.service.spec.ts           (4 tests)

 Test Files  2 passed
 Tests       33 passed
```

The domain tests cover every pure utility function. The service tests use `@nestjs/testing` to spin up a real NestJS test module and mock `fetch` to verify the success path, city-not-found (404), and both upstream failure paths (502).

---

## Production Notes

A few things already in place and a few that would be added before a real deploy:

| Area | Status |
|------|--------|
| Input validation | `class-validator` DTOs + `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) |
| Error handling | NestJS HTTP exceptions with structured JSON — no raw stack traces leak |
| Secrets | All API calls are server-side; nothing sensitive reaches the browser |
| Structured logging | NestJS `Logger` (replaces `console.log`) |
| Provider swap | Change only `weather.service.ts` to use a different weather API |
| Response caching | Would add `@nestjs/cache-manager` + a short TTL (e.g. 5 min) |
| Rate limiting | Would add `@nestjs/throttler` to the app module |
| Health endpoint | Would add a `GET /health` route for load-balancer checks |
| CI | `npm test` runs clean with no external services needed |

---

## Stack

| | |
|--|--|
| Backend | NestJS 10, TypeScript 5 |
| Frontend | React 19, Vite 6, Tailwind CSS v4 |
| Testing | Vitest 3, @nestjs/testing |
| Weather data | Open-Meteo |
| Runtime | Node.js 18+ |
