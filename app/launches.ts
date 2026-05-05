export type Launch = {
  id: string;
  name: string;
  net: string;
  status: { abbrev: string; name: string };
  launch_service_provider: { name: string };
  rocket: {
    configuration: {
      name: string;
      full_name: string;
    };
  };
  mission: { name: string } | null;
  pad: {
    name: string;
    location: { name: string };
  };
  vidURLs?: Array<{
    priority: number;
    source: string;
    publisher: string;
    url: string;
  }>;
};

type LaunchApiResponse = {
  results: Launch[];
};

const API_URL =
  "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?location__ids=12,27&limit=10&mode=detailed";

export async function getUpcomingLaunches(opts?: {
  fresh?: boolean;
}): Promise<Launch[]> {
  const fetchOpts: RequestInit & { next?: { revalidate: number } } = opts?.fresh
    ? { cache: "no-store" }
    : { next: { revalidate: 60 } };

  const res = await fetch(API_URL, fetchOpts);
  if (!res.ok) {
    throw new Error(`Launch API request failed: ${res.status}`);
  }

  const data = (await res.json()) as LaunchApiResponse;
  return data.results;
}
