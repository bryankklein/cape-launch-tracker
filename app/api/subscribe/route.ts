import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SUBSCRIPTIONS_KEY = "push:subscriptions";

type IncomingSubscription = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(request: Request) {
  let body: IncomingSubscription;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await redis.hset(SUBSCRIPTIONS_KEY, {
    [body.endpoint]: JSON.stringify(body),
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.endpoint) {
    return Response.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await redis.hdel(SUBSCRIPTIONS_KEY, body.endpoint);
  return Response.json({ ok: true });
}
