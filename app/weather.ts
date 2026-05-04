const CAPE_CANAVERAL_LAT = 28.49;
const CAPE_CANAVERAL_LON = -80.58;
const USER_AGENT = "cape-launch-tracker (https://github.com/bryankklein)";

export type HourlyForecast = {
  startTime: string;
  endTime: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  windSpeed: string;
  windDirection: string;
};

type PointsResponse = {
  properties: { forecastHourly: string };
};

type HourlyResponse = {
  properties: { periods: HourlyForecast[] };
};

export async function getCapeHourlyForecast(): Promise<HourlyForecast[]> {
  const fetchOpts = {
    headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
    next: { revalidate: 1800 },
  };

  const pointsRes = await fetch(
    `https://api.weather.gov/points/${CAPE_CANAVERAL_LAT},${CAPE_CANAVERAL_LON}`,
    fetchOpts,
  );
  if (!pointsRes.ok) {
    throw new Error(`NWS points lookup failed: ${pointsRes.status}`);
  }
  const points = (await pointsRes.json()) as PointsResponse;

  const hourlyRes = await fetch(points.properties.forecastHourly, fetchOpts);
  if (!hourlyRes.ok) {
    throw new Error(`NWS hourly forecast failed: ${hourlyRes.status}`);
  }
  const hourly = (await hourlyRes.json()) as HourlyResponse;
  return hourly.properties.periods;
}

export function findForecastForTime(
  periods: HourlyForecast[],
  iso: string,
): HourlyForecast | null {
  const t = new Date(iso).getTime();
  return (
    periods.find((p) => {
      const start = new Date(p.startTime).getTime();
      const end = new Date(p.endTime).getTime();
      return start <= t && t < end;
    }) ?? null
  );
}
