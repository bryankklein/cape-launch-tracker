import { Redis } from "@upstash/redis";
import { getUpcomingLaunches, type Launch } from "../../../launches";
import { sendNotificationToAll } from "../../../push";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TRIGGERS = [
  { kind: "t30", offsetMs: 30 * 60 * 1000, label: "30 min" },
  { kind: "t5", offsetMs: 5 * 60 * 1000, label: "5 min" },
] as const;

const WINDOW_AHEAD_MS = 5 * 60 * 1000;
const WINDOW_BACK_MS = 30 * 1000;
const DEDUP_TTL_SECONDS = 24 * 60 * 60;

type FiredEntry = { launch: string; kind: string };

function buildPayload(launch: Launch, label: string) {
  const rocket =
    launch.rocket.configuration.full_name || launch.rocket.configuration.name;
  const mission = launch.mission?.name ?? "Mission TBD";
  return {
    title: `🚀 Launch in ${label} — ${rocket}`,
    body: `${mission} from ${launch.pad.name}`,
    url: "/",
    tag: `launch-${launch.id}-${label}`,
  };
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return Response.json(
      { error: "Server is missing CRON_SECRET." },
      { status: 500 },
    );
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const forceLaunchId = url.searchParams.get("force");

  const launches = await getUpcomingLaunches({ fresh: true });
  const now = Date.now();
  const fired: FiredEntry[] = [];

  if (forceLaunchId) {
    const launch = launches.find((l) => l.id === forceLaunchId);
    if (!launch) {
      return Response.json(
        { error: `No upcoming launch with id ${forceLaunchId}` },
        { status: 404 },
      );
    }
    for (const trigger of TRIGGERS) {
      await sendNotificationToAll(buildPayload(launch, trigger.label));
      fired.push({ launch: launch.id, kind: trigger.kind });
    }
    return Response.json({
      ok: true,
      forced: true,
      checked: 1,
      fired,
    });
  }

  for (const launch of launches) {
    const launchTime = new Date(launch.net).getTime();
    if (Number.isNaN(launchTime)) continue;

    for (const trigger of TRIGGERS) {
      const triggerTime = launchTime - trigger.offsetMs;
      const inWindow =
        triggerTime >= now - WINDOW_BACK_MS &&
        triggerTime < now + WINDOW_AHEAD_MS;
      if (!inWindow) continue;

      const dedupKey = `push:fired:${launch.id}:${trigger.kind}`;
      const wasNew = await redis.set(dedupKey, "1", {
        nx: true,
        ex: DEDUP_TTL_SECONDS,
      });
      if (!wasNew) continue;

      await sendNotificationToAll(buildPayload(launch, trigger.label));
      fired.push({ launch: launch.id, kind: trigger.kind });
    }
  }

  return Response.json({ ok: true, checked: launches.length, fired });
}
