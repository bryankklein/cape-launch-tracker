type Launch = {
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
};

type LaunchApiResponse = {
  results: Launch[];
};

async function getUpcomingLaunches(): Promise<Launch[]> {
  const url =
    "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?location__ids=12,27&limit=10";

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Launch API request failed: ${res.status}`);
  }

  const data = (await res.json()) as LaunchApiResponse;
  return data.results;
}

function formatLaunchTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function statusBadgeClasses(abbrev: string): string {
  if (abbrev === "Go") {
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  }
  if (abbrev === "TBD" || abbrev === "TBC") {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  }
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}

function LaunchCard({ launch }: { launch: Launch }) {
  const rocket =
    launch.rocket.configuration.full_name || launch.rocket.configuration.name;
  const mission = launch.mission?.name ?? "Mission TBD";
  const pad = `${launch.pad.name} · ${launch.pad.location.name}`;

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {launch.launch_service_provider.name}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(launch.status.abbrev)}`}
          title={launch.status.name}
        >
          {launch.status.abbrev}
        </span>
      </div>

      <h2 className="text-xl font-bold leading-tight">{rocket}</h2>
      <p className="text-zinc-600 dark:text-zinc-400">{mission}</p>

      <div className="mt-2 space-y-1 text-sm">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Launch </span>
          <span className="text-zinc-900 dark:text-zinc-100">
            {formatLaunchTime(launch.net)}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Pad </span>
          <span className="text-zinc-900 dark:text-zinc-100">{pad}</span>
        </div>
      </div>
    </article>
  );
}

export default async function Home() {
  const launches = await getUpcomingLaunches();

  return (
    <main className="min-h-screen p-6 sm:p-8">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Cape Launch Tracker
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Upcoming rocket launches from Cape Canaveral.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {launches.map((launch) => (
          <LaunchCard key={launch.id} launch={launch} />
        ))}
      </section>
    </main>
  );
}
