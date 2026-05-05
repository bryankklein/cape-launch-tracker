import { sendNotificationToAll } from "../../push";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const expected = process.env.TEST_SEND_SECRET;

  if (!expected) {
    return Response.json(
      { error: "Server is missing TEST_SEND_SECRET." },
      { status: 500 },
    );
  }
  if (key !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendNotificationToAll({
    title: "🚀 Cape Launch Tracker test",
    body: "Push notifications are wired up! Real launch alerts coming next.",
    url: "/",
    tag: "test-send",
  });

  return Response.json({ ok: true, ...result });
}
