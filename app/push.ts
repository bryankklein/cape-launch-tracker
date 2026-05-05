import "server-only";
import webpush from "web-push";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SUBSCRIPTIONS_KEY = "push:subscriptions";

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type StoredSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

export type SendResult = {
  sent: number;
  removed: number;
  failed: number;
};

export async function sendNotificationToAll(
  payload: PushPayload,
): Promise<SendResult> {
  configure();

  const subs = await redis.hgetall<Record<string, string>>(SUBSCRIPTIONS_KEY);
  if (!subs) return { sent: 0, removed: 0, failed: 0 };

  let sent = 0;
  let removed = 0;
  let failed = 0;
  const message = JSON.stringify(payload);

  await Promise.all(
    Object.entries(subs).map(async ([endpoint, subValue]) => {
      let sub: StoredSubscription;
      try {
        sub =
          typeof subValue === "string"
            ? (JSON.parse(subValue) as StoredSubscription)
            : (subValue as unknown as StoredSubscription);
      } catch {
        failed += 1;
        return;
      }
      try {
        await webpush.sendNotification(sub, message);
        sent += 1;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await redis.hdel(SUBSCRIPTIONS_KEY, endpoint);
          removed += 1;
        } else {
          failed += 1;
        }
      }
    }),
  );

  return { sent, removed, failed };
}
