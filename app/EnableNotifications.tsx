"use client";

import { useEffect, useState } from "react";

type Status =
  | "loading"
  | "unsupported"
  | "blocked"
  | "subscribed"
  | "idle"
  | "working"
  | "error";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buffer;
}

export default function EnableNotifications() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("blocked");
      return;
    }
    navigator.serviceWorker.ready
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sub.toJSON()),
          }).catch(() => {});
          setStatus("subscribed");
        } else {
          setStatus("idle");
        }
      })
      .catch(() => setStatus("idle"));
  }, []);

  async function enable() {
    setError(null);
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "idle");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setStatus("error");
        setError("Missing VAPID public key.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      setStatus("subscribed");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  if (status === "loading") return null;

  if (status === "unsupported") {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Notifications aren&apos;t supported in this browser.
      </p>
    );
  }

  if (status === "blocked") {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Notifications blocked. Enable them in your browser settings.
      </p>
    );
  }

  if (status === "subscribed") {
    return (
      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
        ✓ Notifications on
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={enable}
        disabled={status === "working"}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-zinc-900"
      >
        <span aria-hidden>🔔</span>
        <span>
          {status === "working" ? "Enabling…" : "Enable notifications"}
        </span>
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
