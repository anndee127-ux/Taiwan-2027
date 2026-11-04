import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";

const FORECAST_API = "https://api.open-meteo.com/v1/forecast";
const FORECAST_WINDOW_DAYS = 16;
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_PREFIX = "taiwan-2027-weather:";
const inFlightRequests = new Map<string, Promise<ForecastWeather>>();
const inFlightRefreshes = new Map<string, Promise<ForecastWeather | null>>();
const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "precipitation_sum",
  "wind_speed_10m_max",
].join(",");

export interface HistoricalClimate {
  high: number;
  low: number;
  rain: number;
  icon: "sun" | "cloud" | "rain";
}

export interface WeatherLocation {
  destination: string;
  travelDate: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface WeatherForecastProps {
  location: WeatherLocation;
  historical: HistoricalClimate;
}

interface ForecastWeather {
  weatherCode: number;
  high: number;
  low: number;
  rain: number;
  precipitation: number;
  wind: number;
}

interface DisplayWeather {
  condition: string;
  high: number;
  low: number;
  rain: number;
  precipitation?: number;
  wind?: number;
  weatherCode?: number;
  historicalCondition?: HistoricalClimate["icon"];
}

interface WeatherState {
  status: "loading" | "success" | "error";
  mode: "forecast" | "historical";
  data: DisplayWeather | null;
  lastUpdated: number | null;
  error?: string;
  notice?: string;
}

interface ForecastCacheEntry {
  savedAt: number;
  data: ForecastWeather;
}

type RefreshFeedback = "idle" | "updating" | "success" | "error";

function getLocalDate(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isWithinForecastWindow(travelDate: string, timezone: string) {
  const today = Date.parse(`${getLocalDate(timezone)}T00:00:00Z`);
  const tripDay = Date.parse(`${travelDate}T00:00:00Z`);
  const daysAway = Math.round((tripDay - today) / 86_400_000);
  return daysAway >= 0 && daysAway < FORECAST_WINDOW_DAYS;
}

function getWeatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}

function getHistoricalDescription(condition: HistoricalClimate["icon"]) {
  if (condition === "sun") return "Typically warm with mixed sunshine";
  if (condition === "rain") return "Typically cool, misty and rainy";
  return "Typically mild with variable cloud";
}

function WeatherIcon({
  weatherCode,
  historicalCondition,
  className,
}: {
  weatherCode?: number;
  historicalCondition?: HistoricalClimate["icon"];
  className?: string;
}) {
  if (historicalCondition === "sun") return <Sun className={className} />;
  if (historicalCondition === "rain") return <CloudRain className={className} />;
  if (historicalCondition === "cloud") return <CloudSun className={className} />;
  if (weatherCode === undefined) return <Cloud className={className} />;
  if (weatherCode === 0) return <Sun className={className} />;
  if (weatherCode <= 2) return <CloudSun className={className} />;
  if (weatherCode === 3) return <Cloud className={className} />;
  if (weatherCode <= 48) return <CloudFog className={className} />;
  if (weatherCode <= 82) return <CloudRain className={className} />;
  if (weatherCode <= 86) return <CloudSnow className={className} />;
  return <CloudLightning className={className} />;
}

function getCacheKey(location: WeatherLocation) {
  return `${CACHE_PREFIX}${location.latitude},${location.longitude}:${location.travelDate}`;
}

function readCache(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as ForecastCacheEntry;
    if (Date.now() - cached.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: ForecastWeather) {
  const entry: ForecastCacheEntry = { savedAt: Date.now(), data };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // The in-memory component state still prevents repeat requests for this render.
  }
  return entry;
}

function getForecastForDate(daily: any, travelDate: string): ForecastWeather | null {
  if (!daily?.time?.includes(travelDate)) return null;
  const index = daily.time.indexOf(travelDate);
  return {
    weatherCode: daily.weather_code[index],
    high: daily.temperature_2m_max[index],
    low: daily.temperature_2m_min[index],
    rain: daily.precipitation_probability_max[index],
    precipitation: daily.precipitation_sum[index],
    wind: daily.wind_speed_10m_max[index],
  };
}

async function requestForecast(location: WeatherLocation) {
  const key = getCacheKey(location);
  const activeRequest = inFlightRequests.get(key);
  if (activeRequest) return activeRequest;

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: DAILY_FIELDS,
    start_date: location.travelDate,
    end_date: location.travelDate,
    timezone: "auto",
    temperature_unit: "celsius",
    precipitation_unit: "mm",
    wind_speed_unit: "kmh",
  });

  const request = fetch(`${FORECAST_API}?${params}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
      const payload = await response.json();
      const forecast = getForecastForDate(payload.daily, location.travelDate);
      if (!forecast) {
        throw new Error("No forecast is available for this travel date");
      }
      return forecast;
    })
    .finally(() => inFlightRequests.delete(key));

  inFlightRequests.set(key, request);
  return request;
}

async function requestLatestForecastWindow(location: WeatherLocation) {
  const key = `${getCacheKey(location)}:manual-refresh`;
  const activeRequest = inFlightRefreshes.get(key);
  if (activeRequest) return activeRequest;

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: DAILY_FIELDS,
    forecast_days: String(FORECAST_WINDOW_DAYS),
    timezone: "auto",
    temperature_unit: "celsius",
    precipitation_unit: "mm",
    wind_speed_unit: "kmh",
  });

  const request = fetch(`${FORECAST_API}?${params}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
      const payload = await response.json();
      return getForecastForDate(payload.daily, location.travelDate);
    })
    .finally(() => inFlightRefreshes.delete(key));

  inFlightRefreshes.set(key, request);
  return request;
}

function historicalDisplay(historical: HistoricalClimate): DisplayWeather {
  return {
    high: historical.high,
    low: historical.low,
    rain: historical.rain,
    historicalCondition: historical.icon,
    condition: getHistoricalDescription(historical.icon),
  };
}

function formatTravelDate(date: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatUpdatedAt(timestamp: number, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp));
}

export function WeatherForecast({ location, historical }: WeatherForecastProps) {
  const [state, setState] = useState<WeatherState>({
    status: "loading",
    mode: "historical",
    data: null,
    lastUpdated: null,
  });
  const [refreshFeedback, setRefreshFeedback] = useState<RefreshFeedback>("idle");
  const feedbackTimer = useRef<number | null>(null);
  const manualRefreshInFlight = useRef(false);

  const loadWeather = useCallback(
    async (force = false) => {
      const withinForecastWindow = isWithinForecastWindow(location.travelDate, location.timezone);

      if (!withinForecastWindow && !force) {
        setState({
          status: "success",
          mode: "historical",
          data: historicalDisplay(historical),
          lastUpdated: Date.now(),
        });
        return true;
      }

      const key = getCacheKey(location);
      const cached = force ? null : readCache(key);
      if (cached) {
        setState({
          status: "success",
          mode: "forecast",
          data: {
            ...cached.data,
            condition: getWeatherDescription(cached.data.weatherCode),
          },
          lastUpdated: cached.savedAt,
          notice: undefined,
        });
        return true;
      }

      setState((current) => ({
        ...current,
        status: "loading",
        mode: withinForecastWindow ? "forecast" : current.mode,
        error: undefined,
        notice: undefined,
      }));
      try {
        const forecast = withinForecastWindow
          ? await requestForecast(location)
          : await requestLatestForecastWindow(location);

        if (!forecast) {
          setState({
            status: "success",
            mode: "historical",
            data: historicalDisplay(historical),
            lastUpdated: Date.now(),
            notice: "Open-Meteo refreshed successfully. This trip date is not yet inside the 16-day forecast window.",
          });
          return true;
        }

        const cachedForecast = writeCache(key, forecast);
        setState({
          status: "success",
          mode: "forecast",
          data: { ...forecast, condition: getWeatherDescription(forecast.weatherCode) },
          lastUpdated: cachedForecast.savedAt,
          notice: undefined,
        });
        return true;
      } catch (error) {
        setState((current) => ({
          status: "error",
          mode: current.data ? current.mode : "historical",
          data: current.data ?? historicalDisplay(historical),
          lastUpdated: current.lastUpdated,
          error: error instanceof Error ? error.message : "Weather data could not be loaded",
          notice: undefined,
        }));
        return false;
      }
    },
    [
      historical.high,
      historical.icon,
      historical.low,
      historical.rain,
      location.destination,
      location.latitude,
      location.longitude,
      location.timezone,
      location.travelDate,
    ],
  );

  const handleManualRefresh = useCallback(async () => {
    if (manualRefreshInFlight.current) return;
    manualRefreshInFlight.current = true;
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    setRefreshFeedback("updating");

    const succeeded = await loadWeather(true);
    manualRefreshInFlight.current = false;

    if (succeeded) {
      setRefreshFeedback("success");
      feedbackTimer.current = window.setTimeout(() => {
        setRefreshFeedback("idle");
        feedbackTimer.current = null;
      }, 2500);
    } else {
      setRefreshFeedback("error");
    }
  }, [loadWeather]);

  useEffect(() => {
    void loadWeather();
    const eligibilityTimer = window.setInterval(() => void loadWeather(), CACHE_TTL_MS);
    return () => {
      window.clearInterval(eligibilityTimer);
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    };
  }, [loadWeather]);

  if (state.status === "loading" && !state.data) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm" aria-label="Loading weather">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
          <RefreshCw className="size-4 animate-spin text-primary" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  const data = state.data ?? historicalDisplay(historical);
  const isHistorical = state.mode === "historical";

  return (
    <section
      className="w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary via-card to-card p-4 shadow-sm"
      aria-label={`Weather for ${location.destination}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <WeatherIcon
              weatherCode={data.weatherCode}
              historicalCondition={data.historicalCondition}
              className="size-6"
            />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isHistorical ? "bg-chart-1/15 text-chart-1" : "bg-accent/15 text-accent"
                }`}
              >
                {isHistorical ? "Historical April climate · Not a forecast" : "Live forecast"}
              </span>
              {state.status === "loading" && <RefreshCw className="size-3 animate-spin text-primary" />}
            </div>
            <p className="font-semibold text-foreground">{data.condition}</p>
            <p className="truncate text-xs text-muted-foreground">
              {location.destination} · {formatTravelDate(location.travelDate, location.timezone)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void handleManualRefresh()}
          disabled={refreshFeedback === "updating" || state.status === "loading"}
          className={`self-start text-xs transition-opacity disabled:opacity-70 ${
            refreshFeedback === "success"
              ? "text-accent"
              : refreshFeedback === "error"
                ? "text-destructive"
                : ""
          }`}
          aria-label={`Refresh weather for ${location.destination}`}
          aria-live="polite"
        >
          {refreshFeedback === "updating" ? (
            <>
              <RefreshCw className="animate-spin" />
              Updating...
            </>
          ) : refreshFeedback === "success" ? (
            <>
              <Check />
              Updated just now
            </>
          ) : refreshFeedback === "error" ? (
            <>
              <AlertTriangle />
              Update failed. Try again.
            </>
          ) : (
            <>
              <RefreshCw />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card/80 p-3">
          <p className="text-xs text-muted-foreground">High</p>
          <p className="mt-0.5 font-bold text-foreground">{Math.round(data.high)}°C</p>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-3">
          <p className="text-xs text-muted-foreground">Low</p>
          <p className="mt-0.5 font-bold text-foreground">{Math.round(data.low)}°C</p>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Droplets className="size-3 text-primary" /> Rain
          </p>
          <p className="mt-0.5 font-bold text-primary">{Math.round(data.rain)}%</p>
        </div>
      </div>

      {!isHistorical && data.precipitation !== undefined && data.wind !== undefined && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Droplets className="size-3" /> {data.precipitation.toFixed(1)} mm precipitation
          </span>
          <span className="flex items-center gap-1">
            <Wind className="size-3" /> Winds up to {Math.round(data.wind)} km/h
          </span>
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 flex-shrink-0" />
          <span>
            We couldn’t refresh the weather ({state.error}). Showing the most recently available information.
          </span>
        </div>
      )}

      {state.notice && (
        <div className="mt-3 rounded-xl bg-primary/10 p-3 text-xs text-primary">{state.notice}</div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{isHistorical ? "Typical April climate reference" : "Source: Open-Meteo"}</span>
        {state.lastUpdated && (
          <span>
            {isHistorical ? "Checked" : "Last updated"}{" "}
            {formatUpdatedAt(state.lastUpdated, location.timezone)} · local time
          </span>
        )}
      </div>
    </section>
  );
}
